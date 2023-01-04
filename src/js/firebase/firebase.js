import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "alert-app-firebase.firebaseapp.com",
  projectId: "alert-app-firebase",
  storageBucket: "alert-app-firebase.appspot.com",
  messagingSenderId: "1028585873154",
  appId: "1:1028585873154:web:cb53c4991857412e372c1b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const firestore = getFirestore();
export const storage = getStorage();



