
import React from 'react';
import { FileCode, Save, RefreshCw } from 'lucide-react';

const RTITemplates: React.FC = () => {
    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileCode className="text-blue-600" size={20}/> Master Prompt Template
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                        This prompt guides the AI when generating RTI drafts for volunteers. Variables like {'{politician_name}'} are injected dynamically.
                    </p>
                    <div className="bg-[#1e1e1e] rounded-xl p-1">
                        <textarea 
                            className="w-full h-[300px] bg-transparent text-green-400 font-mono text-xs p-4 outline-none resize-none"
                            defaultValue={`Draft a formal Right to Information (RTI) application under RTI Act 2005.

Context:
- Applicant: {volunteer_name}
- Address: {volunteer_address}
- PIO: {pio_details}
- Subject: Information regarding {topic} related to {politician_name}

Requirements:
1. Use formal legal tone.
2. Cite Section 6(1) and Section 4(1)(b).
3. Format as a numbered list of questions.
4. Include standard fee payment declaration.`}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <Save size={16} /> Save Template
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2">Variable Reference</h4>
                    <ul className="space-y-2 text-xs font-mono text-blue-800">
                        <li className="flex items-center justify-between bg-white/50 p-2 rounded">
                            <span>{`{politician_name}`}</span> <span className="text-blue-400">Target Name</span>
                        </li>
                        <li className="flex items-center justify-between bg-white/50 p-2 rounded">
                            <span>{`{topic}`}</span> <span className="text-blue-400">RTI Subject</span>
                        </li>
                        <li className="flex items-center justify-between bg-white/50 p-2 rounded">
                            <span>{`{pio_details}`}</span> <span className="text-blue-400">Office Info</span>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4">Template Version</h4>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-500">Current:</span>
                        <span className="font-mono font-bold text-slate-900">v2.4.1</span>
                    </div>
                    <button className="w-full py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                        Rollback to v2.4.0
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RTITemplates;
