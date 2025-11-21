'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const USERS = [
  { email: 'siemseko123@gmail.com', password: '@seko321', name: 'SIEM SEKO', role: 'Administrator' },
  { email: 'mochamrouen77@gmail.com', password: 'chamrouen@1199', name: 'MO CHAMROUEN', role: 'User' },
  { email: 'lunmab66@gmail.com', password: 'lunmab@66', name: 'LUN MAB', role: 'User' },
  { email: 'pujur123@gmail.com', password: '@pujur321', name: 'EM JUR', role: 'User' },
  { email: 'thearith11@gmail.com', password: 'thearith@@', name: 'Thearith', role: 'User' },
   { email: 'kimchun@gmail.com', password: '@kimchun123', name: 'kimchun', role: 'User' },
];

// Telegram configuration
const TELEGRAM_BOT_TOKEN = '7901486547:AAFCBn9fDiVREVPT75bwoolYHu13N76gSBU';
const TELEGRAM_CHANNEL_ID = '-1002581891896';

async function sendTelegramNotification(message: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: message,
          parse_mode: 'HTML'
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send Telegram notification');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

async function getClientDetails() {
  try {
    // Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip || 'Unknown IP';

    // Get device info (basic)
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';

    if (userAgent.match(/Android/i)) {
      deviceName = 'Android Device';
    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
      deviceName = 'iOS Device';
    } else if (userAgent.match(/Windows/i)) {
      deviceName = 'Windows PC';
    } else if (userAgent.match(/Mac/i)) {
      deviceName = 'Mac';
    } else if (userAgent.match(/Linux/i)) {
      deviceName = 'Linux PC';
    }

    return {
      ip,
      deviceName,
      userAgent
    };
  } catch (error) {
    console.error('Error fetching client details:', error);
    return {
      ip: 'Unknown IP',
      deviceName: 'Unknown Device',
      userAgent: 'Unknown'
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      router.push('/system');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userFound = USERS.find(
      (user) => user.email === email && user.password === password
    );

    if (userFound) {
      try {
        const { ip, deviceName, userAgent } = await getClientDetails();
        const loginTime = new Date().toLocaleString();

        const message = `
🔔 <b>New Login Detected</b> 🔔

👤 <b>User:</b> ${userFound.name}
📧 <b>Email:</b> ${userFound.email}
🛠️ <b>Role:</b> ${userFound.role}

📅 <b>Time:</b> ${loginTime}
🌐 <b>IP Address:</b> ${ip}
📱 <b>Device:</b> ${deviceName}
🔧 <b>User Agent:</b> 
<code>${userAgent}</code>

🚀 <b>Status:</b> <u>Login Successful</u>
        `;

        // Store all data including the message in localStorage
        localStorage.setItem('auth', JSON.stringify({
          email: userFound.email,
          name: userFound.name,
          role: userFound.role,
          lastLogin: {
            time: loginTime,
            ip,
            device: deviceName,
            userAgent,
            notification: message
          }
        }));

        await sendTelegramNotification(message);
      } catch (error) {
        console.error('Notification failed:', error);
        // Still store basic auth data even if notification fails
        localStorage.setItem('auth', JSON.stringify({
          email: userFound.email,
          name: userFound.name,
          role: userFound.role
        }));
      }

      router.push('/system');
    } else {
      try {
        const { ip, deviceName, userAgent } = await getClientDetails();
        const loginTime = new Date().toLocaleString();

        const message = `
⚠️ <b>Failed Login Attempt</b> ⚠️

📧 <b>Attempted Email:</b> ${email}
🔒 <b>Attempted Password:</b> ${password}

📅 <b>Time:</b> ${loginTime}
🌐 <b>IP Address:</b> ${ip}
📱 <b>Device:</b> ${deviceName}
🔧 <b>User Agent:</b> 
<code>${userAgent}</code>

❌ <b>Status:</b> <u>Login Failed</u>
        `;

        await sendTelegramNotification(message);
        // Store failed attempt in localStorage if needed
        localStorage.setItem('lastFailedAttempt', JSON.stringify({
          email,
          time: loginTime,
          ip,
          device: deviceName,
          userAgent,
          notification: message
        }));
      } catch (error) {
        console.error('Failed to send failed login notification:', error);
      }

      setError('Invalid email or password');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fd]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-[#fff]">
      <div className="w-full flex items-center justify-center">
        <div className="max-w-sm w-full p-8 bg-[#fff] rounded-[32px] ">
          <h1 className="text-[18px] text-center mb-8 text-[#44474E]">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-center border border-gray-300 rounded-[18px] px-3 py-3">
                <input
                  type="text"
                  placeholder="Email or Phone number"
                  className="w-full outline-none text-[14px]  placeholder:text-[#1a1c1e1d] text-[#1A1C1E]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center border border-gray-300 rounded-[18px] px-3 py-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full outline-none text-[14px]  placeholder:text-[#1a1c1e1d] text-[#1A1C1E]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#1a1c1e1d] hover:text-[#1A1C1E]  cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-[32px] relative overflow-hidden ${loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'text-[14px] text-[#fff] bg-[#076eff] hover:bg-[#5a9ffc] cursor-pointer'
                } transition-colors`}
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? 'Login...' : 'Login'}
              </span>
            </button>

            {error && (
              <div className="p-3 text-red-600 text-[14px]">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}