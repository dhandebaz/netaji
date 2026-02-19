
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoliticianBySlug, getAllPoliticians, fetchAndCacheNewsForPolitician } from '../services/dataService';
import { DollarSign, Gavel, GraduationCap, FileText, ArrowLeftRight } from 'lucide-react';
import VoteModal from '../components/VoteModal';
import ClaimProfileModal from '../components/ClaimProfileModal';
import { fetchPoliticianImage } from '../services/scraperService';
import { generatePoliticianInsights, PoliticianInsights, isAIAvailable } from '../services/geminiService';
import { NewsItem, Politician } from '../types';
import { motion } from 'framer-motion';

import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileTabs from '../components/profile/ProfileTabs';

const PoliticianProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [politician, setPolitician] = useState<Politician | undefined>(undefined);
  
  useEffect(() => {
    if (slug) {
      const found = getPoliticianBySlug(slug);
      setPolitician(found);
    }
  }, [slug]);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [voteType, setVoteType] = useState<'up' | 'down'>('up');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [displayPhoto, setDisplayPhoto] = useState('');
  const [insights, setInsights] = useState<PoliticianInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (politician) {
        setDisplayPhoto(politician.photoUrl);
        if (politician.mynetaId && politician.electionSlug) {
            fetchPoliticianImage(politician.electionSlug, politician.mynetaId)
                .then(url => { if (url && url !== politician.photoUrl) setDisplayPhoto(url); })
                .catch(err => console.debug("Failed to auto-fetch image", err));
        }
    }
  }, [politician]);

  useEffect(() => {
    if (politician && activeTab === 'News') {
      setLoadingNews(true);
      fetchAndCacheNewsForPolitician(politician.id).then(setNews).finally(() => setLoadingNews(false));
    }
    if (politician && activeTab === 'Overview' && !insights && !loadingInsights && isAIAvailable()) {
        setLoadingInsights(true);
        generatePoliticianInsights(politician)
            .then(setInsights)
            .catch(err => console.error(err))
            .finally(() => setLoadingInsights(false));
    }
  }, [politician, activeTab, insights]);

  if (!politician) return <div className="min-h-screen flex items-center justify-center text-slate-500">Politician not found</div>;

  const voteTotal = politician.votes.up + politician.votes.down;
  const upPercent = Math.round((politician.votes.up / voteTotal) * 100);

  const handleVoteClick = (type: 'up' | 'down') => { setVoteType(type); setIsVoteModalOpen(true); };
  
  const handleCompare = () => {
    const allPoliticians = getAllPoliticians();
    const others = allPoliticians.filter(p => p.id !== politician.id).slice(0, 2).map(p => p.id);
    navigate(`/compare?ids=${politician.id},${others.join(',')}`);
  };
  
  const myNetaUrl = politician.mynetaId && politician.electionSlug ? `https://www.myneta.info/${politician.electionSlug}/candidate.php?candidate_id=${politician.mynetaId}` : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR (Refactored) */}
          <ProfileSidebar 
             politician={politician}
             displayPhoto={displayPhoto}
             voteTotal={voteTotal}
             upPercent={upPercent}
             onVote={handleVoteClick}
             onClaim={() => setIsClaimModalOpen(true)}
             onBack={() => navigate('/')}
          />

          {/* RIGHT CONTENT */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
               <StatCard icon={<DollarSign />} label="Assets" value={`₹${politician.totalAssets} Cr`} color="bg-emerald-100 text-emerald-800" />
               <StatCard icon={<Gavel />} label="Criminal Cases" value={politician.criminalCases.toString()} color="bg-red-100 text-red-800" />
               <StatCard icon={<GraduationCap />} label="Education" value={politician.education.split(' ')[0]} color="bg-blue-100 text-blue-800" />
               <StatCard icon={<FileText />} label="Attendance" value={`${politician.attendance}%`} color="bg-purple-100 text-purple-800" />
            </div>

            {/* Content Tabs (Refactored) */}
            <ProfileTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                politician={politician}
                insights={insights}
                loadingInsights={loadingInsights}
                news={news}
                loadingNews={loadingNews}
                myNetaUrl={myNetaUrl}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCompare}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/20 flex items-center gap-3 font-bold"
      >
          <ArrowLeftRight size={20} /> Compare
      </motion.button>

      <VoteModal isOpen={isVoteModalOpen} onClose={() => setIsVoteModalOpen(false)} politician={politician} voteType={voteType} />
      <ClaimProfileModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} politician={politician} />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className={`p-4 rounded-2xl ${color} flex flex-col items-center text-center border border-white/20`}>
    <div className="mb-2 opacity-80">{React.cloneElement(icon, { size: 24 })}</div>
    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{label}</p>
    <p className="text-lg font-black leading-tight">{value}</p>
  </div>
);

export default PoliticianProfile;
