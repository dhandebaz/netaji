
import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Camera } from 'lucide-react';
import { getAllComplaints, dataSyncEvents } from '../services/dataService';
import PageTransition from '../components/PageTransition';
import ComplaintCard from '../components/complaints/ComplaintCard';
import { useHaptic } from '../hooks/useHaptic';
import { Helmet } from 'react-helmet-async';

const PublicComplaints: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [complaints, setComplaints] = useState<any[]>([]);
    const haptic = useHaptic();

    useEffect(() => {
        setComplaints(getAllComplaints());
        
        // Listen for real-time complaint updates from admin panel
        const unsubscribe = dataSyncEvents.on('complaintsFiled', (updatedComplaints: any[]) => {
            console.debug('[PublicComplaints] Complaints updated from admin:', updatedComplaints.length);
            setComplaints(updatedComplaints);
        });
        
        return () => {
            unsubscribe();
        };
    }, []);

    const filtered = complaints.filter(c => 
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const canonicalUrl = 'https://neta.ink/complaints';

    return (
        <PageTransition>
            <Helmet>
                <title>Civic Wall – Public Complaint Registry | Neta</title>
                <meta name="description" content="Public complaint registry for citizens to report issues and demand accountability from representatives." />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="Civic Wall – Public Complaint Registry | Neta" />
                <meta
                    property="og:description"
                    content="Browse public complaints filed against representatives and track accountability in real time."
                />
                <meta property="og:url" content={canonicalUrl} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'GovernmentService',
                        name: 'Public Complaint Registry',
                        provider: 'Neta',
                    })}
                </script>
            </Helmet>
            <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 text-red-600 rounded-2xl mb-4 shadow-sm">
                            <AlertCircle size={28} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            Civic Wall
                        </h1>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">
                            Report issues, demand accountability.
                        </p>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white p-3 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 mb-8 flex gap-3 items-center sticky top-24 z-30">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by location..." 
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => haptic()}
                            className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-700 shadow-md active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
                        >
                            <Camera size={18} /> <span className="hidden sm:inline">Post Issue</span>
                        </button>
                    </div>

                    {/* Feed */}
                    <div className="grid md:grid-cols-2 gap-5">
                        {filtered.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>

                </div>
            </div>
        </PageTransition>
    );
};

export default PublicComplaints;
