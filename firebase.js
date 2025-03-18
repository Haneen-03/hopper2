// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config from Step 5
const firebaseConfig = {
    apiKey: "AIzaSyAhMAWPjlIuxjDn322-Ssyw0LxLZzl_hqk",
    authDomain: "hope-2006d.firebaseapp.com",
    projectId: "hope-2006d",
    storageBucket: "hope-2006d.firebasestorage.app",
    messagingSenderId: "915445001622",
    appId: "1:915445001622:web:8c5e43d846b9bfeeaf01b7",
    measurementId: "G-R2XNT63WET"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };