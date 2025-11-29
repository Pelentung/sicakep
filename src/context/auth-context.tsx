'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { signUp as signUpApi, login as loginApi, logout as logoutApi } from '@/firebase/auth';
import { getUserProfile, type UserProfileData } from '@/firebase/user';

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

  const fetchFullUserData = useCallback(async (firebaseUser: User): Promise<UserData> => {
    // getUserProfile handles its own permission errors
    const profileData = await getUserProfile(firebaseUser.uid);
    
    // Fallback if firestore doc doesn't exist or fails to fetch
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: profileData?.displayName || firebaseUser.displayName || 'No Name',
        photoURL: profileData?.photoURL || firebaseUser.photoURL || '',
        phone: profileData?.phone || firebaseUser.phoneNumber || ''
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const fullUserData = await fetchFullUserData(firebaseUser);
            setUser(fullUserData);
        } catch (error) {
            console.error("Failed to fetch user profile after auth state change:", error);
            // Don't set user to null, but maybe a state with an error
            // For now, we set a minimal user object to avoid breaking the UI completely
            setUser({ 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: 'Error Loading Profile',
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
  }, [fetchFullUserData]);
  
  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        setLoading(true);
        try {
            const fullUserData = await fetchFullUserData(currentUser);
            setUser(fullUserData);
        } catch (error) {
            console.error("Failed to refresh user:", error);
        } finally {
            setLoading(false);
        }
    }
  }, [fetchFullUserData]);


  const signUp = async (email: string, password: string, displayName: string) => {
    // signUpApi will throw an error on failure, which will be caught by the UI component
    await signUpApi(email, password, displayName);
    // onAuthStateChanged will handle setting the user state
  };

  const login = async (email: string, password: string) => {
    // loginApi will throw an error on failure, which will be caught by the UI component
    await loginApi(email, password);
     // onAuthStateChanged will handle setting the user state
  };

  const logout = async () => {
    await logoutApi();
    // onAuthStateChanged will set user to null
  };

  const value: AuthContextType = { user, loading, signUp, login, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
