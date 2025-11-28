
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const SUMMARY = {
  totalSeats: 543,
  majorityMark: 272,
  alliances: [
    { name: 'NDA', seats: 292, color: '#f97316', delta: '+12' },
    { name: 'INDIA', seats: 214, color: '#3b82f6', delta: '+45' },
    { name: 'Others', seats: 37, color: '#64748b', delta: '-8' }
  ]
};

const NationalTally: React.FC = () => {
  return (
    <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
           <Trophy className="text-yellow-500 fill-yellow-500" /> National Scorecard
        </h2>
        
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
           {SUMMARY.alliances.map((alliance) => (
               <motion.div 
                  key={alliance.name}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden text-center"
               >
                   <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: alliance.color }}></div>
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{alliance.name}</h3>
                   <div className="text-3xl md:text-5xl font-black text-slate-900 mb-1 tracking-tighter">
                       {alliance.seats}
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alliance.delta.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {alliance.delta}
                   </span>
               </motion.div>
           ))}
        </div>

        {/* Majority Bar */}
        <div className="relative pt-6 pb-2">
            <div className="bg-slate-100 rounded-full h-4 w-full overflow-hidden flex relative">
                <div className="h-full transition-all duration-1000" style={{ width: `${(SUMMARY.alliances[0].seats / 543) * 100}%`, backgroundColor: SUMMARY.alliances[0].color }}></div>
                <div className="h-full transition-all duration-1000" style={{ width: `${(SUMMARY.alliances[1].seats / 543) * 100}%`, backgroundColor: SUMMARY.alliances[1].color }}></div>
                <div className="h-full bg-slate-400 flex-grow"></div>
            </div>
            
            {/* Majority Marker */}
            <div className="absolute top-0 bottom-0 left-[50.1%] w-px border-l-2 border-dashed border-slate-900 z-10 flex flex-col items-center">
                <div className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">272</div>
            </div>
        </div>
    </section>
  );
};

export default NationalTally;
