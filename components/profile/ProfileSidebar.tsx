
import React from 'react';
import { CheckCircle, Share2, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Politician } from '../../types';
import ImageWithFallback from '../ImageWithFallback';

interface Props {
    politician: Politician;
    displayPhoto: string;
    voteTotal: number;
    upPercent: number;
    onVote: (type: 'up' | 'down') => void;
    onClaim: () => void;
    onBack: () => void;
}

const ProfileSidebar: React.FC<Props> = ({ 
    politician, displayPhoto, voteTotal, upPercent, onVote, onClaim, onBack 
}) => {
    return (
        <div className="w-full lg:w-1/3 lg:sticky lg:top-28 lg:h-fit space-y-6">
            
            <button onClick={onBack} className="lg:hidden mb-4 flex items-center text-slate-500 font-medium gap-2">
                <ArrowLeft size={18} /> Back to Search
            </button>

            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
               {/* Header Background */}
               <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50 to-transparent z-0"></div>

               <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-40 h-40 mb-4 rounded-[32px] overflow-hidden shadow-lg ring-4 ring-white bg-white"
                  >
                    <ImageWithFallback src={displayPhoto} alt={politician.name} className="w-full h-full object-cover" />
                  </motion.div>
                  
                  <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 mb-1 tracking-tight leading-tight">
                    {politician.name}
                    {politician.verified && <CheckCircle className="text-blue-500 fill-blue-50" size={24} />}
                  </h1>
                  <p className="text-blue-600 font-bold text-lg mb-6 bg-blue-50 px-4 py-1 rounded-full">{politician.party} • {politician.constituency}</p>

                  <div className="w-full grid grid-cols-2 gap-3 mb-6">
                     <button onClick={() => onVote('up')} className="bg-green-50 text-green-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all active:scale-95">
                        <ThumbsUp size={20} /> Support
                     </button>
                     <button onClick={() => onVote('down')} className="bg-red-50 text-red-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95">
                        <ThumbsDown size={20} /> Oppose
                     </button>
                  </div>

                  <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Approval</span>
                       <span className={`text-3xl font-black ${upPercent > 50 ? 'text-green-600' : 'text-red-600'}`}>{upPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000 ease-out" style={{width: `${upPercent}%`}}></div>
                    </div>
                    <p className="text-[10px] text-right text-slate-400 mt-2 font-medium">{voteTotal.toLocaleString()} verified citizen votes</p>
                  </div>

                  <div className="flex gap-2 w-full">
                     <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-transform">
                        <Share2 size={16} /> Share
                     </button>
                     <button onClick={onClaim} className="flex-1 bg-white border border-slate-200 text-slate-400 py-3 rounded-xl text-xs font-bold hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-transform">
                        Claim Profile
                     </button>
                  </div>
               </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;
