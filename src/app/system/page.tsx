'use client';

import { useState, useRef, useEffect } from 'react';
import { Images, LetterText} from 'lucide-react';
import ResizeImages from '@/components/ResizeImages';
import Navbar from '@/components/Navbar';
import ImageToText from '@/components/ImageToText';

export default function CompanyInfoForm() {
  const [activeSection, setActiveSection] = useState('resize_images');
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update indicator position when active section changes
  useEffect(() => {
    const activeTabIndex = ['welcome', 'resize_images', 'image_to_text', 'image_sequence_to_video', 'text_to_voice', 'note'].indexOf(activeSection);
    const activeTab = tabRefs.current[activeTabIndex];

    if (activeTab) {
      setIndicatorStyle({
        top: activeTab.offsetTop,
        height: activeTab.offsetHeight
      });
    }
  }, [activeSection]);

  return (
    <main className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation - now properly sticky and non-scrolling */}
        <div className="w-5 md:w-50 flex-shrink-0 flex flex-col">
          <div className="flex flex-col h-full justify-between">
            <nav className="space-y-4 md:space-y-1 relative mt-5">
              {/* Animated indicator line */}
              <div
                className="absolute left-0 w-1 bg-[#888] transition-all duration-300 ease-in-out"
                style={{
                  top: indicatorStyle.top + 4,
                  height: indicatorStyle.height - 8
                }}
              />

              {/* Resize Images Button */}
              <button
                ref={el => { tabRefs.current[1] = el; }}
                onClick={() => setActiveSection('resize_images')}
                className={`w-full flex items-center justify-between px-4 md:ml-5 rounded-[32px] transition-colors duration-200 cursor-pointer ${activeSection === 'resize_images' ? 'md:bg-[#ebeef9] text-[#1A1C1E]' : 'text-[#44474E] hover:bg-[#ebeef9]'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Images className="w-4 h-4" />
                  <span className="hidden md:inline text-[14px] py-[10px]">Resize Images</span>
                </span>
              </button>

              {/* Image To Text Button */}
              <button
                ref={el => { tabRefs.current[2] = el; }}
                onClick={() => setActiveSection('image_to_text')}
                className={`w-full flex items-center justify-between px-4 md:ml-5 rounded-[32px] transition-colors duration-200 cursor-pointer ${activeSection === 'image_to_text' ? 'md:bg-[#ebeef9] text-[#1A1C1E]' : 'text-[#44474E] hover:bg-[#ebeef9]'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <LetterText className="w-4 h-4" />
                  <span className="hidden md:inline text-[14px] py-[10px]">Image To Text</span>
                </span>
              </button>
              {/* Indicator dot (hidden on mobile) */}
              <div
                className="absolute hidden md:block right-0 w-2 h-2 rounded-full bg-[#888] transition-all duration-300 ease-in-out"
                style={{
                  top: indicatorStyle.top + (indicatorStyle.height / 2),
                  transform: 'translateY(-50%)'
                }}
              />
            </nav>

            {/* Disclaimer text at the bottom */}
            <div className="p-4 text-xs text-gray-500 hidden md:block ">
              This model is for testing only. No production use.
            </div>
          </div>
        </div>

        {/* Main content area with scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="transition-opacity duration-300 min-h-full">
              {activeSection === 'resize_images' && (
                <div className="space-y-6 animate-fadeIn">
                  <ResizeImages />
                </div>
              )}
              {activeSection === 'image_to_text' && (
                <div className="space-y-6 animate-fadeIn">
                  <ImageToText />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}