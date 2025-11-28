
import React from 'react';

interface Props {
    onJoin: () => void;
}

const VolunteerLanding: React.FC<Props> = ({ onJoin }) => {
    return (
        <section className="relative bg-slate-950 text-white pt-32 pb-20 overflow-hidden min-h-[850px] flex items-center">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.15),transparent_70%)]"></div>
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-20"></div>
             
             <div className="max-w-7xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center w-full">
                 <div>
                     <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Democracy is a</span> <br/>
                         <span className="text-blue-500">Team Sport.</span>
                     </h1>
                     <p className="text-lg text-slate-400 mb-8 max-w-xl">
                         Join India's first decentralized accountability force. File RTIs, verify affidavits, and earn recognition.
                     </p>
                     <button onClick={onJoin} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 shadow-lg transition-all">
                        Join Nyay Fauj
                     </button>
                 </div>
                 <div className="relative h-[400px] w-full flex items-center justify-center">
                      {/* Placeholder for map */}
                      <div className="w-64 h-64 rounded-full bg-blue-900/20 animate-pulse flex items-center justify-center text-blue-500 font-bold">Live Network Map</div>
                 </div>
             </div>
        </section>
    )
}

export default VolunteerLanding;
