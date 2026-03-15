// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5ImqSA3LIUShEcZ7KoS0AbyybW4tFC0o",
  authDomain: "ailogger-6dfcd.firebaseapp.com",
  projectId: "ailogger-6dfcd",
  storageBucket: "ailogger-6dfcd.firebasestorage.app",
  messagingSenderId: "467855763774",
  appId: "1:467855763774:web:a86a9388f3e932e9bde46f",
  measurementId: "G-9PVH1RNM1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
