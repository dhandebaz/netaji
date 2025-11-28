
import React, { useState } from 'react';
import { Clock, FileText, Upload, Download, CheckCircle, Loader } from 'lucide-react';
import { RTITask } from '../../types';
import { generateRTIPDF } from '../../services/pdfService';
import { draftRTIApplication } from '../../services/geminiService';
import { fileTask, submitResponse } from '../../services/rtiService';

interface Props {
    task: RTITask;
    onUpdate: () => void;
}

const ActiveOperationCard: React.FC<Props> = ({ task, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const handleDownloadDraft = async () => {
        setLoading(true);
        try {
            const draft = await draftRTIApplication(task, task.claimedBy || "Volunteer", "123 Civil Lines");
            generateRTIPDF(task, task.claimedBy || "Volunteer", "123 Civil Lines", draft);
        } catch (e) {
            alert("Error generating draft");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProof = () => {
        // Simulate file upload
        const url = prompt("Simulate Upload: Enter dummy URL for Proof of Filing (e.g., drive.google.com/...)");
        if (url) {
            fileTask(task.id, url);
            onUpdate();
        }
    };

    const handleUploadResponse = () => {
        const url = prompt("Simulate Upload: Enter dummy URL for Govt Response PDF");
        if (url) {
            submitResponse(task.id, url);
            onUpdate();
        }
    };

    const getStatusColor = (s: string) => {
        switch(s) {
            case 'claimed': return 'bg-blue-50 border-blue-100 text-blue-700';
            case 'filed': return 'bg-orange-50 border-orange-100 text-orange-700';
            case 'response_received': return 'bg-green-50 border-green-100 text-green-700';
            default: return 'bg-slate-50';
        }
    }

    return (
        <div className={`p-6 rounded-2xl border border-slate-200 transition-all ${task.status === 'response_received' ? 'bg-green-50/30' : 'bg-white'}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                 <div>
                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase mb-2 border ${getStatusColor(task.status)}`}>
                         <Clock size={12} /> Status: {task.status.replace('_', ' ')}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900">{task.topic}</h3>
                 </div>
                 <div className="text-right">
                     <p className="text-xs text-slate-500 font-bold uppercase">Deadline</p>
                     <p className="font-mono font-bold text-red-500">{new Date(task.deadline).toLocaleDateString()}</p>
                 </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${task.status === 'response_received' ? 'bg-green-500 w-full' : task.status === 'filed' ? 'bg-orange-500 w-2/3' : 'bg-blue-500 w-1/3'}`}
                ></div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Step 1: Draft */}
                <button 
                    onClick={handleDownloadDraft}
                    disabled={loading || task.status !== 'claimed'}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-sm font-bold transition-all ${task.status === 'claimed' ? 'bg-white border-blue-200 text-blue-700 hover:shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}`}
                >
                    {loading ? <Loader className="animate-spin"/> : <FileText />}
                    Step 1: Download Smart Draft
                </button>

                {/* Step 2: Upload Proof */}
                <button 
                    onClick={handleUploadProof}
                    disabled={task.status !== 'claimed'}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-sm font-bold transition-all ${task.status === 'claimed' ? 'bg-white border-orange-200 text-orange-700 hover:shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}`}
                >
                    {task.status === 'filed' || task.status === 'response_received' ? <CheckCircle className="text-green-500"/> : <Upload />}
                    {task.status === 'filed' || task.status === 'response_received' ? 'Proof Uploaded' : 'Step 2: Upload Filing Proof'}
                </button>

                {/* Step 3: Upload Response */}
                <button 
                    onClick={handleUploadResponse}
                    disabled={task.status !== 'filed'}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-sm font-bold transition-all ${task.status === 'filed' ? 'bg-white border-green-200 text-green-700 hover:shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}`}
                >
                    {task.status === 'response_received' ? <CheckCircle className="text-green-500"/> : <Download className="rotate-180" />}
                    {task.status === 'response_received' ? 'Sent for Verification' : 'Step 3: Upload Govt Response'}
                </button>
            </div>
            
            {task.status === 'response_received' && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 text-xs font-bold text-center rounded-xl border border-green-200">
                    Great job! Your response is under verification by the Admin team. Points will be awarded shortly.
                </div>
            )}
        </div>
    )
}

export default ActiveOperationCard;
