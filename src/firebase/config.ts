'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJzSwI5fn_OOqnqplprJh4WBkvj07KV1I",
  authDomain: "studio-4511486487-e215b.firebaseapp.com",
  projectId: "studio-4511486487-e215b",
  storageBucket: "studio-4511486487-e215b.appspot.com",
  messagingSenderId: "701374603275",
  appId: "1:701374603275:web:f5714d0137fe42ac76e70e"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inisialisasi Analytics hanya di sisi klien (browser) dan jika didukung
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
