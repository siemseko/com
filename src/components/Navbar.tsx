'use client';

import { LoginInfo } from './Materials/LoginInfo';
import { Profile } from './Materials/Profile';

export default function Navbar() {

  // Replace with your actual logo
  const Logo = () => (
    <div className="flex items-center">
      <img src="https://siemseko.github.io/ai/logo.png" width="70px" height="70px" alt="logo" />
      <div>
        <div className='text-[#000] text-[16px] bg-gradient-to-r from-[#002e75] to-[#076dfe] bg-clip-text text-transparent kantumruyPro'>ប្រព័ន្ធស្វ័យប្រវត្តិកម្មឌីជីថលកែសម្រួលរូបភាព-ជំនាន់ទី១</div>
        <div className='text-[#9197A3] text-[16px] kantumruyPro'>Digital Automated Image Editing System</div>
      </div>
    </div>
  );

  return (
    <nav className="px-4 py-3 flex items-center justify-between">
      {/* Left side - Logo */}
      <div className="flex items-center">
        <Logo />
      </div>

      {/* Right side - Navigation items */}
      <div className="flex items-center space-x-4">
        <LoginInfo />
        <div className=' hidden md:block  text-[14px] text-[#1A1C1E]'>Version: <span className='text-[#076eff]'> v1.9</span></div>
        <Profile />
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>
    </nav>
  );
}