'use client';

import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { Copy } from 'lucide-react';
import NotePage from './Note';

export default function ImageToText() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState('');

  // Load saved history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ocrHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Auto-convert when image changes
  useEffect(() => {
    if (image) {
      handleConvert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const handleConvert = async () => {
    if (!image) return;
    setLoading(true);
    setText('');
    setError('');

    try {
      const result = await Tesseract.recognize(image, 'khm+eng', {
        logger: (m) => console.log(m),
      });
      const extracted = result.data.text.trim();
      setText(extracted);

      const updatedHistory = [extracted, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('ocrHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setError('Failed to extract text. Please try another image.');
    }

    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setText('');
      setError('');
    }
  };

  // Ctrl+V paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              setImage(file);
              setText('');
              setError('');
            }
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
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }).catch((err) => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-4">

         <div className="lg:w-3/4">
          <div className="bg-[#e2e3e4] rounded-[18px] p-4 mb-4">
            {/* OCR result */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[#1A1C1E] mb-4">Extracted Text</h2>
                <button
                  onClick={handleCopyText}
                  disabled={!text || loading}
                  className={`flex items-center gap-1 px-3 py-2 rounded-[32px] text-white  ${text && !loading ? ' bg-[#076eff] hover:bg-[#1a73e8] cursor-pointer' : 'bg-[#076eff8e] cursor-not-allowed'} transition-colors`}
                >
                  <Copy className="h-4 w-4" />
                  <span className='text-[14px]'>{copySuccess || 'Copy'}</span>
                </button>
              </div>

              <textarea
                value={loading ? 'Extracting text...' : text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 p-3 outline-none bg-[#e2e3e4]  rounded-lg text-[#1A1C1E] border-gray-300  border border-[#efefef] resize-none"
                readOnly={loading}
              />

              {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
            </div>
          </div>
          <NotePage/>
        </div>
        <div className="lg:w-1/4 space-y-4">
          <div className="bg-[#e2e3e4] rounded-[18px] p-4">
            <h2 className="text-[#1A1C1E] mb-4">Image Preview</h2>
            {/* Upload section */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-gray-300 border border-[#efefef] rounded-[18px] cursor-pointer hover:bg-[#e2e3e4]  transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500  mt-1">Or paste (Ctrl+V) an image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Image preview */}
            {image && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Uploaded preview"
                  className="max-h-96 w-full object-contain mx-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>



          {/* History */}
          <div className="bg-[#e2e3e4] rounded-[18px] p-4 ">
            {history.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-gray-800">Recent Extractions</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scroll">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-[#e2e3e4]  rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors border-gray-300 border border-[#efefef]"
                      onClick={() => setText(item)}
                    >
                      <p className="text-[14px] text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}