'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // 检查是否有有效的 recovery session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      
      // 检查 URL 中是否有 error
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (errorParam) {
        setError(errorDescription || 'Invalid or expired reset link');
        setIsValidSession(false);
        return;
      }

      // 检查当前 session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        // 尝试从 URL hash 中获取 token (Supabase 有时会用 hash)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // 让 Supabase 处理 hash 中的 token
          const { data, error } = await supabase.auth.getSession();
          if (data.session) {
            setIsValidSession(true);
            return;
          }
        }
        
        setError('Invalid or expired reset link. Please request a new one.');
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(locale === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(locale === 'zh' ? '密码至少需要6个字符' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      // 登出用户，让他们用新密码重新登录
      await supabase.auth.signOut();
      
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/login`), 3000);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 加载中状态
  if (isValidSession === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // 无效链接状态
  if (isValidSession === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-zinc-900/50 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/50">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {locale === 'zh' ? '链接无效或已过期' : 'Invalid or Expired Link'}
            </h1>
            <p className="text-zinc-400 mb-6">
              {locale === 'zh' ? '请重新请求密码重置链接。' : 'Please request a new password reset link.'}
            </p>
            <Link
              href={`/${locale}/forgot-password`}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {locale === 'zh' ? '重新请求' : 'Request New Link'}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 成功状态
  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-zinc-900/50 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/50">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {locale === 'zh' ? '密码已更新！' : 'Password Updated!'}
            </h1>
            <p className="text-zinc-400 mb-6">
              {locale === 'zh' ? '密码重置成功，正在跳转到登录页面...' : 'Your password has been successfully reset. Redirecting to login...'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.2] invert" />
      <div className="fixed top-20 left-6 z-40">
        <Link href={`/${locale}/login`}>
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-zinc-900/50 border border-white/10 rounded-2xl p-8 shadow-2xl ring-1 ring-white/5">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-purple-500/30">
              <Lock className="w-7 h-7 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {locale === 'zh' ? '设置新密码' : 'New Password'}
            </h1>
            <p className="text-zinc-400 text-sm">
              {locale === 'zh' ? '请输入您的新密码' : 'Enter your new password below.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</motion.div>}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                {locale === 'zh' ? '新密码' : 'New Password'}
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500/50" placeholder="••••••••" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                {locale === 'zh' ? '确认密码' : 'Confirm Password'}
              </Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500/50" placeholder="••••••••" required disabled={loading} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition-opacity text-white border-0">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{locale === 'zh' ? '更新中...' : 'Updating...'}</> : (locale === 'zh' ? '更新密码' : 'Update Password')}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
