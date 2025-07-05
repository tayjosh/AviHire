import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA98QvCVSyddNRWBQ9fbhj0-aE_FMaBz_s",
  authDomain: "avihire-e2102.firebaseapp.com",
  projectId: "avihire-e2102",
  storageBucket: "avihire-e2102.firebasestorage.app",
  messagingSenderId: "212372485335",
  appId: "1:212372485335:web:84b88251ee9af5250f6c92",
  measurementId: "G-0D0331BJ72"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
