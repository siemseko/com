'use client';

import { Key } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

export function LoginInfo() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                startClosing();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Safely parse auth data once on mount
    const auth = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem('auth');
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }, []); // Empty dependency array fixed

    const startClosing = () => {
        setIsClosing(true);
        timeoutRef.current = setTimeout(() => {
            setIsPopupVisible(false);
            setIsClosing(false);
        }, 200);
    };

    const togglePopup = () => {
        if (isPopupVisible) startClosing();
        else setIsPopupVisible(true);
    };

    if (!isMounted) return null;

    return (
        <div className="relative">
            <div
                ref={buttonRef}
                className="text-[14px] text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5] p-3 md:p-2 rounded-[32px] flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
                onClick={togglePopup}
            >
                <Key className="w-4 h-4 " />
                <span className="hidden md:block">Info Your Login</span>
            </div>

            {(isPopupVisible || isClosing) && (
                <div
                    ref={popupRef}
                    className={`absolute right-0 top-full mt-3 bg-white rounded-3xl shadow-2xl p-6 w-80 md:w-96 z-50 border border-slate-100 ${
                        isClosing ? "animate-slide-out" : "animate-slide-in"
                    }`}
                >
                    <div className="text-[13px] text-slate-600 space-y-2">
                        <div className="pb-3 text-slate-800 font-bold border-b border-slate-50 mb-3 flex items-center gap-2">
                           <span className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                           </span>
                           New Login Detected
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1">
                            <div><b>👤 User:</b> {auth?.name || 'Unknown'}</div>
                            <div><b>📧 Email:</b> {auth?.email || 'N/A'}</div>
                            <div className="pb-2"><b>🛠️ Role:</b> {auth?.role || 'User'}</div>
                            
                            <div className="pt-2 border-t border-slate-50">
                                <b>📅 Time:</b> {auth?.lastLogin?.time || 'N/A'}
                            </div>
                            <div>
                                <b>🌐 IP Address:</b> 
                                <span className="text-blue-600 ml-1 truncate block md:inline underline decoration-blue-200">
                                    {auth?.lastLogin?.ip || '0.0.0.0'}
                                </span>
                            </div>
                            <div><b>📱 Device:</b> {auth?.lastLogin?.device || 'Unknown Device'}</div>
                            
                            <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <b className="text-[11px] uppercase text-slate-400 block mb-1">🔧 User Agent</b>
                                <div className="text-[10px] leading-relaxed break-all text-slate-400 italic">
                                    {auth?.lastLogin?.userAgent || 'No data available'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 flex items-center gap-2">
                            <div className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-md uppercase">
                                Status: Successful
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}