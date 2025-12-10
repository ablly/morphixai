'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Check, Camera, User } from 'lucide-react';

export function ProfileTab() {
    const t = useTranslations('Settings.profile');
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, bio, avatar_url')
                .eq('id', user.id)
                .single();

            if (profile) {
                setDisplayName(profile.display_name || '');
                setBio(profile.bio || '');
                setAvatarUrl(profile.avatar_url || '');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    bio: bio,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ 
                type: 'success', 
                text: locale === 'zh' ? '保存成功！' : 'Profile saved successfully!' 
            });
        } catch (err: any) {
            setMessage({ 
                type: 'error', 
                text: err.message || (locale === 'zh' ? '保存失败' : 'Failed to save') 
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('title')}</h2>
                <p className="text-gray-400 text-sm">
                    {locale === 'zh' ? '管理您的个人资料信息' : 'Manage your profile information'}
                </p>
            </div>

            {/* Avatar Section */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4 block">
                    {t('avatar')}
                </label>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/20">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/60" />
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full text-black hover:bg-cyan-400 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-2">
                            {locale === 'zh' ? '点击相机图标上传新头像' : 'Click the camera icon to upload a new avatar'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {locale === 'zh' ? '推荐尺寸: 200x200px' : 'Recommended: 200x200px'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {t('name')}
                    </label>
                    <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={locale === 'zh' ? '输入您的显示名称' : 'Enter your display name'}
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {t('bio')}
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={locale === 'zh' ? '简单介绍一下自己...' : 'Tell us about yourself...'}
                        rows={4}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                    {saving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {locale === 'zh' ? '保存中...' : 'Saving...'}</>
                    ) : (
                        <><Check className="w-4 h-4 mr-2" /> {t('save')}</>
                    )}
                </Button>
            </div>
        </div>
    );
}
