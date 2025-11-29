'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_USERS_STORAGE_KEY = 'fake-users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UserData | null>('auth-user', null);
  const [fakeUsers, setFakeUsers] = useLocalStorage<Record<string, any>>(FAKE_USERS_STORAGE_KEY, {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    setLoading(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (fakeUsers[email]) {
          reject(new Error("Email sudah digunakan."));
        } else {
          setFakeUsers(prev => ({
            ...prev,
            [email]: { email, password, displayName, photoURL: '', phone: '' }
          }));
          resolve();
        }
      }, 500);
    });
  }, [fakeUsers, setFakeUsers]);

  const login = useCallback(async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
       setTimeout(() => {
        const storedUser = fakeUsers[email];
        if (storedUser && storedUser.password === password) {
          const loggedInUser: UserData = {
            uid: `local-${email}`,
            email,
            displayName: storedUser.displayName,
            photoURL: storedUser.photoURL || '',
            phone: storedUser.phone || '',
          };
          setUser(loggedInUser);
          resolve();
        } else {
          reject(new Error("Email atau password salah."));
        }
      }, 500);
    });
  }, [fakeUsers, setUser]);

  const logout = useCallback(async () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setUser(null);
            resolve();
        }, 300);
    });
  }, [setUser]);
  
  const updateUser = useCallback(async (updates: Partial<UserData>) => {
     return new Promise<void>((resolve) => {
       setTimeout(() => {
        if (user && user.email) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            
            const storedUser = fakeUsers[user.email];
            if (storedUser) {
                setFakeUsers(prev => ({
                    ...prev,
                    [user.email!]: { ...storedUser, ...updates }
                }));
            }
            resolve();
        }
       }, 500);
     });
  }, [user, setUser, fakeUsers, setFakeUsers]);

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
