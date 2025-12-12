'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    generationId: string;
    modelUrl?: string;
    onShareComplete?: (platform: string, credits: number) => void;
}

const TwitterIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const RedditIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
);

const TikTokIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
);

// 分享平台配置 - 移除积分奖励，只提供分享功能
const platforms = [
    { id: 'TWITTER', name: 'X (Twitter)', icon: TwitterIcon, color: 'bg-black hover:bg-zinc-800 border-zinc-700' },
    { id: 'FACEBOOK', name: 'Facebook', icon: FacebookIcon, color: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30 text-[#1877F2]' },
    { id: 'LINKEDIN', name: 'LinkedIn', icon: LinkedInIcon, color: 'bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/30 text-[#0A66C2]' },
    { id: 'REDDIT', name: 'Reddit', icon: RedditIcon, color: 'bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border-[#FF4500]/30 text-[#FF4500]' },
    { id: 'TIKTOK', name: 'TikTok', icon: TikTokIcon, color: 'bg-white/10 hover:bg-white/20 border-white/20 text-white' },
];

export function ShareDialog({ isOpen, onClose, generationId, modelUrl }: ShareDialogProps) {
    const locale = useLocale();
    const [copied, setCopied] = useState(false);
    
    const shareUrl = modelUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/model/${generationId}`;
    const shareText = 'Check out my 3D model created with Morphix AI! #MorphixAI #3D';

    const handleShare = (platformId: string) => {
        const urls: Record<string, string> = {
            TWITTER: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            FACEBOOK: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            LINKEDIN: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            REDDIT: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('My 3D model created with Morphix AI')}`,
            TIKTOK: shareUrl,
        };

        if (platformId === 'TIKTOK') {
            // TikTok 没有直接分享链接，复制链接
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        window.open(urls[platformId], '_blank', 'width=600,height=500,left=200,top=200');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {locale === 'zh' ? '分享模型' : 'Share Model'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">
                            {locale === 'zh' 
                                ? '分享你的 3D 模型到社交媒体，让更多人看到你的作品！' 
                                : 'Share your 3D model on social media and show off your creation!'}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {platforms.map(platform => {
                                const Icon = platform.icon;
                                return (
                                    <button
                                        key={platform.id}
                                        onClick={() => handleShare(platform.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${platform.color}`}
                                    >
                                        <Icon />
                                        <div className="text-left">
                                            <div className="font-medium text-sm">{platform.name}</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-gray-500 mb-2">
                                {locale === 'zh' ? '或复制链接' : 'Or copy link'}
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-400 truncate"
                                />
                                <Button onClick={handleCopy} variant="outline" className="border-white/20">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
