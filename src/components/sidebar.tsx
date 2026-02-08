"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Moon, Search, Bell, Settings, Menu, X, Sparkles } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { my_links } from '@/data/links';
import Link from "next/link";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: DashboardLayoutProps) => {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const fullPath = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

  useEffect(() => {
    const savedTheme = localStorage.getItem('isDark');
    setIsDark(savedTheme !== null ? JSON.parse(savedTheme) : false);
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    localStorage.setItem('isDark', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  if (isDark === null) {
    return <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0b1437]" />;
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FE] dark:bg-[#0b1437] text-[#2B3674] dark:text-white transition-colors duration-500 font-sans selection:bg-[#4318FF]/30">

      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0b1437]/40 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MODERN SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] flex flex-col w-72 bg-white dark:bg-[#111c44] border-r border-gray-200 dark:border-white/5 transition-all duration-500 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Section */}
        <div className="flex items-center justify-between px-8 h-24">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4318FF] to-[#b45fff] flex items-center justify-center transition-transform group-hover:rotate-12">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">Donezo</span>
          </div>
          <button className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="px-4 flex-1 overflow-y-auto custom-scroll space-y-8">
          <div>
            <p className="px-6 text-[10px] font-black text-[#A3AED0] uppercase tracking-[3px] mb-4">Core Menu</p>
            <nav className="space-y-1.5">
              {my_links.map((link) => {
                const isActive = fullPath === link.path || currentTab === link.id;
                return (
                  <Link
                    key={link.tag}
                    href={link.path}
                    className={`group flex items-center px-6 py-3.5 rounded-2xl transition-all duration-300 relative ${isActive
                        ? 'bg-[#F4F7FE] dark:bg-[#ffffff0a] '
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className={`transition-colors duration-300 ${isActive ? 'text-[#4318FF] dark:text-[#7551FF]' : 'text-[#A3AED0] group-hover:text-[#4318FF]'}`}>
                      {link.icon}
                    </span>
                    <span className={`ml-4 text-[15px]   ${isActive ? 'text-[#2B3674] dark:text-white' : 'text-[#A3AED0] group-hover:text-[#2B3674] dark:group-hover:text-white'}`}>
                      {link.link}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-6 text-[10px] font-black text-[#A3AED0] uppercase tracking-[3px] mb-4">Preferences</p>
            <div className="space-y-1.5">
              <button onClick={() => setIsDark(!isDark)} className="flex items-center w-full px-6 py-3.5 text-[#A3AED0] hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                <div className="transition-transform group-hover:scale-110">
                  {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
                </div>
                <span className="ml-4 text-[15px]  tracking-tight">Theme Mode</span>
              </button>
              <button className="flex items-center w-full px-6 py-3.5 text-[#FF5B5B] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all mt-4 ">
                <LogOut size={20} />
                <span className="ml-4 text-[15px] tracking-tight">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Support Card */}
        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-[#4318FF] to-[#7551FF] rounded-[32px] p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <p className="text-[15px] font-black relative z-10">Donezo Pro</p>
            <p className="text-[11px] opacity-70 mt-1 relative z-10 leading-relaxed font-medium">Unlock advanced analytics and team collaboration tools.</p>
            <button className="mt-5 w-full bg-white text-[#4318FF] py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-opacity-90 active:scale-95 transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">

        {/* Floating Glass Header */}
        <header className="h-24 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-40 bg-[#F4F7FE]/60 dark:bg-[#0b1437]/60 backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-3 bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 text-[#2B3674] dark:text-white active:scale-90 transition-transform"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex flex-col">
              <p className="text-[11px]  text-[#A3AED0] uppercase tracking-widest">Workspace / Overview</p>
              <p className="text-2xl font-black tracking-tighter text-[#2B3674] dark:text-white">Main Dashboard</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111c44] rounded-3xl p-1.5 flex items-center gap-1.5 border border-gray-200 dark:border-white/5 shadow-sm">
            <div className="relative hidden md:block pl-3 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" size={14} />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-[#F4F7FE] dark:bg-[#0b1437] border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs w-60 focus:ring-2 focus:ring-[#4318FF]/20 transition-all outline-none "
              />
            </div>
            <div className="flex items-center pr-1 gap-1">
              <button className="p-2.5 text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"><Bell size={18} /></button>
              <button className="p-2.5 text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"><Settings size={18} /></button>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7b5bc4] to-[#9d7ef3] flex items-center justify-center text-white text-xs font-black ml-2 ring-4 ring-white/50 dark:ring-white/5 shadow-inner">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;