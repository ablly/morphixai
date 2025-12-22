'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function FixedUI() {
    const t = useTranslations('Nav');
    const tFooter = useTranslations('Footer');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'zh' : 'en';
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');
        router.push(newPath);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/${locale}`);
        router.refresh();
    };

    // 添加 locale 前缀的辅助函数
    const localePath = (path: string) => `/${locale}${path}`;

    const navLinks = [
        { href: localePath('/features'), label: t('features') },
        { href: localePath('/pricing'), label: t('pricing') },
        { href: localePath('/about'), label: t('about') },
        { href: localePath('/blog'), label: t('blog') },
    ];

    const userLinks = [
        { href: localePath('/dashboard'), label: t('dashboard') },
        { href: localePath('/create'), label: t('create') },
        { href: localePath('/settings'), label: t('settings') },
    ];

    return (
        <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            {/* Header */}
            <header className="w-full flex items-center justify-between px-6 md:px-10 py-4 md:py-6 pointer-events-auto bg-black/50 backdrop-blur-md">
                {/* Logo */}
                <Link href={`/${locale}`} className="text-xl md:text-2xl font-bold text-white tracking-tighter">
                    Morphix <span className="text-cyan-400">AI</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-300 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                    >
                        <Globe size={18} />
                        <span className="text-xs font-bold uppercase">{locale === 'en' ? 'EN' : '中'}</span>
                    </button>

                    <div className="h-4 w-[1px] bg-gray-700"></div>

                    {user ? (
                        <>
                            <Link
                                href={localePath('/dashboard')}
                                className="text-sm text-white font-medium hover:text-cyan-400 transition-colors"
                            >
                                {t('dashboard')}
                            </Link>
                            <Link
                                href={localePath('/create')}
                                className="text-sm text-white font-medium hover:text-cyan-400 transition-colors"
                            >
                                {t('create')}
                            </Link>
                            <Link
                                href={localePath('/settings')}
                                className="text-sm text-white font-medium hover:text-cyan-400 transition-colors"
                            >
                                {t('settings')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href={localePath('/login')}
                                className="text-sm text-white font-medium hover:text-cyan-400 transition-colors"
                            >
                                {t('login')}
                            </Link>
                            <Link href={localePath('/signup')}>
                                <Button className="bg-white text-black hover:bg-cyan-400 hover:text-black rounded-full px-6">
                                    {t('signup')}
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-white"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-black/95 backdrop-blur-lg pointer-events-auto">
                    <nav className="flex flex-col p-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg text-white py-2 border-b border-white/10"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {user && userLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg text-cyan-400 py-2 border-b border-white/10"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-4 space-y-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-2 text-gray-400"
                            >
                                <Globe size={20} />
                                <span>{locale === 'en' ? 'English' : '中文'}</span>
                            </button>

                            {user ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 bg-white/10 text-white rounded-lg"
                                >
                                    {t('logout')}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        href={localePath('/login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full py-3 text-center bg-white/10 text-white rounded-lg"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href={localePath('/signup')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg"
                                    >
                                        {t('signup')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 w-full px-6 md:px-10 py-4 md:py-6 flex items-center justify-between pointer-events-auto bg-black/50 backdrop-blur-md">
                <div className="text-xs text-gray-600">
                    {tFooter('copyright')}
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-white transition-colors">
                        {tFooter('twitter')}
                    </a>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-white transition-colors">
                        {tFooter('discord')}
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-white transition-colors">
                        {tFooter('github')}
                    </a>
                    <div className="hidden md:flex items-center space-x-2 ml-2">
                        <a 
                            href="https://www.nxgntools.com/tools/morphix-ai?utm_source=morphix-ai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <img 
                                src="https://www.nxgntools.com/api/embed/morphix-ai?type=FEATURED_ON" 
                                alt="Featured on NextGen Tools" 
                                className="h-6"
                            />
                        </a>
                        <a 
                            href="https://frogdr.com/morphix-ai.com?utm_source=morphix-ai.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <img 
                                src="https://frogdr.com/morphix-ai.com/badge-white.svg" 
                                alt="Monitor your Domain Rating with FrogDR" 
                                className="h-6"
                            />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
