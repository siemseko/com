'use client';
import { AudioWaveform } from 'lucide-react';
import React, { useState, useRef } from 'react';

const TextToVoiceHighlight: React.FC = () => {
  const [text, setText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const words = text.trim().split(/\s+/);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSpeak = () => {
    if (!text) return;

    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setSpeaking(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }

      setSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;

      const approxDuration = 1000 * (text.length / 10);
      const wordDuration = approxDuration / words.length;

      let i = 0;
      const highlightNextWord = () => {
        if (i < words.length) {
          i++;
          timerRef.current = setTimeout(highlightNextWord, wordDuration);
        } else {
          setSpeaking(false);
        }
      };
      highlightNextWord();

      utterance.onend = () => {
        setSpeaking(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      };

      speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support Text-to-Speech.');
    }
  };

  return (
    <div className='container mx-auto px-4'>
      <div className="p-4 bg-[#ffffffb2] rounded-[18px] ">
        <h2 className="text-[#1A1C1E] mb-4">Text to Voice with Word Highlight</h2>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here"
          className="w-full p-3 border border-[#efefef] rounded-[18px] outline-none transition-colors"
          disabled={speaking}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1 px-4 py-2 rounded-[32px] font-[14px] transition-colors ${speaking
                ? 'text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5] '
                : ' bg-[#076eff] hover:bg-[#1a73e8] cursor-pointer text-white'
              }`}
          >
           <AudioWaveform size={16} />  {speaking ? 'Stop' : 'Speak'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToVoiceHighlight;