'use client';

import React, { useEffect, useState } from 'react';
import StateLocator from '@components/home/StateLocator';
import ReverseLeaderboard from '@components/home/ReverseLeaderboard';
import type { Politician } from '@types';

const HomeClient: React.FC = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/politicians?limit=50');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          setPoliticians(list as Politician[]);
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchByState = async () => {
      if (!selectedState) return;

      setIsLoading(true);
        try {
          const res = await fetch(`/api/politicians?state=${encodeURIComponent(selectedState)}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
            setPoliticians(list as Politician[]);
          }
      } catch (e) {
        console.error(`Failed to fetch politicians for ${selectedState}:`, e);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedState) {
      fetchByState();
    }
  }, [selectedState]);

  const displayedPoliticians = politicians;
  const handleStateSelect = (state: string) => {
    setSelectedState(state);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <section className="relative pt-32 pb-12 px-4 mesh-gradient">
        <div className="max-w-4xl mx-auto relative z-10">
          <StateLocator onStateSelect={handleStateSelect} />
        </div>
      </section>

      <section className="px-4 md:px-8 pb-20 max-w-7xl mx-auto w-full -mt-6 z-20 relative">
        <div className="glass-panel rounded-[40px] p-8 md:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900">
              Performance Index
            </h2>
            <p className="text-slate-500">
              Politicians ranked by public approval (Lowest First).
              {selectedState && (
                <span className="ml-2 text-indigo-600">
                  Showing: {selectedState}
                </span>
              )}
            </p>
          </div>
          <ReverseLeaderboard
            politicians={displayedPoliticians}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
};

export default HomeClient;
