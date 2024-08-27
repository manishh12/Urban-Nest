// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-80335.firebaseapp.com",
  projectId: "mern-estate-80335",
  storageBucket: "mern-estate-80335.appspot.com",
  messagingSenderId: "402598537158",
  appId: "1:402598537158:web:7055f566ce8f69a84bb4c7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
