'use client';
import { useState, useEffect } from 'react';
import { StickyNote, Eraser, CheckCircle2 } from 'lucide-react';

export default function NotePage() {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedNote = localStorage.getItem('note');
        if (savedNote) {
            setNote(savedNote);
        }
    }, []);

    // Save to localStorage whenever note changes with a small delay simulation
    useEffect(() => {
        setIsSaving(true);
        localStorage.setItem('note', note);
        const timeout = setTimeout(() => setIsSaving(false), 800);
        return () => clearTimeout(timeout);
    }, [note]);

    const clearNote = () => {
        if (window.confirm('Clear all note content?')) {
            setNote('');
        }
    };

    return (
        <div className="bg-white dark:bg-[#111c44] rounded-[24px] border border-gray-100 dark:border-white/5 transition-all duration-300 overflow-hidden relative shadow-sm">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-[#111c44]/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F4F7FE] dark:bg-[#1b254b] rounded-lg">
                        <StickyNote size={20} className="text-[#4318FF] dark:text-[#7551FF]" />
                    </div>
                    <h2 className=" text-[#2B3674] dark:text-white text-lg tracking-tight">
                        Scratchpad
                    </h2>
                </div>
                <button 
                    onClick={clearNote}
                    className="p-2.5 text-[#A3AED0] hover:text-[#FF5B5B] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all active:scale-90"
                    title="Clear Note"
                >
                    <Eraser size={18} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 bg-[#F4F7FE]/30 dark:bg-[#0b1437]/20">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Type your notes here..."
                    className="w-full h-64 p-5 text-[#2B3674] dark:text-white bg-white dark:bg-[#111c44] border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#4318FF]/20 focus:border-[#4318FF]/50 outline-none transition-all resize-none placeholder:text-[#A3AED0] font-medium text-sm leading-relaxed shadow-sm"
                />

                <div className="flex justify-between items-center mt-5">
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        ) : (
                            <CheckCircle2 size={14} className="text-[#05CD99]" />
                        )}
                        <span className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                            {isSaving ? 'Saving Changes...' : 'Live Sync Active'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black text-[#4318FF] dark:text-white bg-[#F4F7FE] dark:bg-[#1b254b] px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/5 uppercase tracking-widest">
                            {note.length} Characters
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}