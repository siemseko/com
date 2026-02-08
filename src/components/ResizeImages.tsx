'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { ArrowDownToLine, XCircle, FolderOpen, Settings2, Trash2, Layers } from 'lucide-react';
import NotePage from './Note';

// TypeScript interfaces for the File System Access API
interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
    write(data: Blob | BufferSource | string): Promise<void>;
    close(): Promise<void>;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
    // Donezo-inspired accent colors
    const bgColor = type === 'success' ? 'bg-[#05CD99]' : type === 'error' ? 'bg-[#FF5B5B]' : 'bg-[#4318FF]';
    return (
        <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-2xl animate-fade-in-up z-[100] flex items-center gap-3 border border-white/10 shadow-lg`}>
            <span className="text-sm  tracking-tight">{message}</span>
            <button onClick={onClose} className="hover:rotate-90 transition-transform">
                <XCircle size={18} />
            </button>
        </div>
    );
}

export default function ResizeImages() {
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [resizeMode, setResizeMode] = useState<'fill' | 'cover'>('cover');
    const [targetSize, setTargetSize] = useState<'1280x720' | '1920x1080'>('1920x1080');
    const [useFolderPicker, setUseFolderPicker] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        const id = Date.now();
        setToast({ message, type, id });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    }, []);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                const images = Array.from(items)
                    .filter(item => item.type.startsWith('image/'))
                    .map(item => item.getAsFile())
                    .filter((f): f is File => f !== null);

                if (images.length > 0) {
                    setFiles(prev => [...prev, ...images]);
                    showToast(`Pasted ${images.length} image(s).`, 'success');
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [showToast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const validFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setFiles(prev => [...prev, ...validFiles]);
            showToast(`Added ${validFiles.length} images.`, 'success');
            e.target.value = '';
        }
    };

    const handleResizeAndDownload = async () => {
        if (files.length === 0) return showToast('No images to process.', 'info');
        setLoading(true);
        setProgress(0);
        let directoryHandle: FileSystemDirectoryHandle | null = null;
        if (useFolderPicker && 'showDirectoryPicker' in window) {
            try {
                const picker = (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
                directoryHandle = await picker();
            } catch {
                showToast('Folder selection cancelled.', 'info');
            }
        }
        const dateStr = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const resizedBlob = await resizeImage(file, resizeMode, targetSize);
                const filename = `${file.name.replace(/\.[^/.]+$/, '')}_${dateStr}.jpg`;
                if (directoryHandle) {
                    const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(resizedBlob);
                    await writable.close();
                } else {
                    const url = URL.createObjectURL(resizedBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                }
                setProgress(Math.floor(((i + 1) / files.length) * 100));
            } catch (error) {
                console.error(error);
                showToast(`Error processing ${files[i].name}`, 'error');
            }
        }
        setLoading(false);
        showToast('Processing complete!', 'success');
    };

    const resizeImage = (file: File, mode: 'fill' | 'cover', size: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const [tw, th] = size.split('x').map(Number);
            const img = new (window as typeof window).Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = tw;
                canvas.height = th;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('No context');
                if (mode === 'fill') {
                    ctx.drawImage(img, 0, 0, tw, th);
                } else {
                    const scale = Math.max(tw / img.width, th / img.height);
                    const nw = img.width * scale, nh = img.height * scale;
                    ctx.drawImage(img, (tw - nw) / 2, (th - nh) / 2, nw, nh);
                }
                canvas.toBlob(b => b ? resolve(b) : reject('Blob error'), 'image/jpeg', 0.95);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .dark .custom-scroll::-webkit-scrollbar-thumb { background: #1b254b; }
            `}</style> 
            <div className="flex flex-col xl:flex-row gap-6">
                {/* PREVIEW QUEUE */}
                <div className="flex-1 space-y-6"> 
                    <div className="bg-white dark:bg-[#111c44] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden transition-all">
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between relative bg-white/50 dark:bg-[#111c44]/50 backdrop-blur-md">
                           
                            
                            <h2 className=" text-lg text-[#2B3674] dark:text-white flex items-center gap-3 pl-2">
                                <Layers size={20} className="text-[#4318FF]" /> Image Queue
                            </h2>
                            <div className="px-4 py-1 bg-[#F4F7FE] dark:bg-[#0b1437] rounded-full border border-[#4318FF]/10">
                                <span className="text-[10px] font-black text-[#4318FF] dark:text-white tracking-widest uppercase">
                                    {files.length} Assets
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scroll bg-[#F4F7FE]/30 dark:bg-[#0b1437]/20">
                            {files.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center text-[#A3AED0]">
                                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#111c44] flex items-center justify-center border border-gray-100 dark:border-white/5 mb-4">
                                        <CloudArrowUpIcon className="w-10 h-10 opacity-20 text-[#4318FF]" />
                                    </div>
                                    <p className="text-sm  uppercase tracking-widest">Awaiting Assets</p>
                                    <p className="text-xs opacity-60 mt-1 italic font-medium">Paste from clipboard or drag files here</p>
                                </div>
                            ) : (
                                files.map((file, idx) => (
                                    <div key={idx} className="group relative aspect-video bg-white dark:bg-[#111c44] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 transition-all hover:border-[#4318FF]/40 shadow-sm hover:shadow-md">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            fill
                                            unoptimized
                                            className={`${resizeMode === 'cover' ? 'object-cover' : 'object-contain'} p-1`}
                                            alt="preview"
                                        />
                                        <div className="absolute inset-0 bg-[#2B3674]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <button
                                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="bg-[#FF5B5B] hover:bg-[#ee4b4b] p-2.5 rounded-xl text-white transition-all transform hover:scale-110 active:scale-90 shadow-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <NotePage />
                </div>

                {/* PARAMETERS SIDEBAR */}
                <div className="xl:w-80 space-y-6">
                    <div className="bg-white dark:bg-[#111c44] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 space-y-6 sticky">
                        <h3 className="font-black text-[11px] uppercase tracking-[3px] flex items-center gap-2 text-[#A3AED0]">
                            <Settings2 size={16} /> Parameters
                        </h3>

                        <label className="group block border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#4318FF] dark:hover:border-[#7551FF] hover:bg-[#F4F7FE] dark:hover:bg-[#ffffff05] rounded-3xl p-10 transition-all cursor-pointer text-center relative overflow-hidden">
                            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-[#A3AED0] group-hover:text-[#4318FF] mb-3 transition-colors" />
                            <span className="text-[12px]  text-[#2B3674] dark:text-white uppercase tracking-widest">Browse Files</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>

                        <div className="space-y-2">
                            {/* Resize Mode Row */}
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-[#0b1437] rounded-2xl border border-transparent dark:border-white/5">
                                <span className="text-xs  text-[#A3AED0] uppercase tracking-wider">Crop</span>
                                <button
                                    onClick={() => setResizeMode(m => m === 'fill' ? 'cover' : 'fill')}
                                    className="text-[10px] font-black px-4 py-1.5 bg-white dark:bg-[#1b254b] text-[#4318FF] dark:text-white rounded-xl shadow-sm hover:bg-[#4318FF] hover:text-white transition-all uppercase tracking-tighter"
                                >
                                    {resizeMode}
                                </button>
                            </div>

                            {/* Quality/Size Row */}
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-[#0b1437] rounded-2xl border border-transparent dark:border-white/5">
                                <span className="text-xs  text-[#A3AED0] uppercase tracking-wider">Target</span>
                                <button
                                    onClick={() => setTargetSize(s => s === '1280x720' ? '1920x1080' : '1280x720')}
                                    className="text-[10px] font-black px-4 py-1.5 bg-white dark:bg-[#1b254b] text-[#4318FF] dark:text-white rounded-xl shadow-sm hover:bg-[#4318FF] hover:text-white transition-all uppercase tracking-tighter"
                                >
                                    {targetSize === '1280x720' ? '720p' : '1080p'}
                                </button>
                            </div>

                            {/* Direct Save Checkbox Row */}
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-[#0b1437] rounded-2xl border border-transparent dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <FolderOpen size={16} className="text-[#A3AED0]" />
                                    <span className="text-[13px]  text-[#2B3674] dark:text-white">Direct Save</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={useFolderPicker}
                                    onChange={(e) => setUseFolderPicker(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-gray-300 bg-white dark:bg-[#0b1437] text-[#4318FF] focus:ring-[#4318FF] transition-all cursor-pointer shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={handleResizeAndDownload}
                                disabled={loading || files.length === 0}
                                className="w-full bg-[#4318FF] hover:bg-[#3915db] dark:bg-[#7551FF] dark:hover:bg-[#6039ff] text-white font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-[#CBD5E1] dark:disabled:bg-[#1b254b] disabled:text-white uppercase tracking-[2px] text-[12px]"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing {progress}%</span>
                                ) : (
                                    <><ArrowDownToLine size={20} /> Process Batch</>
                                )}
                            </button>
                            <button
                                onClick={() => setFiles([])}
                                className="group flex items-center justify-center gap-2 w-full py-2 text-[#A3AED0] hover:text-[#FF5B5B] text-[10px] font-black uppercase tracking-[2px] transition-colors"
                            >
                                <Trash2 size={12} className="group-hover:animate-bounce" /> Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}