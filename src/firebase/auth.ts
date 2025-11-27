'use client';

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, serverTimestamp, FirestoreError } from "firebase/firestore";
import { FirestorePermissionError, OperationType } from "./errors";
import { errorEmitter } from "@/lib/events";

export interface UserProfileData {
    displayName: string;
    photoURL: string;
    phone: string;
}

export const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userProfileData = {
        displayName: displayName,
        email: user.email,
        photoURL: '',
        phone: '',
        createdAt: serverTimestamp()
    };

    try {
        await setDoc(userDocRef, userProfileData);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            const customError = new FirestorePermissionError(
                OperationType.CREATE,
                userDocRef,
                userProfileData
            );
            errorEmitter.emit('permission-error', customError);
        }
        // Re-throw the original error so the UI knows the signup failed overall
        throw error;
    }


    return user;
};

export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return await signOut(auth);
};
