'server-only';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseServerServices = {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
};

// This function should only be called on the server.
export function initializeServerSideFirebase(): FirebaseServerServices {
  if (!getApps().length) {
    try {
      // Try to initialize with App Hosting env vars
      const app = initializeApp();
      return {
        firebaseApp: app,
        firestore: getFirestore(app),
      };
    } catch (e) {
       if (process.env.NODE_ENV === "production") {
        console.warn('Automatic server initialization failed. Falling back to firebase config object.', e);
      }
      // Fallback to config for local dev or other environments
      const app = initializeApp(firebaseConfig);
      return {
        firebaseApp: app,
        firestore: getFirestore(app),
      };
    }
  }

  // If already initialized, return the existing instances.
  const app = getApp();
  return {
    firebaseApp: app,
    firestore: getFirestore(app),
  };
}
