// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration


// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MSG_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyD8NRUZ2p1qDKNpRYwTcwR_kjKrsnqBOME",
  authDomain: "expense-tracker-38aeb.firebaseapp.com",
  projectId: "expense-tracker-38aeb",
  storageBucket: "expense-tracker-38aeb.firebasestorage.app",
  messagingSenderId: "358709824642",
  appId: "1:358709824642:web:e23945c55ca0a03b59f89b"
};
// Initialize Firebase
// const app = getApps().length == 0 ? initializeApp(firebaseConfig) : getApp();
let app;
if(getApps().length == 0){
  app = initializeApp(firebaseConfig)
}else{
  app = getApp()
}

// if(!getApps().length){
//   initializeApp(firebaseConfig)
// }
//auth
export const auth = initializeAuth(app, {
  persistence:getReactNativePersistence(AsyncStorage)
})

//db
export const firestore = getFirestore(app);