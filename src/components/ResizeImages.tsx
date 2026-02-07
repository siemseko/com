'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { ArrowDownToLine, Plus, XCircle, FolderOpen, Settings2 } from 'lucide-react';
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
    const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-blue-600';
    return (
        <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl animate-fade-in-up z-50 flex items-center gap-3 backdrop-blur-md`}>
            <span className="text-sm font-medium">{message}</span>
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
                showToast('Folder selection cancelled. Using default download.', 'info');
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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950  font-sans text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .dark .custom-scroll::-webkit-scrollbar-thumb { background: #334155; }
                @keyframes fadeInFromBottom { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInFromBottom 0.3s ease-out forwards; }
            `}</style>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6"> 
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2 dark:text-gray-100">
                                <Plus size={20} className="text-blue-500" /> Preview Stack
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto custom-scroll">
                            {files.length === 0 ? (
                                <div className="col-span-full py-20 flex flex-col items-center text-slate-400 dark:text-gray-600">
                                    <CloudArrowUpIcon className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Drop images here or paste from clipboard</p>
                                </div>
                            ) : (
                                files.map((file, idx) => (
                                    <div key={idx} className="group relative aspect-video bg-slate-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-700 transition-colors">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            fill
                                            unoptimized
                                            className={`${resizeMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                                            alt="preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button
                                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="bg-white/20 hover:bg-rose-500 p-2 rounded-full text-white transition-colors relative z-10"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <NotePage />
                </div>

                <div className="lg:w-80 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 space-y-6 transition-colors">
                        <h3 className="font-bold flex items-center gap-2 dark:text-gray-50"><Settings2 size={18} /> Configuration</h3>

                        <label className="group block border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-2xl p-6 transition-all cursor-pointer text-center">
                            <CloudArrowUpIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-gray-600 group-hover:text-blue-500 mb-2 transition-colors" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Upload Files</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Resize Mode</span>
                                <button
                                    onClick={() => setResizeMode(m => m === 'fill' ? 'cover' : 'fill')}
                                    className="text-xs font-bold px-3 py-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 uppercase transition-colors"
                                >
                                    {resizeMode}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Resolution</span>
                                <button
                                    onClick={() => setTargetSize(s => s === '1280x720' ? '1920x1080' : '1280x720')}
                                    className="text-xs font-bold px-3 py-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 transition-colors"
                                >
                                    {targetSize === '1280x720' ? '720p' : '1080p'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Images Loaded</span>
                                <button
                                    onClick={() => setTargetSize(s => s === '1280x720' ? '1920x1080' : '1280x720')}
                                    className="text-xs font-bold px-3 py-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 transition-colors"
                                >
                                     {files.length}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <FolderOpen size={16} className="text-slate-400 dark:text-gray-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Select Folder</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={useFolderPicker}
                                    onChange={(e) => setUseFolderPicker(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleResizeAndDownload}
                                disabled={loading || files.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing {progress}%</span>
                                ) : (
                                    <><ArrowDownToLine size={20} /> Process & Save</>
                                )}
                            </button>
                            <button
                                onClick={() => setFiles([])}
                                className="w-full py-3 text-slate-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 text-sm font-medium transition-colors"
                            >
                                Clear all images
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}