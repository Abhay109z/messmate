// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// 1. ADD THIS IMPORT FOR AUTH
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyAbk2KQfe26ZUYNXRZZ0xI-ZnEtS4M-FeY",
  authDomain: "messmate-188da.firebaseapp.com", // Ensure your hosting domain is added in Firebase Console > Auth > Settings
  projectId: "messmate-188da",
  storageBucket: "messmate-188da.firebasestorage.app",
  messagingSenderId: "219413367251",
  appId: "1:219413367251:web:bb74b16e5a9c57d121c726",
  measurementId: "G-41MCTG8G7Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. EXPORT THE DATABASE
export const db = getFirestore(app);

// 3. EXPORT THE AUTHENTICATION (Crucial for Login)
export const auth = getAuth(app);