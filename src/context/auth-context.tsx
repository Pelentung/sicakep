'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { signUp as signUpApi, login as loginApi, logout as logoutApi, type UserProfileData } from '@/firebase/auth';
import { doc, getDoc, FirestoreError, collection, query, where, getDocs } from 'firebase/firestore';
import { FirestorePermissionError, OperationType } from '@/firebase/errors';
import { errorEmitter } from '@/lib/events';

export interface UserData extends UserProfileData {
    uid: string;
    email: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithToken?: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserData> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfileData;
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...profileData
            };
        }
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            const customError = new FirestorePermissionError(
                OperationType.READ,
                userDocRef
            );
            errorEmitter.emit('permission-error', customError);
        }
        // Rethrow to signal that profile fetching failed
        throw error;
    }
    // Fallback if firestore doc doesn't exist (e.g., after signup but before doc creation)
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'No Name',
        photoURL: firebaseUser.photoURL || '',
        phone: firebaseUser.phoneNumber || ''
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const fullUserData = await fetchUserProfile(firebaseUser);
            setUser(fullUserData);
        } catch (error) {
            console.error("Failed to fetch user profile after auth state change:", error);
            setUser({ 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Error Loading Profile',
                photoURL: firebaseUser.photoURL || '',
                phone: ''
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);
  
  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        setLoading(true);
        try {
            const fullUserData = await fetchUserProfile(currentUser);
            setUser(fullUserData);
        } catch (error) {
            console.error("Failed to refresh user:", error);
        } finally {
            setLoading(false);
        }
    }
  }, [fetchUserProfile]);


  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
        await signUpApi(email, password, displayName);
    } catch(error) {
        setLoading(false);
        throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        await loginApi(email, password);
    } catch(error) {
        setLoading(false);
        throw error;
    }
  };

  // This is a mock for the prototype. In a real app, a secure server would generate this token.
  const loginWithToken = async (email: string) => {
      setLoading(true);
      try {
          // In a real app:
          // 1. Your server verifies the WebAuthn assertion.
          // 2. Your server finds the user's UID from the assertion.
          // 3. Your server uses the Firebase Admin SDK to create a custom token: `admin.auth().createCustomToken(uid)`
          // 4. Your server sends the token back to the client.
          // 5. The client calls `signInWithCustomToken(auth, token)`.
          
          // MOCK: Find user UID by email in Firestore (INSECURE, for prototype only)
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
              throw new Error("User not found for WebAuthn login.");
          }
          const userDoc = querySnapshot.docs[0];
          const uid = userDoc.id;

          // MOCK: Create a fake token. THIS IS NOT A REAL FIREBASE TOKEN.
          const fakeToken = `mock-token-for-uid-${uid}`;
          console.warn("Using a mock token for WebAuthn. This is not secure and for prototype only.");

          // This will fail with a real Firebase backend, but it demonstrates the flow.
          // To make it work, you'd need a server endpoint to generate a real custom token.
          await signInWithCustomToken(auth, fakeToken).catch(async (err) => {
              console.error("signInWithCustomToken failed. This is expected without a real server.", err.message);
              console.log("Simulating successful login locally.");
              
              // Since custom token fails without a server, manually set user state
              const firebaseUser = { uid, email } as User;
              const fullUserData = await fetchUserProfile(firebaseUser);
              setUser(fullUserData);
              setLoading(false);
          });

      } catch (error) {
          setLoading(false);
          throw error;
      }
  };

  const logout = async () => {
    setLoading(true);
    await logoutApi();
    // onAuthStateChanged will set user to null
  };

  const value = { user, loading, signUp, login, logout, refreshUser, loginWithToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
