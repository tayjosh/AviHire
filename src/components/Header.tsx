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
  const [searchTerm, setSearchTerm] = useState('');
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
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
      setMobileMenuOpen(false); // close menu on mobile
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between flex-wrap">
        {/* Logo + Mobile Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" onClick={closeMenu}>
            <Image
              src="/avihirelogo.png"
              alt="AviHire Logo"
              width={140}
              height={32}
              className="w-28 md:w-36 h-auto cursor-pointer"
              priority
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* SEARCH (Visible on all screen sizes) */}
        <form
          onSubmit={handleSearch}
          className={`w-full md:max-w-md mt-2 md:mt-0 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}
        >
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-md text-sm"
          />
        </form>

        {/* Menu Section */}
        <div className={`w-full md:w-auto md:flex items-center space-y-2 md:space-y-0 md:space-x-3 mt-2 md:mt-0 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          {!loading && user ? (
            <>
              {userName && (
                <span className="md:inline text-sm text-gray-600 dark:text-gray-300 block">
                  Hi, {userName.split(' ')[0]}
                </span>
              )}
              <Link
                href={role === 'business' ? '/dashboard/business' : '/dashboard/user'}
                onClick={closeMenu}
                className="text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 block"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700 block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" onClick={closeMenu} className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 block">
                Sign In
              </Link>
              <Link href="/signup" onClick={closeMenu} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 block">
                Sign Up
              </Link>
            </>
          )}

          <Link
            href={user && role === 'business' ? '/dashboard/business' : '/signin'}
            onClick={closeMenu}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 block"
          >
            Post a Job
          </Link>

          <button onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
        </div>
      </nav>
    </header>
  );
}
