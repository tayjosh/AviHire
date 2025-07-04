"use client";
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountType, setAccountType] = useState<"user" | "business">("user");
  const [certNumber, setCertNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user && mode !== "signup") {
        try {
          const res = await fetch(`/api/settings?uid=${user.uid}`);
          if (!res.ok) throw new Error("Failed to fetch user data.");
          const data = await res.json();
          const isBusiness = data.accountType === "business";
          router.push(isBusiness ? "/business/dashboard" : "/user");
        } catch (err) {
          console.error("Post-login fetch error:", err);
          setError("Something went wrong loading your profile.");
        }
      }
    });
    return () => unsubscribe();
  }, [router, mode]);
