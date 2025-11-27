'use client';

import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FirestoreError } from "firebase/firestore";
import { db } from "./config";
import { FirestorePermissionError, OperationType } from "./errors";
import { errorEmitter } from "@/lib/events";


export interface UserProfileData {
    displayName: string;
    photoURL: string;
    phone: string;
    createdAt?: any;
}

// Create a new user document in Firestore
export const createUserDocument = async (uid: string, email: string, displayName: string) => {
  const userDocRef = doc(db, 'users', uid);
  const userProfile: UserProfileData = {
    displayName,
    photoURL: '',
    phone: '',
    createdAt: serverTimestamp(),
  };
  try {
    await setDoc(userDocRef, userProfile);
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
      errorEmitter.emit('permission-error', new FirestorePermissionError(OperationType.CREATE, userDocRef, userProfile));
    }
    throw error;
  }
  return userProfile;
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const userDocRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
      errorEmitter.emit('permission-error', new FirestorePermissionError(OperationType.READ, userDocRef));
    }
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Update a user's profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfileData>) => {
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, data);
    } catch (error) {
      if (error instanceof FirestoreError && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError(OperationType.UPDATE, userDocRef, data));
      }
      // Do not re-throw the error here, let the emitter handle it.
      // This will prevent the generic error from being caught by the UI.
    }
};
