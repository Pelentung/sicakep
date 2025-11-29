'use client';

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { createUserDocument } from "./user";

export const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore. This is critical for security rules.
    await createUserDocument(user.uid, {
        displayName,
        email: user.email || email,
        photoURL: '',
        phone: '',
    });

    return user;
};

export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return await signOut(auth);
};
