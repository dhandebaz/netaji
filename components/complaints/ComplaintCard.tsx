
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ThumbsUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { PublicComplaint } from '../../types';
import { useHaptic } from '../../hooks/useHaptic';

interface Props {
    complaint: PublicComplaint;
}

const ComplaintCard: React.FC<Props> = ({ complaint }) => {
    const [votes, setVotes] = useState(complaint.upvotes);
    const [voted, setVoted] = useState(false);
    const haptic = useHaptic();

    const handleVote = () => {
        haptic();
        if (voted) {
            setVotes(v => v - 1);
            setVoted(false);
        } else {
            setVotes(v => v + 1);
            setVoted(true);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                            {complaint.userName[0]}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{complaint.userName}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                <MapPin size={10} /> {complaint.location}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {complaint.status}
                    </span>
                </div>

                <div className="mb-4">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider border border-blue-100">
                        {complaint.category}
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed text-sm">
                        {complaint.description}
                    </p>
                </div>

                {complaint.proofOfWork && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-4">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase mb-1 flex items-center gap-1">
                            <CheckCircle size={12}/> Politician Response
                        </p>
                        <p className="text-xs text-emerald-900">{complaint.proofOfWork}</p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <button 
                        onClick={handleVote}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${voted ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ThumbsUp size={18} className={voted ? 'fill-current' : ''} /> {votes}
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                        <MessageSquare size={18} /> Comment
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplaintCard;
