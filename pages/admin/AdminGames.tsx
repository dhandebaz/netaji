
import React, { useState, useEffect } from 'react';
import { Plus, Gamepad2, Upload, Trash2, Edit } from 'lucide-react';
import { getAllGames, deleteGame } from '../../services/dataService';
import ImageWithFallback from '../../components/ImageWithFallback';

const AdminGames: React.FC = () => {
    const [games, setGames] = useState<any[]>([]);

    useEffect(() => {
        setGames(getAllGames());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Delete this game?')) {
            deleteGame(id);
            setGames(getAllGames());
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Game Manager</h1>
                    <p className="text-slate-500 font-medium">Manage the satirical arcade catalog.</p>
                </div>
                <button className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Plus size={18} /> Add New Game
                </button>
            </div>

            <div className="grid gap-4">
                {games.map(game => (
                    <div key={game.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                        <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                            <ImageWithFallback src={game.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-slate-900">{game.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-1">{game.description}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
                            <span>{game.plays?.toLocaleString() || '0'} Plays</span>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(game.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminGames;
