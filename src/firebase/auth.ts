'use client';

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    AuthError
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, serverTimestamp, FirestoreError } from "firebase/firestore";
import { FirestorePermissionError } from "./errors";
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
    try {
        await updateProfile(user, { displayName });
    } catch (error) {
        // Handle potential errors from updateProfile, though permission errors are less common here
        console.error("Error updating Auth profile:", error);
        // We can choose to throw or handle it gracefully
    }
    

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
            const customError = new FirestorePermissionError({
                operation: 'create',
                path: userDocRef.path,
                requestResourceData: userProfileData,
            });
            errorEmitter.emit('permission-error', customError);
        }
        // Do not re-throw the error, let the emitter handle it.
        // This allows the signup flow to continue but still reports the permission issue.
    }


    return user;
};

export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return await signOut(auth);
};
