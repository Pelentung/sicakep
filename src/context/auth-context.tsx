'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { signUp as signUpApi, login as loginApi, logout as logoutApi, type UserProfileData } from '@/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserData> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfileData;
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...profileData
        };
    }
    // Fallback if firestore doc doesn't exist for some reason
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
        const fullUserData = await fetchUserProfile(firebaseUser);
        setUser(fullUserData);
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
        const fullUserData = await fetchUserProfile(currentUser);
        setUser(fullUserData);
        setLoading(false);
    }
  }, [fetchUserProfile]);


  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
        await signUpApi(email, password, displayName);
        // onAuthStateChanged will handle setting the user
    } catch(error) {
        setLoading(false);
        throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        await loginApi(email, password);
        // onAuthStateChanged will handle setting the user
    } catch(error) {
        setLoading(false);
        throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await logoutApi();
    // onAuthStateChanged will set user to null and clear data
  };

  const value = { user, loading, signUp, login, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
