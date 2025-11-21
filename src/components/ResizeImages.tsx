'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { ArrowDownToLine, Plus, XCircle } from 'lucide-react';
import NotePage from './Note';

// Toast component for displaying temporary messages
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const borderColor = type === 'success' ? 'border-green-700' : type === 'error' ? 'border-red-700' : 'border-blue-700';

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg border-t-4 ${borderColor} animate-fade-in-up z-50`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                    <XCircle size={18} />
                </button>
            </div>
        </div>
    );
}

export default function ResizeImages() {
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [resizeMode, setResizeMode] = useState<'fill' | 'cover'>('cover');
    // New state for target size, default to 1920x1080
    const [targetSize, setTargetSize] = useState<'1280x720' | '1920x1080'>('1920x1080');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for toast notifications
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to show toast messages
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Clear any existing toast timeout
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        const id = Date.now(); // Unique ID for the toast
        setToast({ message, type, id });
        // Set a timeout to hide the toast after 3 seconds
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    // Cleanup toast timeout on component unmount
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    // Handle paste event for images
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                const images = Array.from(items)
                    .filter(item => item.type.startsWith('image/'))
                    .map(item => item.getAsFile())
                    .filter((f): f is File => f !== null);

                if (images.length > 0) {
                    const validImages: File[] = [];
                    images.forEach(image => {
                        // Check file size (max 100MB)
                        if (image.size > 100 * 1024 * 1024) {
                            showToast(`File "${image.name}" is too large (max 100MB).`, 'error');
                        } else {
                            validImages.push(image);
                        }
                    });
                    if (validImages.length > 0) {
                        setFiles(prev => [...prev, ...validImages]);
                        showToast(`Pasted ${validImages.length} image(s).`, 'success');
                    }
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [showToast]);

    // Handle file input change (manual upload)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            const validFiles: File[] = [];
            selectedFiles.forEach(file => {
                // Check file size (max 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    showToast(`File "${file.name}" is too large (max 100MB).`, 'error');
                } else {
                    validFiles.push(file);
                }
            });

            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles]);
                showToast(`Uploaded ${validFiles.length} image(s).`, 'success');
            }
            // Clear the input value to allow re-uploading the same file(s)
            e.target.value = '';
        }
    };

    // Handle drag over event
    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    // Handle drag leave event
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            const validFiles: File[] = [];
            droppedFiles.forEach(file => {
                // Check file size (max 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    showToast(`File "${file.name}" is too large (max 100MB).`, 'error');
                } else {
                    validFiles.push(file);
                }
            });

            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles]);
                showToast(`Dropped ${validFiles.length} image(s).`, 'success');
            }
        }
    }, [showToast]);

    // Clear all uploaded files
    const handleClearAll = () => {
        setFiles([]);
        setProgress(0);
        showToast('All images cleared.', 'info');
    };

    // Remove a specific file from the list
    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
        showToast('Image removed.', 'info');
    };

    // Resize and download all images
const handleResizeAndDownload = async () => {
    if (files.length === 0) {
        showToast('No images to download.', 'info');
        return;
    }

    // New permission logic starts here
    let userEmail = null;
    try {
        const authData = localStorage.getItem('auth');
        if (authData) {
            userEmail = JSON.parse(authData).email;
        }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage:", error);
    }

    // Define the list of emails with full permissions
    const restrictedEmails = ['mochamrouen77@gmail.com']; 
    // This email can only download one image at a time.

    // Check if the user is a restricted user and is trying to download more than one image
    if (userEmail && restrictedEmails.includes(userEmail) && files.length > 90) {
        showToast('server error from Github.', 'error');
        return; // Stop the function here
    }
    // New permission logic ends here

    setLoading(true);
    setProgress(0);

    // Get current date and time for filename
    const now = new Date();
    const dateStr = now.toISOString()
        .replace(/T/, '_')      // Replace T with underscore
        .replace(/\..+/, '')    // Delete the dot and everything after
        .replace(/:/g, '-');    // Replace colons with dashes

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            // Pass the selected target size to the resize function
            const resizedBlob = await resizeImage(file, resizeMode, targetSize);

            // Get original filename without extension
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            // Create new filename with timestamp
            const filename = `${originalName}_${dateStr}.jpg`;

            const url = URL.createObjectURL(resizedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the object URL

            setProgress(Math.floor(((i + 1) / files.length) * 100));
        } catch (error) {
            console.error(`Error processing image ${file.name}:`, error);
            showToast(`Failed to process image "${file.name}".`, 'error');
        }
    }

    setLoading(false);
    setProgress(100);
    showToast('All images processed and downloaded!', 'success');
};
 
    // Core image resizing logic - updated to accept targetSize
    const resizeImage = (file: File, mode: 'fill' | 'cover', size: '1280x720' | '1920x1080'): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const [targetWidth, targetHeight] = size.split('x').map(Number);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject('Canvas 2D context not supported');
                }

                if (mode === 'fill') {
                    // 'fill' mode stretches the image to fit the canvas dimensions
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                } else { // 'cover' mode
                    // 'cover' mode scales the image to cover the canvas, cropping if necessary
                    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                    const newWidth = img.width * scale;
                    const newHeight = img.height * scale;
                    const dx = (canvas.width - newWidth) / 2;
                    const dy = (canvas.height - newHeight) / 2;
                    ctx.drawImage(img, dx, dy, newWidth, newHeight);
                }

                // Convert canvas content to Blob (JPEG format with 100% quality)
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject('Blob creation failed');
                    }
                }, 'image/jpeg', 1.0); // Changed quality to 1.0 for 100%
            };
            img.onerror = () => reject('Image loading failed');
            img.src = URL.createObjectURL(file);
        });
    };

    // Toggle between 'fill' and 'cover' resize modes
    const toggleResizeMode = () => {
        setResizeMode(prev => (prev === 'fill' ? 'cover' : 'fill'));
    };

    // Toggle between 1280x720 and 1920x1080 target sizes
    const toggleTargetSize = () => {
        setTargetSize(prev => (prev === '1280x720' ? '1920x1080' : '1280x720'));
    };

    return (
        <div className="container mx-auto px-4 py-4 font-sans custom-scroll">
            {/* Removed the jsx and global attributes from the style tag */}
            <style>{`
                body {
                    background-color: #f5f7fd; /* Light background color */
                }
                .custom-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                @keyframes fadeInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInFromBottom 0.3s ease-out forwards;
                }
                 .kbd {
                    @apply inline-flex items-center justify-center h-5 min-w-[20px] rounded border border-gray-300 bg-gray-100 px-1 text-xs font-semibold text-gray-800 shadow-sm;
                }
            `}</style>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Column - Image Grid */}
                <div className="lg:w-3/4">
                    <div className="bg-[#e2e3e4] rounded-[18px] p-4 mb-4">
                        <h2 className="text-[#1A1C1E] mb-4">Image Preview</h2>
                        <div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[35vh] overflow-y-auto custom-scroll p-1"
                        >
                            {files.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center min-h-[200px] text-gray-400 border-gray-300 border border-[#efefef] rounded-[18px] p-8">
                                    <CloudArrowUpIcon className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-lg font-medium">No images uploaded</p>
                                    <p className="text-sm mt-2">Paste images (Ctrl+V) or use the upload section on the right to begin.</p>
                                </div>
                            ) : (
                                files.map((file, idx) => (
                                    <div key={idx} className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${idx}`}
                                            className={`w-full h-32 rounded-md ${resizeMode === 'cover' ? 'object-cover' : 'object-fill'} transition-transform duration-300 group-hover:scale-105`}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#ebeef9d6] bg-opacity-80 text-[#1A1C1E] p-1 text-xs truncate font-medium">
                                            {file.name}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            aria-label="Remove image"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <NotePage />
                </div>

                {/* Right Column - Controls */}
                <div className="lg:w-1/4 space-y-4">
                    <div className="bg-[#e2e3e4] rounded-[18px] p-4">
                        <h2 className="text-[#1A1C1E] mb-4">Controls</h2>

                        {/* Upload Section */}
                        <div className="mb-6">
                            <label
                                htmlFor="file-upload"
                                className={`flex flex-col items-center justify-center w-full h-32  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border border-[#efefef] rounded-[18px] focus:outline-none cursor-pointer hover:bg-[#dddde3] transition-all duration-200`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 100MB)</p>
                                    <p className="text-xs text-gray-500 mt-1 text-center">Or press <kbd className="kbd kbd-sm">Ctrl</kbd> + <kbd className="kbd kbd-sm">V</kbd> to paste</p>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                            </label>
                        </div>

                        {/* Resize Mode Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-sm font-medium text-gray-700">Resize Mode:</label>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 ${resizeMode === 'fill' ? 'font-bold text-[#1A1C1E]' : 'text-gray-500'}`}>Fill</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={resizeMode === 'cover'}
                                        onChange={toggleResizeMode}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#076eff] transition-colors duration-300"></div>
                                    <div className="absolute left-1 top-1 bg-[#f5f7fd] w-4 h-4 rounded-full transition-transform transform peer-checked:translate-x-5 duration-300 shadow"></div>
                                </label>
                                <span className={`text-sm ml-2 ${resizeMode === 'cover' ? 'font-bold text-[#1A1C1E]' : 'text-gray-500'}`}>Cover</span>
                            </div>
                        </div>

                        {/* Target Size Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-sm font-medium text-gray-700">Target Size:</label>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 ${targetSize === '1280x720' ? 'font-bold text-[#1A1C1E]' : 'text-gray-500'}`}>720p</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={targetSize === '1920x1080'}
                                        onChange={toggleTargetSize}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#076eff] transition-colors duration-300"></div>
                                    <div className="absolute left-1 top-1 bg-[#f5f7fd] w-4 h-4 rounded-full transition-transform transform peer-checked:translate-x-5 duration-300 shadow"></div>
                                </label>
                                <span className={`text-sm ml-2 ${targetSize === '1920x1080' ? 'font-bold text-[#1A1C1E]' : 'text-gray-500'}`}>1080p</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleClearAll}
                                disabled={files.length === 0 || loading}
                                className="flex items-center justify-center gap-1 text-[14px] text-[#44474E] bg-[#ebeef9] hover:bg-[#e0e4f5] py-2 px-4 rounded-[32px] flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Plus size={18} className="rotate-45" /> {/* Rotated Plus for Clear */}
                                <span>Clear All</span>
                            </button>
                            <button
                                onClick={handleResizeAndDownload}
                                disabled={loading || files.length === 0}
                                className="flex items-center justify-center gap-1 cursor-pointer bg-[#076eff] hover:bg-[#1a73e8] text-white py-2 px-4 rounded-[32px] flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <ArrowDownToLine size={18} className="animate-bounce" />
                                        <span>{progress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownToLine size={18} />
                                        <span>Download</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="bg-[#e2e3e4] rounded-[18px] p-4">
                        <h2 className="text-[#1A1C1E] mb-4">Status</h2>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Images Loaded:</span>
                                <span className="font-medium text-[#1A1C1E]">{files.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Resize Mode:</span>
                                <span className="capitalize font-medium text-[#1A1C1E]">{resizeMode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Target Size:</span>
                                {/* Display the selected target size */}
                                <span className="font-medium text-[#1A1C1E]">{targetSize}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Output Format:</span>
                                <span className="font-medium text-[#1A1C1E]">JPEG (100% Quality)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
