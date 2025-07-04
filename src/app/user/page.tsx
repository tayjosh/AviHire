'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from "firebase/auth";
// and use: (user: FirebaseUser)

import { doc, getDoc } from 'firebase/firestore';

type UserData = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'user' | 'business';
  role: 'licensed' | 'unlicensed' | 'business';
  referralCode?: string;
  referredBy?: string;
  isVerified: boolean;
};

export default function UserPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/signin');
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!userData) return <p className="text-center mt-20">User data not found.</p>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.push('/')} className="text-blue-600 underline">← Home</button>
        <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Log Out</button>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>

      <div className="space-y-2 text-sm">
        <p><strong>Full Name:</strong> {userData.firstName} {userData.lastName}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Account Type:</strong> {userData.accountType}</p>
        <p><strong>Role:</strong> {userData.role}</p>
        {userData.referralCode && (
          <p><strong>Your Referral Code:</strong> <span className="font-mono">{userData.referralCode}</span></p>
        )}
        {userData.referredBy && (
          <p><strong>Referred By:</strong> {userData.referredBy}</p>
        )}
        <p><strong>FAA Verified:</strong>{' '}
          <span className={userData.isVerified ? 'text-green-600' : 'text-yellow-600'}>
            {userData.isVerified ? '✅ Verified' : '❌ Not Verified'}
          </span>
        </p>
      </div>
    </div>
  );
}
