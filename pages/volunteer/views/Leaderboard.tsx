
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getLeaderboard, dataSyncEvents } from '../../../services/dataService';

const Leaderboard: React.FC = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  
  useEffect(() => {
    setVolunteers(getLeaderboard(100));
    
    // Listen for volunteer updates
    const unsubscribe = dataSyncEvents.on('volunteersUpdated', () => {
      setVolunteers(getLeaderboard(100));
    });
    
    return () => {
      window.removeEventListener('neta:volunteersUpdated', unsubscribe as any);
    };
  }, []);
  
  if (volunteers.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 p-8 text-center bg-white">
        <p className="text-slate-500 font-medium">No volunteers yet. Be the first to join!</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Volunteer</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4 text-center">RTIs Filed</th>
                    <th className="px-6 py-4 text-right">Impact Score</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
                {volunteers.map((v, i) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            {i === 0 ? <span className="text-2xl drop-shadow-sm">🥇</span> : 
                             i === 1 ? <span className="text-2xl drop-shadow-sm">🥈</span> : 
                             i === 2 ? <span className="text-2xl drop-shadow-sm">🥉</span> : 
                             <span className="font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">#{i+1}</span>}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                                    {v.name[0]}
                                </div>
                                <span className="font-bold text-slate-900">{v.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                <MapPin size={10} /> {v.state}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{v.rtisFiled}</td>
                        <td className="px-6 py-4 text-right font-black text-blue-600">{v.points}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default Leaderboard;
