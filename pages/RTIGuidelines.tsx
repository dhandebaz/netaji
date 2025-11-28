
import React from 'react';
import { BookOpen, Send, PenTool, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RTIGuidelines: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl mb-6"
          >
            <BookOpen size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            RTI Guidelines
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            A citizen's guide to using the Right to Information Act, 2005 to demand accountability.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Left Content (Main Guide) */}
            <div className="md:col-span-2 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8 md:p-10"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">How Neta Helps You File</h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        The <Link to="/volunteer" className="text-blue-600 font-bold hover:underline">Nyay Fauj</Link> section allows you to draft professional RTI applications instantly using our automated tools. However, filing the RTI is an official legal process that you must complete.
                    </p>
                    
                    <div className="space-y-6">
                        <Step 
                            num={1} 
                            title="Draft Application" 
                            desc="Use our smart drafting tools to generate a precise legal draft citing relevant sections of the RTI Act." 
                            icon={<PenTool size={20}/>} 
                        />
                        <Step 
                            num={2} 
                            title="Pay Fees" 
                            desc="The standard fee is ₹10 via Postal Order (offline) or Online Payment (via rtionline.gov.in)." 
                            icon={<Info size={20}/>} 
                        />
                        <Step 
                            num={3} 
                            title="Submit to PIO" 
                            desc="Send your application to the Public Information Officer (PIO) of the relevant department." 
                            icon={<Send size={20}/>} 
                        />
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8 md:p-10"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Provisions of RTI Act 2005</h2>
                    <ul className="space-y-4">
                        <Fact 
                            title="Section 6(1)" 
                            text="Allows any citizen to request information from a public authority." 
                        />
                        <Fact 
                            title="Section 7(1)" 
                            text="Mandates the PIO to provide information within 30 days of receipt." 
                        />
                        <Fact 
                            title="Section 4(1)(b)" 
                            text="Requires public authorities to suo motu disclose basic information about their functioning." 
                        />
                        <Fact 
                            title="Life & Liberty" 
                            text="If information concerns the life or liberty of a person, it must be provided within 48 hours." 
                        />
                    </ul>
                </motion.div>
            </div>

            {/* Right Sidebar (Warning) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-1"
            >
                <div className="bg-orange-50 rounded-[32px] border border-orange-100 p-8 sticky top-32">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Important Limitations</h3>
                    <p className="text-orange-800 text-sm leading-relaxed mb-6">
                        Certain information is exempt from disclosure under <span className="font-bold">Section 8</span> of the Act, including:
                    </p>
                    <ul className="list-disc pl-4 space-y-3 text-orange-800 text-sm">
                        <li>Information affecting sovereignty and integrity of India.</li>
                        <li>Cabinet papers including deliberations of Ministers.</li>
                        <li>Information received in confidence from foreign governments.</li>
                        <li>Personal information which has no relationship to any public activity.</li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-orange-200">
                        <a href="https://rtionline.gov.in/" target="_blank" rel="noreferrer" className="block w-full bg-orange-600 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
                            Official RTI Portal
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
};

const Step = ({ num, title, desc, icon }: any) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md z-10 relative">
                {num}
            </div>
            {num !== 3 && <div className="w-0.5 h-full bg-slate-200 -mt-2 -mb-4"></div>}
        </div>
        <div className="pb-8">
            <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
                {title} <span className="text-slate-400">{icon}</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Fact = ({ title, text }: any) => (
    <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <span className="font-bold text-blue-600 block mb-1">{title}</span>
        <span className="text-slate-700 text-sm">{text}</span>
    </li>
);

export default RTIGuidelines;
