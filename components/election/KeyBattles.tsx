
import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

const BATTLES = [
  { constituency: 'Varanasi', state: 'UP', candidate: 'Narendra Modi', party: 'BJP', status: 'Leading', margin: '+1.4L', trend: 'up' },
  { constituency: 'Raebareli', state: 'UP', candidate: 'Rahul Gandhi', party: 'INC', status: 'Leading', margin: '+89k', trend: 'up' },
  { constituency: 'Thiruvananthapuram', state: 'KL', candidate: 'Shashi Tharoor', party: 'INC', status: 'Trailing', margin: '-2.4k', trend: 'down' },
  { constituency: 'Gandhinagar', state: 'GJ', candidate: 'Amit Shah', party: 'BJP', status: 'Leading', margin: '+2.1L', trend: 'up' },
  { constituency: 'Baramati', state: 'MH', candidate: 'Supriya Sule', party: 'NCP', status: 'Leading', margin: '+15k', trend: 'neutral' },
];

const KeyBattles: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm h-full">
        <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <Users className="text-blue-600" size={20} /> VIP Battles
        </h3>
        
        <div className="space-y-4">
            {BATTLES.map((battle, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                            battle.party === 'BJP' ? 'bg-orange-500' : battle.party === 'INC' ? 'bg-blue-500' : 'bg-slate-500'
                        }`}>
                            {battle.candidate[0]}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{battle.candidate}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{battle.constituency} • {battle.party}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            battle.status === 'Leading' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {battle.status === 'Leading' ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                            {battle.status}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{battle.margin}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default KeyBattles;
