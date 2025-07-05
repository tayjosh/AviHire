'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function PostAdPage() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [tier, setTier] = useState<'regular' | 'premium'>('regular');

  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return alert('You must be signed in.');

    const adId = uuidv4();
    const postData = {
      title,
      location,
      company,
      url,
      jobType,
      tier,
      isPaid: tier === 'premium' ? false : true,
      isApproved: false,
      createdAt: new Date(),
      businessId: user.uid,
    };

    await setDoc(doc(db, 'jobAds', adId), postData);

    if (tier === 'premium') {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ adId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
      return;
    }

    alert('Ad submitted!');
    router.push('/dashboard/business');
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Post a Job Ad</h1>

      <input
        type="text"
        placeholder="Job Title"
        className="w-full mb-3 p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        className="w-full mb-3 p-2 border rounded"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Company Name"
        className="w-full mb-3 p-2 border rounded"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        type="url"
        placeholder="External Job Application URL"
        className="w-full mb-3 p-2 border rounded"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <label className="block font-medium mb-1">Job Type</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
      >
        <option>Full-time</option>
        <option>Contract</option>
        <option>Temporary</option>
      </select>

      <label className="block font-medium mb-1">Ad Tier</label>
      <select
        className="w-full mb-2 p-2 border rounded"
        value={tier}
        onChange={(e) => setTier(e.target.value as 'regular' | 'premium')}
      >
        <option value="regular">Regular (Free)</option>
        <option value="premium">Premium (Top listing - $25/7 days)</option>
      </select>

      {tier === 'premium' && (
        <div className="text-sm text-gray-600 mb-4">
          Premium ads are <strong>$25</strong> and stay pinned for <strong>7 days</strong> at the top of job results.
          You’ll be redirected to payment after submitting.
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Submit Ad
      </button>
    </main>
  );
}
