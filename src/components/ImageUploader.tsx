'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    onFileSelect: (file: File | null) => void;
    onPreviewChange?: (previewUrl: string | null) => void;
    initialPreview?: string | null;
    className?: string;
}

export function ImageUploader({ onFileSelect, onPreviewChange, initialPreview, className }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(initialPreview || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 同步初始预览
    useEffect(() => {
        if (initialPreview && !preview) {
            setPreview(initialPreview);
        }
    }, [initialPreview, preview]);

    const handleFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;
                setPreview(previewUrl);
                onPreviewChange?.(previewUrl);
            };
            reader.readAsDataURL(file);
            onFileSelect(file);
        }
    }, [onFileSelect, onPreviewChange]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    const removeImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onFileSelect(null);
        onPreviewChange?.(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onFileSelect, onPreviewChange]);

    return (
        <div className={cn("w-full", className)}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept="image/*"
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-xl overflow-hidden border border-white/20 group aspect-video bg-black/40"
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                                onClick={removeImage}
                                className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 group aspect-video",
                            isDragging
                                ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]"
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <div className={cn(
                            "p-4 rounded-full bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20",
                            isDragging && "bg-cyan-500/20"
                        )}>
                            {isDragging ? (
                                <FileUp className="w-8 h-8 text-cyan-400" />
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-cyan-400" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                {isDragging ? "Drop image here" : "Upload Reference Image"}
                            </p>
                            <p className="text-sm text-gray-400">
                                Drag & drop or click to browse
                            </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Supports JPG, PNG, WEBP (Max 10MB)
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
