'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<"user" | "business">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear old error

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (accountType === "user") {
      if (!certNumber && !referralCode) {
        setError("Enter a certificate number or referral code.");
        return;
      }
      if (!acknowledged) {
        setError("You must acknowledge the FAA certificate verification policy.");
        return;
      }
    }

    if (accountType === "business" && !businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      let role = "business";
      let generatedReferralCode = "";
      let referredBy = "";

      if (accountType === "user") {
        if (certNumber) {
          role = "licensed";
          generatedReferralCode = generateReferralCode();
        } else {
          role = "unlicensed";
          referredBy = referralCode.trim().toUpperCase();
        }
      }

      await setDoc(doc(db, "users", uid), {
        uid,
        firstName,
        lastName,
        email,
        accountType,
        role,
        businessName: accountType === "business" ? businessName.trim() : null,
        certificateNumber: certNumber || null,
        referralCode: generatedReferralCode || null,
        referredBy: referredBy || null,
        isVerified: false,
        createdAt: serverTimestamp(),
      });

      router.push(accountType === "business" ? "/business/dashboard" : "/user");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(
        errorMessage.includes("auth/email-already-in-use")
          ? "This email is already registered. Try logging in."
          : errorMessage || "Unknown error"
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Create an Account</h1>

      <div className="flex justify-center mb-6 gap-4">
        <button
          type="button"
          onClick={() => setAccountType("user")}
          className={`px-4 py-2 rounded-md ${
            accountType === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Aviation Professional
        </button>
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={`px-4 py-2 rounded-md ${
            accountType === "business"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Business
        </button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          className="w-full border p-2 rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          className="w-full border p-2 rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {accountType === "business" && (
          <input
            type="text"
            placeholder="Business Name"
            className="w-full border p-2 rounded"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        )}

        {accountType === "user" && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">FAA Certificate Info</h2>
            <input
              type="text"
              placeholder="Certificate Number (optional if using referral code)"
              className="w-full border p-2 rounded mb-2"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Referral Code (get this from a verified A&P)"
              className="w-full border p-2 rounded mb-2"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <label className="text-sm flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={() => setAcknowledged(!acknowledged)}
                className="mt-1"
              />
              <span>
                I understand AviHire does not store FAA certificate data. This is
                used only for real-time verification.
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              AviHire respects your privacy. FAA certificate information is used
              one time for verification and is never stored, logged, or shared.
            </p>
          </div>
        )}

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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
