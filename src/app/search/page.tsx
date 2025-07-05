'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/firebaseConfig';
import {
  collection,
  getDocs,
  DocumentData,
} from 'firebase/firestore';

type Job = {
  id: string;
  title: string;
  location: string;
  company: string;
  description: string;
  type: string;
  timestamp: { seconds: number }; // Firestore timestamp
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('query')?.toLowerCase() || '';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      const results: Job[] = [];

      const now = Date.now() / 1000;

      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;

        const matchSearch =
          data.title?.toLowerCase().includes(searchTerm) ||
          data.location?.toLowerCase().includes(searchTerm) ||
          data.company?.toLowerCase().includes(searchTerm);

        const matchLocation = locationFilter
          ? data.location?.toLowerCase().includes(locationFilter.toLowerCase())
          : true;

        const matchType = typeFilter ? data.type === typeFilter : true;

        const matchDate = dateFilter
          ? (now - data.timestamp?.seconds || 0) <=
            (dateFilter === '24h' ? 86400 : dateFilter === '7d' ? 604800 : 2592000)
          : true;

        if (matchSearch && matchLocation && matchType && matchDate) {
          results.push({ id: doc.id, ...data } as Job);
        }
      });

      // Most recent first
      results.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

      setJobs(results);
      setLoading(false);
    };

    fetchJobs();
  }, [searchTerm, locationFilter, typeFilter, dateFilter]);

  const loadMore = () => setVisibleCount(prev => prev + 5);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for: &quot;{searchTerm}&quot;
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by location"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">All Types</option>
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
        </select>
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">Any Date</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      {/* Job Results */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found. Try different filters.</p>
      ) : (
        <div className="space-y-4">
          {jobs.slice(0, visibleCount).map(job => (
            <div
              key={job.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div
                onClick={() => router.push(`/job/${job.id}`)}
                className="cursor-pointer"
              >
                <h2 className="font-semibold text-lg text-gray-800">
                  {job.title}
                </h2>
                <p className="text-gray-600">
                  {job.company} • {job.location}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  {job.description.slice(0, 100)}...
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {job.type}
                </span>
              </div>
            </div>
          ))}

          {visibleCount < jobs.length && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
