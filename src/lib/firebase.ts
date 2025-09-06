// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOv25CVjWkNcuuAejJqImEqfNKMM_AdaI",
  authDomain: "sage-bj4i9.firebaseapp.com",
  projectId: "sage-bj4i9",
  storageBucket: "sage-bj4i9.firebasestorage.app",
  messagingSenderId: "379852576655",
  appId: "1:379852576655:web:7e6f33053fc98e960cddfa"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
