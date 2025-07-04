"use client";
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: import("firebase/auth").User | null) => {
      if (user) {
        const res = await fetch(`/api/settings?uid=${user.uid}`);
        const data = await res.json();
        const isBusiness = data.accountType === "business";
        router.push(isBusiness ? "/business/dashboard" : "/user");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (remember) {
        await setPersistence(auth, browserLocalPersistence);
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const res = await fetch(`/api/settings?uid=${uid}`);
      const data = await res.json();
      const isBusiness = data.accountType === "business";
      router.push(isBusiness ? "/business/dashboard" : "/user");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unable to send reset email.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSignIn} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          Remember me
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {resetSent && (
          <p className="text-green-600 text-sm">
            Password reset link sent to your email.
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={handleResetPassword}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
