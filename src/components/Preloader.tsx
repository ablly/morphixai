'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
    onLoadingComplete: () => void;
}

export function Preloader({ onLoadingComplete }: PreloaderProps) {
    const { progress, active } = useProgress();
    const [show, setShow] = useState(true);
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        // Smooth progress interpolation with simulated movement
        const interval = setInterval(() => {
            setDisplayProgress(prev => {
                // Always target at least a bit higher than current to simulate activity
                // But don't exceed real progress by too much unless real progress is 100
                const target = active ? Math.max(progress, prev + 0.5) : 100;

                const diff = target - prev;
                if (diff > 0) {
                    // Faster catch-up: divide by 2 instead of 5
                    return Math.min(100, prev + Math.ceil(diff / 2));
                }
                return prev;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [progress, active]);

    useEffect(() => {
        if (displayProgress >= 100) {
            const timer = setTimeout(() => {
                setShow(false);
                // Reduced delay from 1000ms to 400ms for snappier transition
                setTimeout(onLoadingComplete, 400);
            }, 200); // Reduced initial delay from 500ms to 200ms
            return () => clearTimeout(timer);
        }
    }, [displayProgress, onLoadingComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="w-64 md:w-96 relative">
                        {/* Glitch Text Effect */}
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-cyan-500 font-mono text-xs tracking-widest">SYSTEM_INIT</span>
                            <span className="text-purple-500 font-mono text-xs tracking-widest">{displayProgress}%</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-1 w-full bg-gray-900 overflow-hidden relative">
                            {/* Animated Progress Bar */}
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                                style={{ width: `${displayProgress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                            {/* Scanning Line */}
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute top-0 left-0 w-20 h-full bg-white/50 blur-sm"
                            />
                        </div>

                        {/* Loading Status Text */}
                        <div className="mt-4 font-mono text-xs text-gray-500 flex flex-col gap-1">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {displayProgress < 30 && "> LOADING_NEURAL_WEIGHTS..."}
                                {displayProgress >= 30 && displayProgress < 70 && "> SYNTHESIZING_VOXELS..."}
                                {displayProgress >= 70 && "> ESTABLISHING_UPLINK..."}
                            </motion.div>
                            <div className="flex gap-2 text-[10px] opacity-50">
                                <span>MEM: {Math.floor(displayProgress * 12.4)}MB</span>
                                <span>LATENCY: 0.0ms</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
