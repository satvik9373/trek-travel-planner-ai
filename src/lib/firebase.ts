// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC00raofjptIP5LaOroSOQeV85sjM6Ym84",
  authDomain: "trek-2025.firebaseapp.com",
  projectId: "trek-2025",
  storageBucket: "trek-2025.firebasestorage.app",
  messagingSenderId: "1002181373055",
  appId: "1:1002181373055:web:0275b447cb8b10f3c0e34a",
  measurementId: "G-5P1FLLQKYN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;