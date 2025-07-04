import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA98QvCVSyddNRWBQ9fbhj0-aE_FMaBz_s",
  authDomain: "avihire-e2102.firebaseapp.com",
  projectId: "avihire-e2102",
  storageBucket: "avihire-e2102.appspot.com",
  messagingSenderId: "212372485335",
  appId: "1:212372485335:web:your-app-id-goes-here" // 🔧 replace this with actual App ID from Firebase console
};

// Prevent re-init on hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
