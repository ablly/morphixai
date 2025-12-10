'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, Check } from 'lucide-react';

export function AccountTab() {
    const t = useTranslations('Settings.account');
    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) setEmail(user.email);
            setEmailLoading(false);
        });
    }, []);

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: '密码至少需要6个字符' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的密码不一致' });
            return;
        }

        setUpdating(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: '密码更新成功！' });
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setMessage({ type: 'error', text: '更新失败，请重试' });
        } finally {
            setUpdating(false);
        }
    };

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

    const handleDeleteAccount = async () => {
        if (deleteConfirmEmail !== email) {
            setMessage({ type: 'error', text: '邮箱地址不匹配' });
            return;
        }

        setDeleteLoading(true);
        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmEmail: deleteConfirmEmail }),
            });

            if (res.ok) {
                window.location.href = '/';
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || '删除失败' });
            }
        } catch {
            setMessage({ type: 'error', text: '删除失败，请重试' });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('title')}</h2>
                <p className="text-gray-400 text-sm">{t('subtitle')}</p>
            </div>

            {/* Email Section */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {t('email')}
                    </label>
                    <div className="flex gap-4">
                        <Input
                            value={emailLoading ? '加载中...' : email}
                            disabled
                            className="bg-black/20 border-white/10 text-gray-400 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('changePassword')}</h3>
                
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid gap-4 max-w-md">
                    <Input
                        type="password"
                        placeholder={t('newPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black/20 border-white/10"
                    />
                    <Input
                        type="password"
                        placeholder="确认新密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-black/20 border-white/10"
                    />
                    <Button 
                        onClick={handleUpdatePassword}
                        disabled={updating || !newPassword || !confirmPassword}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-50"
                    >
                        {updating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 更新中...</>
                        ) : (
                            <><Check className="w-4 h-4 mr-2" /> {t('updatePassword')}</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-500">{t('delete')}</h3>
                        <p className="text-red-400/60 text-sm mt-1">{t('deleteDesc')}</p>
                    </div>
                    <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {t('delete')}
                    </Button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                        <p className="text-red-400 text-sm">
                            请输入您的邮箱地址确认删除：<strong>{email}</strong>
                        </p>
                        <Input
                            type="email"
                            placeholder="输入邮箱确认"
                            value={deleteConfirmEmail}
                            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                            className="bg-black/20 border-red-500/30 text-white"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmEmail('');
                                }}
                                className="flex-1 border-white/20"
                            >
                                取消
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmEmail !== email}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {deleteLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 删除中...</>
                                ) : (
                                    '确认删除'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
