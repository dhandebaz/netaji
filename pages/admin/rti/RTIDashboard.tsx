
import React, { useEffect, useState } from 'react';
import { Zap, Users, FileText, Database, BrainCircuit, ArrowRight } from 'lucide-react';
import { getRTITasks } from '../../../services/rtiService';
import { RTITask, RTIStatus } from '../../../types';

const RTIDashboard: React.FC<{ onViewTasks: () => void }> = ({ onViewTasks }) => {
    const [tasks, setTasks] = useState<RTITask[]>([]);

    useEffect(() => {
        setTasks(getRTITasks());
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    label="AI Generated" 
                    value={tasks.filter(t => t.status === 'generated').length} 
                    icon={<BrainCircuit size={20}/>} 
                    color="bg-blue-50 text-blue-600 border-blue-100" 
                />
                <StatCard 
                    label="Active Volunteers" 
                    value={new Set(tasks.filter(t => t.claimedBy).map(t => t.claimedBy)).size} 
                    icon={<Users size={20}/>} 
                    color="bg-orange-50 text-orange-600 border-orange-100" 
                />
                <StatCard 
                    label="Pending Verification" 
                    value={tasks.filter(t => t.status === 'response_received').length} 
                    icon={<FileText size={20}/>} 
                    color="bg-purple-50 text-purple-600 border-purple-100" 
                />
                <StatCard 
                    label="Public Records" 
                    value={tasks.filter(t => t.status === 'verified').length} 
                    icon={<Database size={20}/>} 
                    color="bg-emerald-50 text-emerald-600 border-emerald-100" 
                />
            </div>

            {/* Kanban Board */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">Live Operations Flow</h3>
                    <button onClick={onViewTasks} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        View All Tasks <ArrowRight size={12} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px]">
                    <KanbanColumn title="AI Backlog" status="generated" tasks={tasks} color="border-blue-200 bg-blue-50/30" />
                    <KanbanColumn title="In Progress" status="claimed" tasks={tasks} color="border-orange-200 bg-orange-50/30" />
                    <KanbanColumn title="Filed" status="filed" tasks={tasks} color="border-purple-200 bg-purple-50/30" />
                    <KanbanColumn title="Review" status="response_received" tasks={tasks} color="border-green-200 bg-green-50/30" />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <div className={`p-5 rounded-2xl border ${color} flex flex-col justify-between h-28 transition-transform hover:scale-[1.02]`}>
        <div className="flex justify-between items-start">
            <div className="p-2 bg-white/50 rounded-xl backdrop-blur-sm">{icon}</div>
            <span className="text-2xl font-black">{value}</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
    </div>
);

const KanbanColumn = ({ title, status, tasks, color }: { title: string, status: RTIStatus, tasks: RTITask[], color: string }) => {
    const filtered = tasks.filter(t => t.status === status);
    return (
        <div className={`rounded-2xl border flex flex-col h-full overflow-hidden ${color.split(' ')[0]} bg-white`}>
            <div className={`p-3 border-b ${color.split(' ')[0]} ${color.split(' ')[1]} flex justify-between items-center`}>
                <span className="font-bold text-xs uppercase text-slate-700">{title}</span>
                <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 shadow-sm">{filtered.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50">
                {filtered.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs hover:border-blue-300 transition-colors cursor-default">
                        <p className="font-bold text-slate-800 mb-1 line-clamp-2">{task.topic}</p>
                        <p className="text-slate-500">{task.politicianName}</p>
                        {task.priority === 'high' && <div className="mt-2 inline-block bg-red-100 text-red-600 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase">High Priority</div>}
                    </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-10 text-slate-300 text-xs font-bold">Empty</div>}
            </div>
        </div>
    );
};

export default RTIDashboard;
