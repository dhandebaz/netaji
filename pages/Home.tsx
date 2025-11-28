
import React, { useState, useEffect, useMemo } from 'react';
import StateLocator from '../components/home/StateLocator';
import ReverseLeaderboard from '../components/home/ReverseLeaderboard';
import { getAllPoliticians, getPoliticiansByState, dataSyncEvents } from '../services/dataService';
import { Politician } from '../types';

const Home: React.FC = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const allPoliticians = getAllPoliticians();
    setPoliticians(allPoliticians);
    setIsLoading(false);
    
    // Listen for real-time data updates from admin panel
    const unsubscribe = dataSyncEvents.on('politiciansUpdated', (updatedPoliticians: Politician[]) => {
      console.log('[Home] Politicians updated from admin panel:', updatedPoliticians.length);
      setPoliticians(updatedPoliticians);
    });
    
    return () => {
      // Cleanup: Remove event listener
      window.removeEventListener('neta:politiciansUpdated', unsubscribe as any);
    };
  }, []);

  const displayedPoliticians = useMemo(() => {
    if (selectedState) {
      return getPoliticiansByState(selectedState);
    }
    return politicians;
  }, [politicians, selectedState]);

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
                  <h2 className="text-2xl font-black text-slate-900">Performance Index</h2>
                  <p className="text-slate-500">
                    Politicians ranked by public approval (Lowest First).
                    {selectedState && <span className="ml-2 text-indigo-600">Showing: {selectedState}</span>}
                  </p>
              </div>
              <ReverseLeaderboard politicians={displayedPoliticians} isLoading={isLoading} />
          </div>
      </section>
    </div>
  );
};

export default Home;
