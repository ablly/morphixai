'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Gift, Loader2 } from 'lucide-react';

export default function ReferralPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      // 存储邀请码到 localStorage
      localStorage.setItem('referral_code', code.toUpperCase());
      
      // 延迟后跳转到注册页面
      const timer = setTimeout(() => {
        router.push(`/${locale}/signup?ref=${code.toUpperCase()}`);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [code, router, locale]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.2] invert" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-zinc-900/50 border border-white/10 rounded-2xl p-8 text-center shadow-2xl ring-1 ring-white/5">
          {/* Gift Icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-cyan-500/30"
          >
            <Gift className="w-10 h-10 text-cyan-400" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2">
            You&apos;ve Been Invited!
          </h1>
          <p className="text-zinc-400 mb-6">
            Join Morphix AI and get <span className="text-cyan-400 font-bold">25 free credits</span> to start creating amazing 3D models.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-xs text-zinc-500 mb-1">Referral Code</p>
            <p className="text-xl font-mono font-bold text-cyan-400 tracking-wider">
              {code?.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Redirecting to signup...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
