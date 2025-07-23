// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseAuth from 'firebase/auth';
// import { getReactNativePersistence, initializeAuth } from "firebase/auth/react-native";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration

const initializeAuth = firebaseAuth.initializeAuth
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MSG_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
// const app = getApps().length == 0 ? initializeApp(firebaseConfig) : getApp();
let app;
if(getApps().length == 0){
  app = initializeApp(firebaseConfig)
  console.log("Firebase api key:", firebaseConfig.apiKey)
}else{
  app = getApp()
  console.log("Firebase:", app)
}

//auth
export const auth = initializeAuth(app, {
  persistence: reactNativePersistence(AsyncStorage)
})

//db
export const firestore = getFirestore(app);