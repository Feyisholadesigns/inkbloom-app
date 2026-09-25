import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD57nvT3i-5s93Epo2zKeE1TAkC6bBGYVY",
  authDomain: "readwrite-app.firebaseapp.com",
  projectId: "readwrite-app",
  storageBucket: "readwrite-app.firebasestorage.app",
  messagingSenderId: "853396031917",
  appId: "1:853396031917:web:324affa2c7752fbc0a3924"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);