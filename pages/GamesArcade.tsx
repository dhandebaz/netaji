
import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Star, Users } from 'lucide-react';
import { MOCK_GAMES } from '../constants';

const GamesArcade: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 font-sans pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-wider mb-4 border border-purple-500/30">
                            <Gamepad2 size={16} /> Satirical Arcade
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                            Politics is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Game</span>.
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl">
                            Satirical mini-games exposing the absurdities of Indian politics. Play, laugh, and learn.
                        </p>
                    </div>
                </div>

                {/* Game Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_GAMES.map((game) => (
                        <motion.div 
                            key={game.id}
                            whileHover={{ y: -10 }}
                            className="bg-slate-800 rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl group cursor-pointer"
                        >
                            <div className="h-48 bg-slate-700 relative overflow-hidden">
                                <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                <button className="absolute bottom-4 right-4 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play size={24} fill="currentColor" className="ml-1"/>
                                </button>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 h-10 line-clamp-2">
                                    {game.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                                        <span className="flex items-center gap-1"><Users size={14}/> {game.plays.toLocaleString()}</span>
                                        <span className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor"/> {game.rating}</span>
                                    </div>
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Play Now</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default GamesArcade;
