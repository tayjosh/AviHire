"use client";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
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

  onAuthStateChanged(auth, () => {
    const unsubscribe = onAuthStateChanged(auth, (user: import("firebase/auth").User | null) => {
      if (user) {
        const fetchUserData = async () => {
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
        };
        fetchUserData();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      if (remember) await setPersistence(auth, browserLocalPersistence);

      if (mode === "signin") {
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const uid = userCred.user.uid;
        const res = await fetch(`/api/settings?uid=${uid}`);
        if (!res.ok) throw new Error("User data fetch failed");
        const data = await res.json();
        const isBusiness = data.accountType === "business";
        router.push(isBusiness ? "/business/dashboard" : "/user");
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const uid = userCred.user.uid;
        let role = "business";
        let generatedReferralCode = "";
        let referredBy = "";

        if (accountType === "user") {
          if (certNumber) {
            role = "licensed";
            generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          } else {
            role = "unlicensed";
            referredBy = referralCode.trim().toUpperCase();
          }
        }

        await setDoc(doc(db, "users", uid), {
          uid,
          email: trimmedEmail,
          firstName,
          lastName,
          accountType,
          role,
          businessName: accountType === "business" ? businessName : null,
          certificateNumber: certNumber || null,
          referralCode: generatedReferralCode || null,
          referredBy: referredBy || null,
          isVerified: false,
          createdAt: serverTimestamp(),
        });

        router.push(accountType === "business" ? "/business/dashboard" : "/user");
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unable to send reset email.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setMode("signin")}
          className={`px-4 py-2 rounded-md ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >Sign In</button>
        <button
          onClick={() => setMode("signup")}
          className={`px-4 py-2 rounded-md ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >Sign Up</button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === "signup" && (
          <>
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border p-2 rounded" required />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAccountType("user")} className={`w-full rounded p-2 ${accountType === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Aviation Pro</button>
              <button type="button" onClick={() => setAccountType("business")} className={`w-full rounded p-2 ${accountType === "business" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Business</button>
            </div>
            {accountType === "user" && (
              <>
                <input type="text" placeholder="Certificate Number (optional)" value={certNumber} onChange={(e) => setCertNumber(e.target.value)} className="w-full border p-2 rounded" />
                <input type="text" placeholder="Referral Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="w-full border p-2 rounded" />
              </>
            )}
            {accountType === "business" && (
              <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border p-2 rounded" required />
            )}
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" required />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} /> Remember me
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {resetSent && <p className="text-green-600 text-sm">Password reset link sent.</p>}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </button>

        {mode === "signin" && (
          <button type="button" onClick={handleResetPassword} className="text-sm text-blue-600 hover:underline mt-2">
            Forgot password?
          </button>
        )}
      </form>
    </div>
  );
}
