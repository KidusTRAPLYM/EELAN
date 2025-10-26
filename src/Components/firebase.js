import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDojwBSPttCvHhami_Wh3b1UZnxgVX-kcQ",
  authDomain: "ciphree-db088.firebaseapp.com",
  projectId: "ciphree-db088",
  storageBucket: "ciphree-db088.firebasestorage.app",
  messagingSenderId: "933685625481",
  appId: "1:933685625481:web:9f1c60f92e44977486fc58",
  measurementId: "G-Q1RSW9KEPF",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
