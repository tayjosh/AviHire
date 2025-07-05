'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';

type Job = {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  timestamp?: { seconds: number; nanoseconds?: number };
};

export default function JobDetailPage() {
  const params = useParams();
  // ensure we have a string, never an array
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;

  const [user] = useAuthState(auth);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!idParam) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const jobRef = doc(db, 'jobs', idParam);
        const snap = await getDoc(jobRef);
        if (snap.exists()) {
          setJob(snap.data() as Job);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam]);

  const handleApply = async () => {
    if (!user || !job || !idParam) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: idParam,
        jobTitle: job.title,
        name: applicantName,
        email: applicantEmail,
        coverLetter,
        userId: user.uid,
        timestamp: new Date(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading job...</div>;
  if (!job) return <div className="p-6">Job not found.</div>;

  const postedDate = job.timestamp
    ? new Date(job.timestamp.seconds * 1000).toLocaleDateString()
    : 'Unknown';

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <p className="text-gray-600 mb-1">{job.company}</p>
      <p className="text-gray-500 mb-4">{job.location}</p>
      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
        {job.type}
      </span>
      <p className="text-sm text-gray-400 mt-2">Posted: {postedDate}</p>

      <hr className="my-6" />

      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
        {job.description}
      </p>

      <div className="mt-8">
        {user ? (
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm"
          >
            Apply Now
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            <Link href={`/signin?redirect=/job/${idParam}`} className="text-blue-600 hover:underline">
              Sign in
            </Link>{' '}
            to apply.
          </p>
        )}
      </div>

      <Dialog
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
        <Dialog.Panel className="bg-white w-full max-w-md p-6 rounded shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-bold">Apply for {job.title}</Dialog.Title>
          <input
            type="text"
            placeholder="Your Name"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <textarea
            placeholder="Cover Letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            rows={4}
          />
          <div className="flex justify-between">
            <button
              onClick={() => setShowApplyModal(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={submitting || !applicantName || !applicantEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit'}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </main>
  );
}
