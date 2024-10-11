import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import the correct Firebase Storage method
import ConfigKeys from './config';
import config from "./config";
// Your Firebase config object
const firebaseConfig = {
    apiKey: config().FIREBASE_API_KEY,
    authDomain: config().FIREBASE_AUTH_DOMAIN,
    projectId: config().FIREBASE_PROJECT_ID,
    storageBucket: config().FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config().FIREBASE_MESSAGING_SENDER_ID,
    appId: config().FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app); // This correctly initializes Firebase Storage
