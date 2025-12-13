'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FixedUI } from '@/components/FixedUI';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { AccountTab } from '@/components/settings/AccountTab';
import { BillingTab } from '@/components/settings/BillingTab';
import { ReferralTab } from '@/components/settings/ReferralTab';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
    const t = useTranslations('Settings');
    useLocale(); // 保持 locale 上下文
    const [activeTab, setActiveTab] = useState('account');

    const renderContent = () => {
        switch (activeTab) {
            case 'account': return <AccountTab />;
            case 'billing': return <BillingTab />;
            case 'referrals': return <ReferralTab />;
            default: return <AccountTab />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <FixedUI />

            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-gray-400">{t('billing.subtitle')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
