// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz3jVp4bB8P-MMI-0XsTHiD_RLgpAnh0E",
  authDomain: "villagevault-b9ac4.firebaseapp.com",
  projectId: "villagevault-b9ac4",
  storageBucket: "villagevault-b9ac4.firebasestorage.app",
  messagingSenderId: "152709101749",
  appId: "1:152709101749:web:0da5130fe8cf879790a6fc",
  measurementId: "G-40JK8WNH3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
