"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// A function to get the initial value from localStorage or return the initialValue
function getStorageValue<T>(key: string, initialValue: T): T {
    // Prevent build errors from trying to access window
    if (typeof window === 'undefined') {
        return initialValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error(error);
        return initialValue;
    }
}


export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => getStorageValue(key, initialValue));

    // Effect to update localStorage when the state changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            }
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    // Effect to update the state if the key changes (e.g., user logs in/out)
    useEffect(() => {
        setStoredValue(getStorageValue(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [storedValue, setStoredValue];
}
