"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { my_links } from '@/data/links';
import Link from "next/link";
import Image from 'next/image';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: DashboardLayoutProps) => {
  // 1. Initialize state as null or a default to avoid hydration mismatch
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const fullPath = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

  // 2. Load the preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDark');
    // Default to true if no value is found, otherwise parse the saved string
    setIsDark(savedTheme !== null ? JSON.parse(savedTheme) : true);

  }, []);

  // 3. Update localStorage and HTML class whenever isDark changes
  useEffect(() => {
    if (isDark === null) return; // Wait until initial mount is done

    localStorage.setItem('isDark', JSON.stringify(isDark));

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);



  // Prevent "flicker" of white during hydration by not rendering 
  // until we know the theme (isDark is no longer null)
  if (isDark === null) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* --- SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 px-5 py-8 overflow-y-auto bg-white border-r dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 relative w-[62px] h-[62px] flex items-center justify-center">
              <Image
                src="https://siemseko.github.io/ai/logo.png"
                width={48}
                height={48}
                className="object-contain"
                alt="logo"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">Dash</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1 mt-10">
          <nav className="space-y-2">
            {my_links.map((link) => {
              const isActive = fullPath === link.path || currentTab === link.id;
              return (
                <Link
                  key={link.tag}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  href={link.path}
                >
                  {link.icon}
                  <span className={`mx-2 text-sm font-medium `}>
                    {link.link}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                New Version Available
              </h2>
              <button className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                Update Now
              </button>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-x-2">
                <Image className="w-8 h-8 rounded-full border dark:border-gray-700" src={process.env.NEXT_PUBLIC_API_URL + '/images/profile/default.jpg'} alt="User" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700 dark:text-white">Alex Doe</span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    Logout
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;