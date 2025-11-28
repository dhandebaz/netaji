
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, AlertTriangle, Eye } from 'lucide-react';
import { getRTITasks, verifyTask, updateTaskStatus } from '../../../services/rtiService';
import { RTITask } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

const RTIVerification: React.FC = () => {
    const [tasks, setTasks] = useState<RTITask[]>([]);
    const [selectedTask, setSelectedTask] = useState<RTITask | null>(null);

    const refresh = () => {
        setTasks(getRTITasks().filter(t => t.status === 'response_received'));
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleApprove = () => {
        if (selectedTask) {
            verifyTask(selectedTask.id);
            refresh();
            setSelectedTask(null);
        }
    };

    const handleReject = () => {
        if (selectedTask) {
            updateTaskStatus(selectedTask.id, 'rejected');
            refresh();
            setSelectedTask(null);
        }
    };

    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-[24px] border border-slate-200 p-12 text-center flex flex-col items-center justify-center h-[400px]">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
                    <CheckCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All Clear!</h3>
                <p className="text-slate-500 mt-2">No responses currently pending verification.</p>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
            {/* List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-sm uppercase tracking-wider">
                    Pending Queue ({tasks.length})
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-grow p-2 space-y-2">
                    {tasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedTask?.id === task.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'}`}
                        >
                            <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{task.topic}</h4>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>{task.politicianName}</span>
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{new Date(task.responseDate || '').toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {selectedTask ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedTask.topic}</h2>
                                    <p className="text-slate-500 text-sm mt-1">{selectedTask.description}</p>
                                </div>
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                                    Verify
                                </span>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 text-xs font-bold uppercase mr-2">Target</span>
                                    <span className="font-bold text-slate-900">{selectedTask.politicianName}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 text-xs font-bold uppercase mr-2">Volunteer</span>
                                    <span className="font-bold text-slate-900">{selectedTask.claimedBy}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow p-6 bg-slate-50/50 flex flex-col items-center justify-center">
                            <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="font-bold text-slate-800 mb-1">Govt_Response_File.pdf</h3>
                                <p className="text-xs text-slate-500 mb-6">Uploaded by user • 2.4 MB</p>
                                <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                                    <Eye size={16} /> Preview Document
                                </button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <AlertTriangle size={14} /> Verify authenticity before approving.
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleReject} className="px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2">
                                    <XCircle size={18} /> Reject
                                </button>
                                <button onClick={handleApprove} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-colors flex items-center gap-2">
                                    <CheckCircle size={18} /> Approve & Publish
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <FileText size={48} className="opacity-20 mb-4" />
                        <p className="font-bold">Select a task to review</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RTIVerification;
