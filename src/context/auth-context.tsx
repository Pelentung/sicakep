'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { signUp as signUpFirebase, login as loginFirebase, logout as logoutFirebase } from '@/firebase/auth';
import { getUserProfile, updateUserProfile } from '@/firebase/user';

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phone: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Omit<UserData, 'uid' | 'photoURL' | 'email'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in, get profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: profile?.displayName || firebaseUser.displayName,
          photoURL: profile?.photoURL || firebaseUser.photoURL,
          phone: profile?.phone || null,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    return signUpFirebase(email, password, displayName);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return loginFirebase(email, password);
  }, []);

  const logout = useCallback(async () => {
    await logoutFirebase();
  }, []);
  
  const updateUser = useCallback(async (updates: Partial<Omit<UserData, 'uid' | 'photoURL' | 'email'>>) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const { uid } = auth.currentUser;
    
    // Prepare data for Firestore and Firebase Auth updates.
    const firestoreUpdates: { [key: string]: any } = { ...updates };
    const authUpdates: { displayName?: string } = {};

    if (updates.displayName) {
        authUpdates.displayName = updates.displayName;
    }

    // Perform updates.
    await Promise.all([
        updateUserProfile(uid, firestoreUpdates),
        Object.keys(authUpdates).length > 0 ? updateFirebaseProfile(auth.currentUser, authUpdates) : Promise.resolve(),
    ]);

    // Update local state.
    setUser(prevUser => prevUser ? { ...prevUser, ...firestoreUpdates, ...authUpdates } : null);

  }, []);

  const value: AuthContextType = { user, loading, signUp, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
