'use client';

import { FaPlane } from 'react-icons/fa';

export default function PlaneLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <FaPlane
        size={50}
        className="text-blue-600 animate-spin-slow transform rotate-[45deg]"
      />
    </div>
  );
}
