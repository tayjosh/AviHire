'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'business'>('user');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: accountType,
        createdAt: new Date(),
      });

      // ✅ Redirect logic based on role
      if (accountType === 'user') {
        router.push('/');
      } else {
        router.push('/dashboard/business');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Create an Account</h1>

      {/* Account Type */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="user"
            checked={accountType === 'user'}
            onChange={() => setAccountType('user')}
          /> User
        </label>
        <label>
          <input
            type="radio"
            value="business"
            checked={accountType === 'business'}
            onChange={() => setAccountType('business')}
          /> Business
        </label>
      </div>

      {/* Name Field */}
      <input
        type="text"
        placeholder="Full Name"
        className="w-full mb-2 p-2 border"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Email + Password */}
      <input
        type="email"
        placeholder="Email"
        className="w-full mb-2 p-2 border"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 p-2 border"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignUp}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Sign Up
      </button>
    </main>
  );
}
