'use client';

import { useState, useRef, useEffect } from 'react';
import TypingAnimation from "./Materials/TypingAnimation";
import { SendHorizontal} from 'lucide-react';

type Message = {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false); 
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(1); 

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        // Add user message
        const userMessage: Message = {
            id: nextId.current++,
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true); 
        // Simulate AI response after a delay
        setTimeout(() => {
            const aiResponses = [
                "I understand your question about \"" + inputValue + "\". Let me think about that...",
                "That's an interesting point. Here's what I can tell you...",
                "Based on my knowledge, I'd suggest considering...",
                "I've analyzed your query and here's my response..."
            ];

            const aiMessage: Message = {
                id: nextId.current++,
                text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setIsTyping(false);
    };

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-2">
                {/* Left Column - AI Assistant */}
                <div className="lg:w-3/4">
                    <div className="bg-[#ffffffb2] rounded-[18px] p-4 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1A1C1E]">AI Assistant</h2>
                            <button
                                onClick={startNewChat}
                                className=" flex items-center gap-1 px-3 py-1 text-[#ababab] cursor-pointer rounded-[32px] text-[14px] hover:bg-[#f1f2f5] transition"
                            >
                                New Chat
                            </button>
                        </div>


                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto custom-scroll mb-4  border border-[#efefef] rounded-[32px] ">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h1 className="text-3xl bg-gradient-to-r from-[#002e75] to-[#076dfe] bg-clip-text text-transparent mb-4">
                                        <TypingAnimation />
                                    </h1>
                                    <p className="text-[#44474E] text-[16px] text-center max-w-md">
                                        Ask me anything, from creative ideas to technical explanations. I m here to help!
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-[32px] p-3 mx-5 mt-1 text-[14px] ${message.sender === 'user'
                                                ? 'bg-[#edf2fa] text-[#1A1C1E]'
                                                : ' text-[#1A1C1E]'}`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className=" text-gray-800 rounded-lg p-3 max-w-[80%]">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-[#b6b6b6] animate-bounce"></div>
                                            <div className="w-2 h-2 rounded-full bg-[#b6b6b6] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-[#b6b6b6] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="mt-auto">
                            <div className="relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message here..."
                                    className="w-full p-4 pr-12 border border-gray-300 rounded-[32px] focus:outline-none  focus:ring-gray-300 resize-none text-start placeholder:text-start"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={inputValue.trim() === ''}
                                    className={`absolute right-2 bottom-4 px-5  py-2 rounded-[32px]  ${inputValue.trim() === ''
                                        ? 'bg-[#f1f2f5] text-[#ababab]'
                                        : 'bg-[#076eff] hover:bg-[#1a73e8] text-white  cursor-pointer'}`}
                                >
                                    <SendHorizontal size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - History */}
                <div className="lg:w-1/4">
                    <div className="bg-[#ffffffb2] rounded-[18px] p-4 h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1A1C1E]">History</h2> 
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    );
}