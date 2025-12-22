'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function FixedUI() {
    const t = useTranslations('Nav');
    const tFooter = useTranslations('Footer');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);

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

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const switchLanguage = (newLocale: string) => {
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');
        router.push(newPath);
        setLangDropdownOpen(false);
    };

    const currentLang = languages.find(l => l.code === locale) || languages[0];

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
                    {/* Language Dropdown */}
                    <div className="relative" ref={langDropdownRef}>
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <Globe size={18} />
                            <span className="text-xs font-bold">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                            <ChevronDown size={14} className={`transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {langDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 py-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl min-w-[140px] z-50">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => switchLanguage(lang.code)}
                                        className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 transition-colors ${
                                            locale === lang.code ? 'text-cyan-400' : 'text-gray-300'
                                        }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                        {locale === lang.code && <span className="ml-auto">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
                            {/* Mobile Language Selector */}
                            <div className="border-b border-white/10 pb-4">
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                                    {locale === 'en' ? 'Language' : '语言'}
                                </p>
                                <div className="flex gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                switchLanguage(lang.code);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors ${
                                                locale === lang.code 
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

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
