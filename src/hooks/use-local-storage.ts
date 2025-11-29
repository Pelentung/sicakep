"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/context/auth-context';

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const { user } = useAuth();
  // Prefix the key with the user's UID to create separate storage for each user
  const userKey = user ? `${user.uid}-${key}` : key;

  const [storedValue, setStoredValue] = useState<T>(() => {
    // Prevent build errors from trying to access window
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(userKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(userKey, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Re-fetch from localStorage when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const item = window.localStorage.getItem(userKey);
            setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            console.error(error);
            setStoredValue(initialValue);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  return [storedValue, setValue];
}

export { useLocalStorage };
