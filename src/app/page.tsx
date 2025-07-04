'use client';
import { useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState('');
  const locations = ['Miami, FL', 'Dallas, TX', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA'];

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* SPONSOR BANNERS WITH EFFECTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            className="h-28 border rounded-xl shadow flex items-center justify-center text-xl font-semibold text-gray-700
            bg-gradient-to-r from-gray-100 via-white to-gray-100
            bg-[length:300%] hover:animate-shimmer
            hover:-translate-y-1 hover:scale-105 transition-all duration-300
            hover:ring-4 hover:ring-blue-300 hover:ring-opacity-50"
          >
            Sponsor Banner {id}
          </div>
        ))}
      </section>

      {/* TWO-COLUMN JOB DISPLAY */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: HOT JOBS */}
        <div>
          <h2 className="text-xl font-bold mb-4">🔥 Hot Aviation Jobs</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="border rounded-lg p-3 shadow-sm hover:shadow-md transition text-sm"
              >
                <h3 className="font-semibold mb-1 text-gray-800">A&P Mechanic – Dallas, TX</h3>
                <p className="text-gray-500 mb-1">Permanent • Delta</p>
                <p className="text-gray-700 mb-2">
                  Long-term role. Housing assistance available.
                </p>
                <button className="text-blue-600 hover:underline text-xs">View Job</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: JOBS IN YOUR AREA */}
        <div>
          <h2 className="text-xl font-bold mb-4">📍 Jobs in Your Area</h2>

          {/* SEARCH WITH DROPDOWN */}
          <div className="mb-6">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city or airport"
              className="w-full border px-3 py-2 rounded-md text-sm mb-2"
            />
            <div className="bg-white border rounded-md max-h-40 overflow-y-auto">
              {locations
                .filter((loc) => loc.toLowerCase().includes(location.toLowerCase()))
                .map((loc, i) => (
                  <div
                    key={i}
                    onClick={() => setLocation(loc)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {loc}
                  </div>
                ))}
            </div>
          </div>

          {/* FILTERED JOBS */}
          <div className="space-y-4">
            {[1, 2].map((id) => (
              <div
                key={id}
                className="border rounded-lg p-3 shadow-sm hover:shadow-md transition text-sm"
              >
                <h3 className="font-semibold mb-1 text-gray-800">Avionics Tech – {location || 'Your City'}</h3>
                <p className="text-gray-500 mb-1">Contract • Local Operator</p>
                <p className="text-gray-700 mb-2">
                  Must be local or willing to relocate. Great pay.
                </p>
                <button className="text-blue-600 hover:underline text-xs">View Job</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
