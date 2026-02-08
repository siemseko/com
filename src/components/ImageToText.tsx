'use client';

import { useEffect, useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { Copy, History, CheckCircle2, Loader2, Trash2, Languages, Sparkles, XCircle } from 'lucide-react';
import NotePage from './Note';

export default function ImageToText() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ocrHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleConvert = useCallback(async (imgFile: File) => {
    setLoading(true);
    setText('');
    setError('');

    try {
      // Supporting Khmer and English based on user interest
      const result = await Tesseract.recognize(imgFile, 'khm+eng');
      const extracted = result.data.text.trim();

      if (!extracted) {
        setError('No text detected in this image.');
      } else {
        setText(extracted);
        const updatedHistory = [extracted, ...history.filter(h => h !== extracted)].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('ocrHistory', JSON.stringify(updatedHistory));
      }
    } catch {
      setError('OCR Engine error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      handleConvert(image);
    }
  }, [image, handleConvert]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) setImage(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleCopyText = () => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column: Extraction Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-[#111c44] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden relative shadow-sm">
            <div className="p-5 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-[#111c44]/50 backdrop-blur-md">
              <h2 className=" text-[#2B3674] dark:text-white text-lg flex items-center gap-3 pl-2">
                <Sparkles className="text-[#4318FF] dark:text-[#7551FF]" size={20} />
                Text Extraction
              </h2>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7FE] dark:bg-[#0b1437] rounded-full text-[#4318FF] dark:text-white">
                  <Languages size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">KHM + ENG</span>
                </div>
                <button
                  onClick={handleCopyText}
                  disabled={!text || loading}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black transition-all duration-200 text-[11px] uppercase tracking-widest ${text && !loading
                      ? 'bg-[#4318FF] dark:bg-[#7551FF] text-white hover:opacity-90 active:scale-95'
                      : 'bg-gray-100 dark:bg-[#0b1437] text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                >
                  {copySuccess ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 relative bg-[#F4F7FE]/30 dark:bg-[#0b1437]/20">
              {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-[#0b1437]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#4318FF] dark:text-[#7551FF] animate-spin mb-3" />
                  <p className="text-[11px] font-black text-[#2B3674] dark:text-white uppercase tracking-[3px]">Processing</p>
                </div>
              )}

              <textarea
                value={text}
                placeholder="Transcribe image content here..."
                onChange={(e) => setText(e.target.value)}
                className="w-full h-[500px] p-6 rounded-2xl bg-white dark:bg-[#111c44] border border-gray-100 dark:border-white/10 text-[#2B3674] dark:text-[#F1F1F1] leading-relaxed focus:ring-2 focus:ring-[#4318FF]/20 outline-none resize-none custom-scroll text-sm font-medium placeholder:text-[#A3AED0]"
              />

              {error && (
                <div className="mt-4 p-4 bg-[#FF5B5B]/10 border border-[#FF5B5B]/20 rounded-xl text-[#FF5B5B] text-xs  flex items-center gap-2">
                  <XCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          </div>

          <NotePage />
        </div>

        {/* Right Column: Sidebar Controls */}
        <div className="lg:w-85 xl:w-96 space-y-6">
          <div className="bg-white dark:bg-[#111c44] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 space-y-6 sticky">
            <h3 className="font-black text-[11px] uppercase tracking-[3px] text-[#A3AED0] flex items-center gap-2">
              Source Assets
            </h3>

            <label className="group flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl cursor-pointer hover:bg-[#F4F7FE] dark:hover:bg-[#ffffff05] hover:border-[#4318FF] transition-all overflow-hidden relative">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  fill
                  unoptimized
                  className="absolute inset-0 w-full h-full object-contain transition-opacity group-hover:opacity-20"
                />
              ) : null}

              <div className={`flex flex-col items-center p-6 text-center z-10 transition-all ${image ? 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100' : ''}`}>
                <div className="w-16 h-16 rounded-2xl bg-[#F4F7FE] dark:bg-[#0b1437] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#4318FF]/10">
                  <CloudArrowUpIcon className="w-8 h-8 text-[#A3AED0] group-hover:text-[#4318FF]" />
                </div>
                <p className="text-[12px]  text-[#2B3674] dark:text-white uppercase tracking-widest">Select Image</p>
                <p className="text-[10px] text-[#A3AED0] mt-1 font-medium">Drop or Paste Image</p>
              </div>

              <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            </label>

            {image && (
              <div className="flex items-center justify-between bg-[#F4F7FE] dark:bg-[#0b1437] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex flex-col min-w-0">
                  <p className="text-[11px]  text-[#2B3674] dark:text-white truncate uppercase tracking-tighter">{image.name}</p>
                  <p className="text-[9px] text-[#A3AED0]  uppercase">Ready to scan</p>
                </div>
                <button onClick={() => setImage(null)} className="p-2 text-[#FF5B5B] hover:bg-[#FF5B5B]/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="bg-[#F4F7FE] dark:bg-[#0b1437] p-5 rounded-2xl border border-gray-100 dark:border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0] mb-4 flex items-center gap-2">
                <History size={14} /> History
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-1">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setText(item)}
                      className="p-3 bg-white dark:bg-[#111c44] border border-gray-50 dark:border-white/5 rounded-xl cursor-pointer hover:border-[#4318FF]/40 transition-all group"
                    >
                      <p className="text-[12px] text-[#707EAE] dark:text-[#A3AED0] line-clamp-2 leading-relaxed font-medium">
                        {item}
                      </p>
                      <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-[#4318FF] dark:text-[#7551FF] uppercase tracking-widest">Restore</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0] opacity-40">Empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}