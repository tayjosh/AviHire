// components/AdSummary.tsx
'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

export interface JobAd {
  id: string;
  title: string;
  tier: 'regular' | 'premium';
  createdAt: Timestamp;
}

interface AdSummaryProps {
  ads: JobAd[];
}

export default function AdSummary({ ads }: AdSummaryProps) {
  const [showActive, setShowActive] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const now = Timestamp.now();
  const WEEK = 7 * 24 * 60 * 60; // 7 days in seconds

  const isPremiumActive = (ad: JobAd) =>
    ad.tier === 'premium' ? now.seconds - ad.createdAt.seconds < WEEK : true;

  const currentAds = ads.filter(isPremiumActive);
  const premiumAds = currentAds.filter((ad) => ad.tier === 'premium');
  const expiredAds = ads.filter((ad) => !isPremiumActive(ad) && ad.tier === 'premium');

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold text-lg mb-3">Ad Summary</h2>

      <div>
        <button
          onClick={() => setShowActive((v) => !v)}
          className="w-full text-left font-medium"
        >
          🟢 Active Ads ({currentAds.length}) {showActive ? '▲' : '▼'}
        </button>
        {showActive && (
          <ul className="pl-4 text-sm mt-1 space-y-1">
            {currentAds.map((ad) => (
              <li key={ad.id}>• {ad.title}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setShowPremium((v) => !v)}
          className="w-full text-left font-medium"
        >
          🔥 Hot Jobs ({premiumAds.length}) {showPremium ? '▲' : '▼'}
        </button>
        {showPremium && (
          <ul className="pl-4 text-sm mt-1 space-y-1">
            {premiumAds.map((ad) => (
              <li key={ad.id}>• {ad.title}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setShowExpired((v) => !v)}
          className="w-full text-left font-medium"
        >
          🔴 Expired Ads ({expiredAds.length}) {showExpired ? '▲' : '▼'}
        </button>
        {showExpired && (
          <ul className="pl-4 text-sm mt-1 space-y-1">
            {expiredAds.map((ad) => (
              <li key={ad.id}>• {ad.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
