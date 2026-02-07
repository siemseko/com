'use client';
import { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';

export default function NotePage() {
    const [note, setNote] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        const savedNote = localStorage.getItem('note');
        if (savedNote) {
            setNote(savedNote);
        }
    }, []);

    // Save to localStorage whenever note changes
    useEffect(() => {
        localStorage.setItem('note', note);
    }, [note]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            {/* Main Note Card */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <StickyNote size={20} className="text-blue-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                        My Note
                    </h2>
                </div>

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full h-48 p-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                />

                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                        Auto-saves to local storage
                    </span>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {note.length} characters
                    </div>
                </div>
            </div>
        </div>
    );
}