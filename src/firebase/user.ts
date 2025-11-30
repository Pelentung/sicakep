'use client';

import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FirestoreError } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";
import { FirestorePermissionError } from "./errors";
import { errorEmitter } from "@/lib/events";
import { v4 as uuidv4 } from 'uuid';

export interface UserProfileData {
    email: string;
    displayName: string;
    photoURL: string;
    phone: string;
    createdAt?: any;
    photoPath?: string; // To store the path of the photo in storage
}

// Create a new user document in Firestore
export const createUserDocument = async (uid: string, data: Omit<UserProfileData, 'createdAt' | 'photoPath'>) => {
  const userDocRef = doc(db, 'users', uid);
  const userProfile: Omit<UserProfileData, 'photoPath'> = {
    ...data,
    createdAt: serverTimestamp(),
  };
  try {
    await setDoc(userDocRef, userProfile);
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: userDocRef.path,
        requestResourceData: userProfile
      }));
    } else {
        console.error("Error creating user document:", error);
    }
    // No re-throw, emitter handles it.
  }
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const userDocRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    } else {
      console.warn("User profile document does not exist for uid:", uid);
      return null;
    }
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'get',
        path: userDocRef.path
      }));
    } else {
        console.error("Error getting user profile:", error);
    }
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
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'update',
                path: userDocRef.path,
                requestResourceData: data,
            }));
        } else {
            console.error("Error updating user profile:", error);
        }
        // Do not re-throw, let the emitter handle it.
    }
};

// Upload profile picture and get URL
export const uploadProfilePicture = async (uid: string, file: File): Promise<{ downloadURL: string; filePath: string }> => {
    // Limit file size to 1MB
    if (file.size > 1 * 1024 * 1024) {
        throw new Error("Ukuran file tidak boleh melebihi 1MB.");
    }
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `users/${uid}/profilePictures/${fileName}`;
    const storageRef = ref(storage, filePath);

    try {
        // Upload new picture first
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return { downloadURL, filePath };
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw new Error("Gagal mengunggah gambar. Pastikan Anda memiliki izin yang benar.");
    }
};

export const deleteOldProfilePicture = async (photoPath: string) => {
    if (!photoPath) return;

    const oldPhotoRef = ref(storage, photoPath);
    try {
        await deleteObject(oldPhotoRef);
    } catch (error: any) {
        // It's okay if the old file doesn't exist, log other errors
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete old profile picture:", error);
        }
    }
};