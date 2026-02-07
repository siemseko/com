"use client";
import { my_links } from "@/data/links";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

const MyLink = ({ lang }: { lang: 'en' | 'km' }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab");
  const fullPath = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

  return (
    <nav className="p-0"> {/* Adjusted padding to fit fixed sidebar */}
      <ul className="flex flex-col gap-2">
        {my_links.map((link, idx) => {
          const isActive = fullPath === link.path || currentTab === link.id;

          return (
            <li key={idx} className="relative flex items-center group">
              {/* Blue Vertical Indicator */}
              <div
                className={clsx(
                  "absolute left-[-20px] w-1.5 bg-blue-600 rounded-r-full transition-all duration-300 ease-in-out",
                  isActive ? "h-8 opacity-100" : "h-0 opacity-0"
                )}
              />

              <Link
                href={link.path}
             className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <span className={clsx(
                  "transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300"
                )}>
                  {link.icon}
                </span> 

                <span className={`mx-2 text-sm font-medium ${lang === 'km' ? 'font-khmer text-xs' : ''}`}>
                  {link.link}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MyLink;