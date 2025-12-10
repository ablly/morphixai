'use client';

import { useTranslations } from 'next-intl';
import { User, Shield, CreditCard, Users } from 'lucide-react';

interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
    const t = useTranslations('Settings');

    const tabs = [
        { id: 'profile', label: t('tabs.profile'), icon: User },
        { id: 'account', label: t('tabs.account'), icon: Shield },
        { id: 'billing', label: t('tabs.billing'), icon: CreditCard },
        { id: 'referrals', label: t('referrals.title'), icon: Users },
    ];

    return (
        <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
