import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

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
  await setDoc(userDocRef, userProfile);
  return userProfile;
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const userDocRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfileData;
  } else {
    return null;
  }
};

// Update a user's profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfileData>) => {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
};
