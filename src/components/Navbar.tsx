'use client';

import Image from 'next/image'; // Import Next.js Image component
import { LoginInfo } from './Materials/LoginInfo';
import { Profile } from './Materials/Profile';

export default function Navbar() {
  const Logo = () => (
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 relative w-[62px] h-[62px] flex items-center justify-center">
        {/* Fixed: Replaced <img> with Next.js <Image /> */}
        <Image 
          src="https://siemseko.github.io/ai/logo.png" 
          width={48} 
          height={48} 
          className="object-contain" 
          alt="logo"
          priority // Added priority to fix LCP warning
        />
      </div>
      <div className="flex flex-col">
        <h1 className='text-[15px] font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent kantumruyPro leading-tight'>
          ប្រព័ន្ធស្វ័យប្រវត្តិកម្មឌីជីថលកែសម្រួលរូបភាព
        </h1>
        <p className='text-slate-400 text-[13px] font-medium tracking-tight'>
          Digital Automated Image Editing System
        </p>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Logo />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className='text-[12px] font-semibold text-slate-600'>v1.9 Stable</span>
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <LoginInfo />
          <Profile />
        </div>
      </div>
    </nav>
  );
}