// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6uBvwWieqIFYg35ZB_257HNHG2-fl1oI",
  authDomain: "pelentung.firebaseapp.com",
  projectId: "pelentung",
  storageBucket: "pelentung.firebasestorage.app",
  messagingSenderId: "1033413513485",
  appId: "1:1033413513485:web:39bc7dfc137f91cf4ee044",
  measurementId: "G-1R686RLZ7J"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inisialisasi Analytics hanya di sisi klien (browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
