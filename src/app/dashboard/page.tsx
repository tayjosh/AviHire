'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter }                     from 'next/navigation';
import { useAuthState }                  from 'react-firebase-hooks/auth';
import { auth, db }                      from '@/firebase/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
}                                        from 'firebase/firestore';
import Link                              from 'next/link';
import PlaneLoader                       from '@/components/PlaneLoader';

interface JobAd {
  id: string;
  title: string;
  location: string;
  jobType: string;
  tier: 'regular' | 'premium';
  createdAt: Timestamp;
}

export default function BusinessDashboard() {
  // ─────── State & Hooks (in fixed order) ───────
  const [ads, setAds]                 = useState<JobAd[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showActive, setShowActive]   = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [roleVerified, setRoleVerified] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [user, userLoading] = useAuthState(auth);
  const router              = useRouter();

  // ─────── Fetch Ads ───────
  const fetchAds = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const q        = query(collection(db, 'jobAds'), where('businessId', '==', user.uid));
    const snapshot = await getDocs(q);
    const list     = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<JobAd, 'id'>) }));
    setAds(list);
    setLoading(false);
  }, [user]);

  // ─────── Verify Role ───────
  useEffect(() => {
    (async () => {
      if (!user && !userLoading) {
        router.push('/signin');
        return;
      }

      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists() || snap.data().role !== 'business') {
          router.push('/');
          return;
        }
        setRoleVerified(true);
      }

      setCheckingRole(false);
    })();
  }, [user, userLoading, router]);

  // ─────── Load Ads Once Role Verified ───────
  useEffect(() => {
    if (roleVerified) fetchAds();
  }, [roleVerified, fetchAds]);

  // ─────── Top-level Loading Guard ───────
  if (userLoading || checkingRole || loading) {
    return <PlaneLoader />;
  }
  if (!roleVerified) {
    return null;
  }

  // ─────── Filter Ads ───────
  const now    = Timestamp.now();
  const WEEK   = 7 * 24 * 60 * 60;
  const isActive = (ad: JobAd) =>
    ad.tier === 'premium'
      ? now.seconds - ad.createdAt.seconds < WEEK
      : true;

  const currentAds = ads.filter(isActive);
  const premiumAds = currentAds.filter(ad => ad.tier === 'premium');
  const expiredAds = ads.filter(ad => ad.tier === 'premium' && !isActive(ad));

  // ─────── Render ───────
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex gap-6">
        <aside className="w-1/4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-lg mb-3">Ad Summary</h2>

            <div>
              <button
                onClick={() => setShowActive(v => !v)}
                className="w-full text-left font-medium"
              >
                🟢 Active Ads ({currentAds.length}) {showActive ? '▲' : '▼'}
              </button>
              {showActive && (
                <ul className="pl-4 text-sm mt-1 space-y-1">
                  {currentAds.map(ad => (
                    <li key={ad.id}>• {ad.title}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowPremium(v => !v)}
                className="w-full text-left font-medium"
              >
                🔥 Hot Jobs ({premiumAds.length}) {showPremium ? '▲' : '▼'}
              </button>
              {showPremium && (
                <ul className="pl-4 text-sm mt-1 space-y-1">
                  {premiumAds.map(ad => (
                    <li key={ad.id}>• {ad.title}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowExpired(v => !v)}
                className="w-full text-left font-medium"
              >
                🔴 Expired Ads ({expiredAds.length}) {showExpired ? '▲' : '▼'}
              </button>
              {showExpired && (
                <ul className="pl-4 text-sm mt-1 space-y-1">
                  {expiredAds.map(ad => (
                    <li key={ad.id}>• {ad.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Business Dashboard</h1>
            <Link
              href="/dashboard/business/post-ad"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post a New Ad
            </Link>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Current Ads</h2>
            {currentAds.length === 0 ? (
              <p>No active ads yet.</p>
            ) : (
              <ul className="space-y-3">
                {currentAds.map(ad => (
                  <li key={ad.id} className="border rounded p-4">
                    <div className="font-bold">{ad.title}</div>
                    <div className="text-sm text-gray-600">
                      {ad.location} • {ad.jobType} • {ad.tier.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ad.tier === 'premium'
                        ? 'Hot Job expires 7 days after posting.'
                        : 'Regular ad'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
