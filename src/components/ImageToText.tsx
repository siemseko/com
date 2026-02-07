'use client';

import { useEffect, useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { Copy, History, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import NotePage from './Note';

export default function ImageToText() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load saved history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ocrHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Cleanup Object URL to prevent memory leaks
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
      // Supporting Khmer and English
      const result = await Tesseract.recognize(imgFile, 'khm+eng', {
        logger: (m) => console.log(m),
      });
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
      setError('OCR Engine error. Please check your connection or try again.');
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
    <div className="max-w-7xl mx-auto animate-fadeIn transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Extraction Area */}
        <div className="lg:w-3/4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                Extracted Text
              </h2>
              <button
                onClick={handleCopyText}
                disabled={!text || loading}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
                  text && !loading 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none hover:bg-blue-700 active:scale-95' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span className="text-sm">{copySuccess ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-6 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-colors">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-200">Reading Image...</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Processing Khmer & English characters</p>
                </div>
              )}
              
              <textarea
                value={text}
                placeholder="The text will appear here after you upload or paste an image..."
                onChange={(e) => setText(e.target.value)}
                className="w-full h-80 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none custom-scroll font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />

              {error && (
                <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <NotePage />
        </div>

        {/* Right Column: Controls & History */}
        <div className="lg:w-1/4 space-y-6">
          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              Source Image
            </h3>
            
            <label className="group flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all mb-4 overflow-hidden relative">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  fill
                  unoptimized
                  className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-30"
                />
              ) : null}
              
              <div className={`flex flex-col items-center p-4 text-center z-10 ${image ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                <CloudArrowUpIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2 group-hover:text-blue-500 transition-colors" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Upload Image</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Drag/Drop or Paste</p>
              </div>
              
              <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            </label>
            
            {image && (
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 truncate px-2">
                    Current: {image.name}
                </p>
            )}
          </div>

          {/* History Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <History size={18} className="text-slate-400 dark:text-slate-500" />
              History
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-1">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setText(item)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-200 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group"
                  >
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item}
                    </p>
                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Restore</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 dark:text-slate-600">No recent extractions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}