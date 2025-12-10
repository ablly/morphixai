'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          {locale === 'zh' ? '出错了' : 'Something went wrong'}
        </h1>

        <p className="text-gray-400 mb-8">
          {locale === 'zh'
            ? '抱歉，页面加载时发生了错误。请尝试刷新页面或返回首页。'
            : 'Sorry, an error occurred while loading this page. Please try refreshing or go back to home.'}
        </p>

        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {locale === 'zh' ? '重试' : 'Try Again'}
          </button>

          <Link href={`/${locale}`}>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/20">
              <Home className="w-4 h-4" />
              {locale === 'zh' ? '返回首页' : 'Go Home'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
