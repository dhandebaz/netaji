import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import { getAllGames, Game, playGame } from '../services/dataService';
import { useToast } from '../context/ToastContext';

const GamePlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [game, setGame] = useState<Game | null>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const games = getAllGames();
        const found = games.find(g => g.id === id);
        if (found) {
            setGame(found);
        } else {
            addToast('Game not found!', 'error');
            navigate('/games');
        }
    }, [id, navigate, addToast]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('over');
            addToast(`Game Over! Score: ${score}`, 'info');
        }
        return () => clearTimeout(timer);
    }, [gameState, timeLeft, score, addToast]);

    const startGame = () => {
        if (game) {
            // Re-trigger play count increment if desired, or just once per session
            playGame(game.id);
        }
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
    };

    const handleInteraction = () => {
        if (gameState === 'playing') {
            setScore(prev => prev + 10);
            // Visual feedback could go here
        }
    };

    if (!game) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 font-sans pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/games')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Arcade
                </button>

                <div className="bg-slate-800 rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl p-8 relative">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
                            <p className="text-slate-400">{game.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Score</div>
                            <div className="text-4xl font-mono text-purple-400">{score.toString().padStart(5, '0')}</div>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-700 flex flex-col items-center justify-center">
                        
                        {gameState === 'start' && (
                            <div className="text-center z-10">
                                <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-6">Ready to Play?</h2>
                                <button 
                                    onClick={startGame}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                                >
                                    <Play size={20} fill="currentColor" /> Start Game
                                </button>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <div className="w-full h-full relative cursor-crosshair" onClick={handleInteraction}>
                                <div className="absolute top-4 right-4 bg-slate-800/80 px-4 py-2 rounded-full text-white font-mono border border-slate-600">
                                    Time: {timeLeft}s
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-slate-600 text-sm animate-pulse">Click / Tap rapidly to score!</p>
                                </div>
                                
                                {/* Simple click effect placeholder */}
                                <motion.div 
                                    key={score}
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    className="absolute top-1/2 left-1/2 w-20 h-20 bg-purple-500/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        )}

                        {gameState === 'over' && (
                            <div className="text-center z-10">
                                <h2 className="text-4xl font-black text-white mb-2">Game Over!</h2>
                                <p className="text-xl text-slate-400 mb-8">Final Score: <span className="text-purple-400 font-bold">{score}</span></p>
                                <button 
                                    onClick={startGame}
                                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-lg transition-all flex items-center gap-2 mx-auto border border-slate-500"
                                >
                                    <RotateCcw size={20} /> Play Again
                                </button>
                            </div>
                        )}

                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlayer;
