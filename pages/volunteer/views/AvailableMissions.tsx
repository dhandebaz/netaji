
import React, { useState, useEffect } from 'react';
import { RTITask } from '../../../types';
import { getRTITasks, claimTask } from '../../../services/rtiService';
import { useAuth } from '../../../context/AuthContext';

const AvailableMissions: React.FC = () => {
    const [tasks, setTasks] = useState<RTITask[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        // Only show generated tasks that aren't claimed
        setTasks(getRTITasks().filter(t => t.status === 'generated'));
    }, []);

    const handleClaim = (taskId: string) => {
        claimTask(taskId, user?.name || "Volunteer");
        setTasks(prev => prev.filter(t => t.id !== taskId));
        alert("Mission Claimed! Go to 'My Operations' to proceed.");
    };

    if (tasks.length === 0) return <div className="text-center py-12 text-slate-400">No new missions available. Good job!</div>;

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {tasks.map(task => (
                <div key={task.id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all relative group">
                     <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {task.priority} Priority
                     </div>
                     <h4 className="font-bold text-slate-900 text-lg mb-1 pr-16">{task.topic}</h4>
                     <p className="text-sm text-slate-500 mb-4 leading-relaxed">{task.description}</p>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                         <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                 {task.politicianName[0]}
                             </div>
                             <div className="text-xs">
                                 <p className="font-bold text-slate-900">{task.politicianName}</p>
                                 <p className="text-slate-400">Target</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => handleClaim(task.id)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10 group-hover:shadow-blue-500/20"
                         >
                             Claim Mission
                         </button>
                     </div>
                </div>
            ))}
        </div>
    );
}

export default AvailableMissions;
