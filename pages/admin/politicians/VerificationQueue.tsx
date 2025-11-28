
import React from 'react';
import { UserCheck, FileText, Eye } from 'lucide-react';
import { ClaimRequest } from '../../../types';

interface Props {
    claims: ClaimRequest[];
    onAction: (id: string, action: 'approve' | 'reject') => void;
}

const VerificationQueue: React.FC<Props> = ({ claims, onAction }) => {
    return (
        <div className="h-full bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
                {claims.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">No pending verification claims.</div>
                ) : (
                    claims.map(claim => (
                        <div key={claim.id} className={`p-6 rounded-2xl border transition-all ${claim.status === 'pending' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-75'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{claim.politicianName}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{claim.designation}</p>
                                        <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-slate-600">
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                                Email: {claim.email} 
                                                {!claim.email.endsWith('.gov.in') && !claim.email.endsWith('.nic.in') && (
                                                    <span className="text-red-500 ml-1 font-bold">(Non-Gov)</span>
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                                Phone: {claim.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {claim.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => onAction(claim.id, 'reject')} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm">Reject</button>
                                        <button onClick={() => onAction(claim.id, 'approve')} className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-200">Verify & Approve</button>
                                    </div>
                                ) : (
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${claim.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{claim.status}</span>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Documents:</span>
                                <button className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"><FileText size={14} /> Consent_Letter.pdf <Eye size={12} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VerificationQueue;
