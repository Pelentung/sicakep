import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

// Function to get the current user data from Firestore
export const getUser = async (db: Firestore, userId: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

// Function to update the user data in Firestore
export const updateUser = (db: Firestore, userId: string, newUser: Partial<UserProfile>) => {
  const userDocRef = doc(db, 'users', userId);
  // We use non-blocking update for better UI experience
  updateDocumentNonBlocking(userDocRef, newUser);
};

// Function to create a user profile if it doesn't exist
export const createUserProfile = (db: Firestore, userId: string, data: Omit<UserProfile, 'id'>) => {
    const userDocRef = doc(db, 'users', userId);
    const profileData = {
        id: userId,
        ...data,
    };
    // Use set with merge to create or update without overwriting
    setDocumentNonBlocking(userDocRef, profileData, { merge: true });
}
