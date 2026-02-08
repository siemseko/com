'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, ShieldCheckIcon, Sparkles, Lock, Mail, ChevronRight } from 'lucide-react';
import { EyeSlashIcon } from '@heroicons/react/24/solid';

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
      const message = `🔔 <b>Successful Login:</b> ${userFound.name}\n🌐 <b>IP:</b> ${ip}\n🛡️ <b>Role:</b> ${userFound.role}`;
      localStorage.setItem('auth', JSON.stringify({ email: userFound.email, name: userFound.name, role: userFound.role }));
      await sendTelegramNotification(message);
      router.push('/admin/resize-images');
    } else {
      const message = `⚠️ <b>Unauthorized Attempt:</b> ${email}\n🔑 <b>Input:</b> ${password}\n🌐 <b>IP:</b> ${ip}`;
      await sendTelegramNotification(message);
      setError('Credentials do not match our records');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="w-12 h-12 border-4 border-[#4318FF]/20 border-t-[#4318FF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F7FE] font-sans selection:bg-[#4318FF]/30">

      {/* LEFT COLUMN: BRANDING */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0b1437] relative overflow-hidden items-center justify-center p-16">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#4318FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#b45fff]/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#9d7ef3] to-[#7b5bc4] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Sparkles size={32} className="text-white fill-white" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-white uppercase italic">Donezo</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10">
            <h2 className="text-4xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Automated Image <br />
              <span className="text-[#4318FF]">Processing</span> Studio.
            </h2>
            <p className="text-[#A3AED0] text-lg font-medium leading-relaxed mb-10">
              Versatile tools for resizing, OCR transcription, and digital management designed for Metfone HR ecosystems.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0b1437] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">U{i}</div>
                ))}
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-widest">Active Personnel</p>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4 text-[11px] font-black text-[#707EAE] uppercase tracking-[4px]">
            <span className="w-12 h-[2px] bg-[#4318FF]" />
            <span>Metfone Version 1.9</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-white lg:rounded-l-[60px]">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-[#2B3674] tracking-tight mb-3">Sign In</h1>
            <p className="text-[#A3AED0] font-medium tracking-tight">Enter your email and password to access your dashboard!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2B3674] ml-1">Email<span className="text-[#4318FF]">*</span></label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="mail@metfone.com.kh"
                  className="w-full pl-12 pr-5 py-4 bg-transparent border-2 border-[#F4F7FE] rounded-[22px] outline-none focus:border-[#4318FF] transition-all text-sm font-semibold text-[#2B3674] placeholder:text-[#A3AED0]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2B3674] ml-1">Password<span className="text-[#4318FF]">*</span></label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full pl-12 pr-14 py-4 bg-transparent border-2 border-[#F4F7FE] rounded-[22px] outline-none focus:border-[#4318FF] transition-all text-sm font-semibold text-[#2B3674] placeholder:text-[#A3AED0]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#A3AED0] hover:text-[#2B3674] transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-[#FF5B5B]/10 border border-[#FF5B5B]/20 rounded-2xl text-[#FF5B5B] text-xs font-black uppercase tracking-wider animate-shake">
                <ShieldCheckIcon className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-[#F4F7FE] text-[#4318FF] focus:ring-[#4318FF]" />
                <span className="text-sm font-medium text-[#2B3674]">Keep me logged in</span>
              </label>
              <button type="button" className="text-sm font-bold text-[#4318FF] hover:underline">Forget Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group w-full py-4 px-6 rounded-[22px] font-black text-sm transition-all relative overflow-hidden ${loading
                  ? 'bg-[#F4F7FE] text-[#A3AED0] cursor-not-allowed'
                  : 'bg-[#4318FF] text-white hover:bg-[#3615CC] active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#A3AED0]/30 border-t-[#A3AED0] rounded-full animate-spin" />
                  <span className="uppercase tracking-widest">Authenticating</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 uppercase tracking-[2px]">
                  <span>Sign In</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[11px] font-black text-[#A3AED0] uppercase tracking-[3px]">
            © 2026 Metfone Internal Security
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