
import React, { useState, useEffect, useMemo } from 'react';
import StateLocator from '../components/home/StateLocator';
import ReverseLeaderboard from '../components/home/ReverseLeaderboard';
import { getAllPoliticians, dataSyncEvents } from '../services/dataService';
import { getPoliticians } from '../services/apiService';
import { Politician } from '../types';
import { Helmet } from 'react-helmet-async';
import { getSystemSettings } from '../services/adminService';

const Home: React.FC = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const initialData = getAllPoliticians();
        if (initialData.length > 0) {
            setPoliticians(initialData);
        } else {
            // Fallback to API if local is empty
            const res = await getPoliticians({ limit: 50 }); // Fetch top 50
            const data = Array.isArray(res) ? res : (res.data || []);
            setPoliticians(data);
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
    
    // Listen for real-time data updates from admin panel
    const unsubscribe = dataSyncEvents.on('politiciansUpdated', (updatedPoliticians: Politician[]) => {
      // If we are filtering by state, we might need to re-fetch or filter this list
      // For simplicity, we update the local state if no specific state is selected or merge logic is complex
      // Here we just update if no state selected, or if we want to keep local sync
      if (!selectedState) {
          setPoliticians(updatedPoliticians);
      }
    });
    
    return () => {
      // Cleanup: Remove event listener
      // @ts-ignore
      if (dataSyncEvents.off) dataSyncEvents.off('politiciansUpdated', unsubscribe);
    };
  }, []);

  // Fetch when state changes
  useEffect(() => {
    const fetchByState = async () => {
        if (!selectedState) return;
        
        setIsLoading(true);
        try {
            const res = await getPoliticians({ state: selectedState });
            const data = Array.isArray(res) ? res : (res.data || []);
            setPoliticians(data);
        } catch (e) {
            console.error(`Failed to fetch politicians for ${selectedState}:`, e);
            // Fallback to local filtering
            const all = getAllPoliticians();
            setPoliticians(all.filter(p => p.state === selectedState));
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedState) {
        fetchByState();
    } else {
        // Reset to all (or initial cached)
        setPoliticians(getAllPoliticians());
    }
  }, [selectedState]);

  const displayedPoliticians = politicians;
  const seoSettings = getSystemSettings().seo || {};
  const baseTitle = seoSettings.defaultTitle || 'Neta – Know Your Leader';
  const baseDescription =
    seoSettings.defaultDescription ||
    'Neta is India’s citizen dashboard for MPs and MLAs. Track criminal records, assets, RTI impact, and real-time public sentiment for every representative.';
  const canonicalUrl = 'https://neta.ink/';

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>{baseTitle}</title>
        <meta name="description" content={baseDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={baseTitle} />
        <meta property="og:description" content={baseDescription} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
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
