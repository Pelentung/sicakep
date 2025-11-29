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
    // This can also fail with permission errors if not handled, but it's less common.
    // For now, we focus on Firestore which is the source of the persistent issue.
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore.
    await createUserDocument(user.uid, user.email || email, displayName);

    return user;
};

export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return await signOut(auth);
};
