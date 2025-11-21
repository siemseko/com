import { Key } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LoginInfo() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Close popup when clicking outside
    useEffect(() => {
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

    const startClosing = () => {
        setIsClosing(true);
        timeoutRef.current = setTimeout(() => {
            setIsPopupVisible(false);
            setIsClosing(false);
        }, 200);
    };

    const togglePopup = () => {
        if (isPopupVisible) {
            startClosing();
        } else {
            setIsPopupVisible(true);
        }
    };

    return (
        <div className="relative">
            {/* Clickable button */}
            <div
                ref={buttonRef}
                className="text-[14px] text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5]  p-3 md:p-2 rounded-[32px] flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
                onClick={togglePopup}
            >
                <Key className="w-4 h-4 " />
                <span className=" hidden md:block">Info Your Login</span>
            </div>

            {/* CSS-animated popup */}
            {(isPopupVisible || isClosing) && (
                <div
                    ref={popupRef}
                    className={`absolute right-0 top-full mt-2 bg-[#e6ecff] rounded-[18px] shadow-2xl p-4 w-90 z-10 border border-gray-100 ${isClosing ? "animate-slide-out" : "animate-slide-in"
                        }`}
                >
                    <div className="text-[14px] text-gray-700 space-y-1">
                        <div className="pb-5">🔔 New Login Detected 🔔</div>
                        <div><b>👤 User:</b> {typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).name : 'null'}</div>
                        <div><b>📧 Email:</b> {typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).email : 'null'}</div>
                        <div className="pb-5"><b>🛠️ Role: </b>{typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).role : 'null'}</div>
                        <div><b>📅 Time:</b> {typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).lastLogin.time : 'null'}</div>
                        <div><b>🌐 IP Address: </b> <span className="text-blue-500 underline">{typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).lastLogin.ip : 'null'}</span></div>
                        <div><b>📱 Device:</b> {typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).lastLogin.device : 'null'}</div>
                        <div><b>🔧 User Agent:</b></div>
                        <div className="text-xs"> {typeof window !== 'undefined' && localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).lastLogin.userAgent : 'null'}</div>
                        <div><b>🚀 Status:</b> <span className="text-green-500"> Login Successful</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}