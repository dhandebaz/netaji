
import React, { useState } from 'react';
import { PublicComplaint } from '../../types';
import { MOCK_COMPLAINTS } from '../../constants';
import { AlertCircle, CheckCircle, MessageSquare, MapPin, ThumbsUp, Clock, Upload } from 'lucide-react';

interface Props {
    politicianId: number;
}

const ComplaintHandler: React.FC<Props> = ({ politicianId }) => {
    // Filter complaints for this politician
    const [complaints, setComplaints] = useState<PublicComplaint[]>(
        MOCK_COMPLAINTS.filter(c => c.politicianId === politicianId)
    );
    const [activeId, setActiveId] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');

    const handleResolve = (id: string) => {
        if (!responseText) return alert("Please enter Proof of Work description.");
        
        setComplaints(prev => prev.map(c => 
            c.id === id ? { ...c, status: 'resolved', proofOfWork: responseText } : c
        ));
        setActiveId(null);
        setResponseText('');
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {complaints.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                        <CheckCircle size={48} className="mx-auto mb-4 text-green-200" />
                        <p className="font-bold">No pending complaints. Good work!</p>
                    </div>
                ) : (
                    complaints.map(c => (
                        <div key={c.id} className={`bg-white p-6 rounded-2xl border transition-all ${c.status === 'resolved' ? 'border-green-200 opacity-80' : 'border-slate-200 shadow-sm'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-xl ${c.category === 'Corruption' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{c.category}</span>
                                        <h4 className="font-bold text-slate-900 text-lg">{c.location}</h4>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={10}/> {c.filedAt}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {c.status}
                                </div>
                            </div>
                            
                            <p className="text-slate-700 mb-4 font-medium">{c.description}</p>
                            
                            {c.status !== 'resolved' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Respond & Resolve</h5>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Describe action taken (Proof of Work)..." 
                                            className="flex-grow px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                                            value={activeId === c.id ? responseText : ''}
                                            onChange={e => { setActiveId(c.id); setResponseText(e.target.value); }}
                                        />
                                        <button 
                                            onClick={() => handleResolve(c.id)}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Mark Done
                                        </button>
                                    </div>
                                </div>
                            )}

                            {c.status === 'resolved' && c.proofOfWork && (
                                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-800">
                                    <span className="font-bold block mb-1 text-xs uppercase flex items-center gap-1"><CheckCircle size={10}/> Official Response</span>
                                    {c.proofOfWork}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-4">
                <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-lg">
                    <h3 className="font-bold mb-4">Constituency Pulse</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Resolution Rate</span>
                                <span>80%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="w-[80%] h-full bg-green-500"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Avg Response Time</span>
                                <span>2 Days</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="w-[60%] h-full bg-blue-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">Impact on Ranking</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Unresolved complaints negatively impact your <strong>Net Approval Score</strong>. Resolving issues with photo evidence boosts your visibility.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComplaintHandler;
