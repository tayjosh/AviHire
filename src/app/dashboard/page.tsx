'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRole(data.role);
          setUserName(data.name || null);
        }
      } else {
        setRole(null);
        setUserName(null);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLogout = async () => {
    await signOut(auth);
    alert('You have been signed out.');
    router.push('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/avihirelogo.png"
              alt="AviHire Logo"
              width={150}
              height={40}
              priority
              className="cursor-pointer"
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center space-x-8">
          <Link href="/about" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          {!loading && user ? (
            <>
              {userName && (
                <span className="hidden md:inline-block text-sm font-medium text-gray-600 dark:text-gray-300">
                  Welcome, {userName.split(' ')[0]}
                </span>
              )}
              <Link
                href={role === 'business' ? '/dashboard/business' : '/dashboard/user'}
                className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden md:inline-block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {!loading && user ? (
            <Link
              href="/dashboard/business"
              className="hidden md:inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Post a Job
            </Link>
          ) : (
            <Link
              href="/signin"
              className="hidden md:inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Post a Job
            </Link>
          )}

          <button onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
