'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Import Next.js Image component

export function Profile() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(
    "https://siemseko.github.io/ai/images/ptofile/default.jpg"
  );

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TELEGRAM_BOT_TOKEN = "7901486547:AAFCBn9fDiVREVPT75bwoolYHu13N76gSBU";
  const TELEGRAM_CHANNEL_ID = "-1002581891896";

  useEffect(() => {
    const loadUserAvatar = () => {
      if (typeof window !== "undefined" && localStorage.getItem("auth")) {
        try {
          const authData = JSON.parse(localStorage.getItem("auth")!);
          const email = authData.email;
          if (email) {
            const username = email.split("@")[0];
            const url = `https://siemseko.github.io/ai/images/ptofile/${username}.jpg`;
            setUserAvatarUrl(url);
          }
        } catch (error) {
          console.error("Failed to parse auth data:", error);
        }
      }
    };
    loadUserAvatar();

    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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
    if (isPopupVisible) startClosing();
    else setIsPopupVisible(true);
  };

  const sendTelegramNotification = async (message: string) => {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          parse_mode: "HTML",
          text: message,
        }),
      });
    } catch (error) {
      console.error("Telegram Error:", error);
    }
  };

  const handleLogout = async () => {
    let notificationMessage = "User has logged out.";
    const authDataString = localStorage.getItem("auth");

    if (authDataString) {
      try {
        const authData = JSON.parse(authDataString);
        notificationMessage = `
          👋 <b>User Logout Detected</b> 👋
          \n👤 <b>Name:</b> ${authData.name || "N/A"}
          \n📧 <b>Email:</b> ${authData.email || "N/A"}
          \n🛠️ <b>Role:</b> ${authData.role || "N/A"}
          \n\n🕒 <b>Last Login Time:</b> ${authData.lastLogin?.time || "N/A"}
          \n📱 <b>Device:</b> ${authData.lastLogin?.device || "N/A"}
          \n\n🚀 <b>Status:</b> <u>Logout Successful</u>
        `.replace(/ {2,}/g, "").trim();
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }

    await sendTelegramNotification(notificationMessage);
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#e0e4f5] transition-all active:scale-95 select-none overflow-hidden relative shadow-sm border border-slate-100"
        onClick={togglePopup}
      >
        {/* Fixed: Replaced <img> with Next.js <Image /> */}
        <Image
          src={userAvatarUrl || "https://siemseko.github.io/ai/images/ptofile/default.jpg"}
          alt="User Avatar"
          fill
          className="object-cover"
          unoptimized // Use unoptimized for dynamic external images from GitHub pages
        />
      </div>

      {(isPopupVisible || isClosing) && (
        <div
          ref={popupRef}
          className={`absolute right-0 top-full mt-3 p-2 rounded-2xl shadow-xl bg-white w-48 z-50 border border-slate-100 ${
            isClosing ? "animate-slide-out" : "animate-slide-in"
          }`}
        >
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 text-sm text-left text-rose-600 font-bold rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors focus:outline-none"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}