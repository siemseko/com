'use client';
import { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { ArrowDownToLine, Plus } from 'lucide-react';

type ZoomMode = 'in' | 'out' | 'alternate';

export default function ImageSequenceToVideo() {
    const [files, setFiles] = useState<File[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [speed, setSpeed] = useState<number>(1);
    const [duration, setDuration] = useState<number>(3);
    const [zoomMode, setZoomMode] = useState<ZoomMode>('alternate');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    // Clear all files
    const handleClear = () => {
        setFiles([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        clearInterval(intervalRef.current!);
    }; 
    // Calculate zoom based on mode and progress
    const calculateZoom = (progress: number, index: number) => {
        switch (zoomMode) {
            case 'in':
                return 0.8 + (0.4 * progress); // 0.8 → 1.2 (zoom in)
            case 'out':
                return 1.4 - (0.4 * progress); // 1.4 → 1.0 (zoom out)
            case 'alternate':
                return index % 2 === 0
                    ? 0.8 + (0.4 * progress) // Even index: zoom in
                    : 1.4 - (0.4 * progress); // Odd index: zoom out
            default:
                return 1;
        }
    };

    // Generate video from images
    const generateVideo = async () => {
        if (files.length === 0 || !canvasRef.current) return;

        setLoading(true);
        setProgress(0);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            canvas.width = 1280;
            canvas.height = 720;

            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            const recordingPromise = new Promise<Blob>((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(blob);
                };
            });

            mediaRecorder.start();

            const framesPerSecond = 30;
            const totalFrames = Math.floor(files.length * duration * framesPerSecond / speed);
            const framesPerImage = Math.floor(duration * framesPerSecond / speed);

            for (let i = 0; i < totalFrames; i++) {
                const imgIndex = Math.floor(i / framesPerImage);
                const progressInImage = (i % framesPerImage) / framesPerImage;
                const zoom = calculateZoom(progressInImage, imgIndex);

                const file = files[imgIndex % files.length];
                const img = await createImageBitmap(file);

                const width = img.width * zoom;
                const height = img.height * zoom;
                const x = (canvas.width - width) / 2;
                const y = (canvas.height - height) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, width, height);

                setProgress(Math.floor((i / totalFrames) * 100));
                await new Promise(r => setTimeout(r, 33));
            }

            mediaRecorder.stop();
            const videoBlob = await recordingPromise;

            const url = URL.createObjectURL(videoBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-sequence-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating video:', error);
        } finally {
            setLoading(false);
            setProgress(100);
        }
    };

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current!);
        };
    }, []);


    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                const images = Array.from(items)
                    .filter(item => item.type.startsWith('image/'))
                    .map(item => item.getAsFile())
                    .filter((file): file is File => file !== null);

                if (images.length > 0) {
                    setFiles(prev => [...prev, ...images]);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);
    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-2">
                {/* Left Column - Image Preview */}
                <div className="lg:w-3/4">
                    <div className="bg-[#ffffffb2] rounded-[18px]  p-4">
                        <h2 className="text-[#1A1C1E] mb-4">Image Preview</h2>
                        {/* All Images Grid */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">All Images ({files.length})</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className={`relative group rounded-md overflow-hidden ${currentIndex === index
                                            ? 'border-2 border-blue-500 ring-2 ring-blue-200'
                                            : 'border border-gray-200'
                                            }`}
                                        onClick={() => setCurrentIndex(index)}
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className={`w-full h-32`}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#ebeef9] bg-opacity-50 text-[#1A1C1E] p-1 text-xs truncate">
                                            {file.name}
                                        </div>
                                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Controls */}
                <div className="lg:w-1/4 space-y-2">
                    {/* Controls Card */}
                    <div className="bg-[#ffffffb2] rounded-[18px]  p-4">
                        <h2 className="text-[#1A1C1E] mb-4">Controls</h2>
                        {/* Upload Area */}
                        <label className="flex flex-col items-center justify-center w-full h-32 border border-[#efefef] rounded-[18px] focus:outline-none focus:ring-gray-300 cursor-pointer hover:bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-[14px] text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    Or press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl</kbd> +
                                    <kbd className="px-1 py-0.5 bg-gray-100 rounded">V</kbd> to paste
                                </p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {/* Zoom Mode Selection */}
                        <div className="mb-4">
                            <label className="block text-[14px] font-medium text-gray-700 mb-2">
                                Zoom Mode:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setZoomMode('in')}
                                    className={`py-2 px-3 rounded-[32px] ${zoomMode === 'in' ? 'bg-blue-600 text-white' : 'text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5]'}`}
                                >
                                    In
                                </button>
                                <button
                                    onClick={() => setZoomMode('out')}
                                    className={`py-2 px-3 rounded-[32px] ${zoomMode === 'out' ? 'bg-blue-600 text-white' : 'text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5]'}`}
                                >
                                    Out
                                </button>
                                <button
                                    onClick={() => setZoomMode('alternate')}
                                    className={`py-2 px-3 rounded-[32px] ${zoomMode === 'alternate' ? 'bg-blue-600 text-white' : 'text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5]'}`}
                                >
                                    In-Out
                                </button>
                            </div>
                        </div>

                        {/* Speed Control */}
                        <div className="mb-4">
                            <label className="block text-[14px] font-medium text-gray-700 mb-2">
                                Playback Speed: {speed}x
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.5"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Duration Control */}
                        <div className="mb-6">
                            <label className="block text-[14px] font-medium text-gray-700 mb-2">
                                Duration per Image: {duration}s
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Progress Bar */}
                        {loading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                >{progress}%</div>
                            </div>
                        )}

                        {/* Generate Video Button */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleClear}
                                disabled={files.length === 0}
                                className="flex items-center justify-center gap-1 text-[14px] text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5] py-2 px-4 rounded-[32px] flex-1 transition-colors disabled:opacity-50"
                            >
                                <Plus size={18} />
                                <span>Clear</span>
                            </button>
                            <button
                                onClick={generateVideo}
                                disabled={loading || files.length === 0}
                                className="flex items-center justify-center gap-1 cursor-pointer bg-[#076eff] hover:bg-[#1a73e8] text-white py-2 px-4 rounded-[32px] flex-1 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <ArrowDownToLine className="w-5 h-5" />
                                        <span>Download...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownToLine className="w-5 h-5" />
                                        <span>Download</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-[#ffffffb2] rounded-[18px]  p-4">
                       <h2 className="text-[#1A1C1E] mb-4">Status</h2> 
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Images Loaded:</span>
                                <span className="font-medium">{files.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Frame:</span>
                                <span className="font-medium">{files.length > 0 ? currentIndex + 1 : 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Zoom Mode:</span>
                                <span className="font-medium capitalize">
                                    {zoomMode === 'alternate' ? 'alternating' : zoomMode}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Speed:</span>
                                <span className="font-medium">{speed}x</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">{duration}s per image</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-medium">
                                    {loading ? 'Generating Video...' : isPlaying ? 'Playing' : 'Ready'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for video generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes zoomIn {
                    0% { transform: scale(0.8); }
                    100% { transform: scale(1.2); }
                }
                @keyframes zoomOut {
                    0% { transform: scale(1.4); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}