
import React, { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { RTITask } from '../../../types';
import { getRTITasks } from '../../../services/rtiService';
import { useAuth } from '../../../context/AuthContext';
import ActiveOperationCard from '../../../components/volunteer/ActiveOperationCard';

const MyOperations: React.FC = () => {
    const [tasks, setTasks] = useState<RTITask[]>([]);
    const { user } = useAuth();

    const refresh = () => {
        const all = getRTITasks();
        // Filter for tasks claimed by this user (or all for demo simplicity if name matches)
        const myTasks = all.filter(t => t.claimedBy === (user?.name || "Volunteer") && t.status !== 'verified');
        setTasks(myTasks);
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <div className="space-y-6">
            {tasks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Inbox size={32}/></div>
                    <h3 className="text-slate-900 font-bold">No Active Operations</h3>
                    <p className="text-slate-500 text-sm">Claim a mission from the 'Available' tab to get started.</p>
                </div>
            ) : (
                tasks.map(task => (
                    <ActiveOperationCard key={task.id} task={task} onUpdate={refresh} />
                ))
            )}
        </div>
    )
}

export default MyOperations;
