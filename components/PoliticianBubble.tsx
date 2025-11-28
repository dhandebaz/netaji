import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Politician } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  politician: Politician;
}

const PoliticianBubble: React.FC<Props> = ({ politician }) => {
  
  // Calculate stroke dash for circle progress (r=42, c=264)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = politician.approvalRating;
  const dashoffset = circumference - (progress / 100) * circumference;
  
  const getColor = (rating: number) => {
    if (rating >= 70) return '#22c55e'; // Green
    if (rating >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const ringColor = getColor(politician.approvalRating);

  return (
    <Link to={`/politician/${politician.slug}`} className="group relative flex flex-col items-center gap-3 w-[120px]">
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className="relative w-28 h-28 flex items-center justify-center"
      >
        {/* SVG Progress Ring */}
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4" />
          {/* Progress */}
          <motion.circle 
            cx="50" cy="50" r={radius} 
            fill="none" 
            stroke={ringColor} 
            strokeWidth="4" 
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>

        {/* Avatar Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-4 border-white shadow-inner bg-slate-100">
            <ImageWithFallback
               src={politician.photoUrl}
               alt={politician.name}
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
        
        {/* Approval Badge */}
        <div className="absolute bottom-0 translate-y-1/4 bg-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1">
           <span style={{color: ringColor}}>●</span> {progress}%
        </div>
        
        {/* Party Emoji */}
        <div className="absolute top-0 right-0 translate-y-2 translate-x-[-4px] w-7 h-7 bg-white rounded-full shadow-md border border-slate-50 flex items-center justify-center text-xs z-10">
           {politician.partyLogo}
        </div>
      </motion.div>

      {/* Name Info */}
      <div className="text-center">
        <h3 className="text-xs font-bold text-slate-900 leading-tight mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-2 text-balance">
          {politician.name}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium truncate max-w-full">
          {politician.constituency}
        </p>
      </div>
    </Link>
  );
};

export default PoliticianBubble;