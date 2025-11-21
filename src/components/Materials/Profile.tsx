import { useState, useRef, useEffect } from "react";

export function Profile() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // State to hold the user's avatar URL
  const [userAvatarUrl, setUserAvatarUrl] = useState(
    "https://siemseko.github.io/ai/images/ptofile/default.jpg"
  );

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Telegram configuration
  const TELEGRAM_BOT_TOKEN = "7901486547:AAFCBn9fDiVREVPT75bwoolYHu13N76gSBU";
  const TELEGRAM_CHANNEL_ID = "-1002581891896";

  // Effect to load user data and handle outside clicks
  useEffect(() => {
    // Dynamically load user avatar from localStorage
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
          console.error("Failed to parse auth data from localStorage:", error);
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
    if (isPopupVisible) {
      startClosing();
    } else {
      setIsPopupVisible(true);
    }
  };

  const sendTelegramNotification = async (message: string) => {
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          parse_mode: "HTML",
          text: message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Telegram notification sent successfully:", data);
      } else {
        console.error("Failed to send Telegram notification:", data);
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  };

  const handleLogout = async () => {
    let notificationMessage = "User has logged out.";

    const authDataString = localStorage.getItem("auth");
    if (authDataString) {
      try {
        const authData = JSON.parse(authDataString);
        const email = authData.email || "N/A";
        const name = authData.name || "N/A";
        const role = authData.role || "N/A";
        const lastLoginTime = authData.lastLogin?.time || "N/A";
        const lastLoginDevice = authData.lastLogin?.device || "N/A";

        notificationMessage = `
          👋 <b>User Logout Detected</b> 👋
          \n👤 <b>Name:</b> ${name}
          \n📧 <b>Email:</b> ${email}
          \n🛠️ <b>Role:</b> ${role}
          \n\n🕒 <b>Last Login Time:</b> ${lastLoginTime}
          \n📱 <b>Device:</b> ${lastLoginDevice}
          \n\n🚀 <b>Status:</b> <u>Logout Successful</u>
        `.replace(/ {2,}/g, "").trim();
      } catch (error) {
        console.error("Error parsing 'auth' data from localStorage:", error);
      }
    } else {
      console.warn("No 'auth' data found in localStorage.");
    }

    await sendTelegramNotification(notificationMessage);

    localStorage.removeItem("auth");
    window.location.href = "/ai/login";
  };

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        className="
          w-10 h-10
          flex items-center justify-center
          rounded-full
          cursor-pointer
          hover:bg-[#e0e4f5]
          transition-colors
          active:scale-95
          select-none
          overflow-hidden
        "
        onClick={togglePopup}
      >
        <img
          src={userAvatarUrl ||"https://siemseko.github.io/ai/images/ptofile/default.jpg" } // Use the dynamic URL here
          alt="User Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {(isPopupVisible || isClosing) && (
        <div
          ref={popupRef}
          className={`absolute right-0 md:right-0 top-full mt-2 rounded-[18px] shadow-2xl bg-[#e6ecff] w-50 z-10 border border-gray-100 ${
            isClosing ? "animate-slide-out" : "animate-slide-in"
          }`}
        >
          <button
            onClick={handleLogout}
            className="
              w-full
              py-2 px-4
              text-left text-red-600 font-medium
              rounded-lg
              bg-red-50
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
            "
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}