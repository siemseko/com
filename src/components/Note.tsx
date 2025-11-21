'use client';
import { useEffect, useState } from 'react';

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
        <div className="bg-[#e2e3e4] rounded-[18px]">
            {/* Main Note Card */}
            <div className="bg-[#e2e3e4] rounded-[18px] p-4">
                <h2 className="text-[#1A1C1E] mb-4">My Note</h2>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full h-50 p-4 text-gray-700 bg-[#e2e3e4] border-gray-300 border border-[#efefef] rounded-[18px] focus:outline-none resize-none transition-all"
                />
                <div className="flex justify-end items-end mt-4 text-[14px] text-[#1A1C1E]">
                    <span>{note.length} characters</span>
                </div>
            </div>
        </div>
    );
}