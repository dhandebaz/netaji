'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Gavel, GraduationCap, FileText, ArrowLeftRight } from 'lucide-react';
import VoteModal from '@components/VoteModal';
import ClaimProfileModal from '@components/ClaimProfileModal';
import { NewsItem, Politician } from '@types';
import { motion } from 'framer-motion';
import ProfileSidebar from '@components/profile/ProfileSidebar';
import ProfileTabs from '@components/profile/ProfileTabs';

type Props = {
  slug: string;
};

const ProfileClient: React.FC<Props> = ({ slug }) => {
  const router = useRouter();
  const [politician, setPolitician] = useState<Politician | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [voteType, setVoteType] = useState<'up' | 'down'>('up');
  const [news] = useState<NewsItem[]>([]);
  const [displayPhotoOverride] = useState('');
  const [insights] = useState<null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadPolitician = async () => {
      try {
        const res = await fetch(`/api/politicians/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          setPolitician(undefined);
          return;
        }
        const data = await res.json();
        setPolitician(data as Politician);
      } catch {
        setPolitician(undefined);
      }
    };

    loadPolitician();
  }, [slug]);

  useEffect(() => {
    if (!politician) return;
    if (activeTab !== 'News') return;
    if (news.length > 0) return;
  }, [politician, activeTab, news.length]);

  if (!politician) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Politician not found
      </div>
    );
  }

  const voteTotal = politician.votes.up + politician.votes.down;
  const upPercent = Math.round((politician.votes.up / voteTotal) * 100);

  const displayPhoto = displayPhotoOverride || politician.photoUrl;
  const loadingNews = activeTab === 'News' && politician != null && news.length === 0;
  const loadingInsights =
    activeTab === 'Overview' && politician != null && !insights;

  const handleVoteClick = (type: 'up' | 'down') => {
    setVoteType(type);
    setIsVoteModalOpen(true);
  };

  const handleCompare = () => {
    router.push(`/compare?ids=${politician.id}`);
  };

  const myNetaUrl =
    politician.mynetaId && politician.electionSlug
      ? `https://www.myneta.info/${politician.electionSlug}/candidate.php?candidate_id=${politician.mynetaId}`
      : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProfileSidebar
            politician={politician}
            displayPhoto={displayPhoto}
            voteTotal={voteTotal}
            upPercent={upPercent}
            onVote={handleVoteClick}
            onClaim={() => setIsClaimModalOpen(true)}
            onBack={() => router.push('/')}
          />

          <div className="w-full lg:w-2/3 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                icon={<DollarSign />}
                label="Assets"
                value={`₹${politician.totalAssets} Cr`}
                color="bg-emerald-100 text-emerald-800"
              />
              <StatCard
                icon={<Gavel />}
                label="Criminal Cases"
                value={politician.criminalCases.toString()}
                color="bg-red-100 text-red-800"
              />
              <StatCard
                icon={<GraduationCap />}
                label="Education"
                value={politician.education.split(' ')[0]}
                color="bg-blue-100 text-blue-800"
              />
              <StatCard
                icon={<FileText />}
                label="Attendance"
                value={`${politician.attendance}%`}
                color="bg-purple-100 text-purple-800"
              />
            </div>

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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCompare}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/20 flex items-center gap-3 font-bold"
      >
        <ArrowLeftRight size={20} /> Compare
      </motion.button>

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        politician={politician}
        voteType={voteType}
      />
      <ClaimProfileModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        politician={politician}
      />
    </div>
  );
};

type StatCardProps = {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  value: string;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-2xl ${color} flex flex-col items-center text-center border border-white/20`}>
    <div className="mb-2 opacity-80">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{label}</p>
    <p className="text-lg font-black leading-tight">{value}</p>
  </div>
);

export default ProfileClient;
