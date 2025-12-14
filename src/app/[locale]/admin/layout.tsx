'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Users, Image, CreditCard, 
  UserPlus, LogOut, Menu, X, Loader2, Wallet 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // 已知管理员邮箱列表 - 这些邮箱无论数据库状态如何都有管理员权限
    const adminEmails = ['3533912007@qq.com'];
    const userEmailLower = (user.email || '').toLowerCase();
    const isKnownAdmin = adminEmails.some(e => e.toLowerCase() === userEmailLower);

    // 如果是已知管理员，直接授权
    if (isKnownAdmin) {
      console.log('Admin access granted via email whitelist:', user.email);
      setUserEmail(user.email || '');
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // 否则检查数据库中的 role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      router.push(`/${locale}/dashboard`);
      return;
    }

    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    if (!hasAdminRole) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    setUserEmail(profile?.email || user.email || '');
    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: '仪表盘' },
    { href: `/${locale}/admin/users`, icon: Users, label: '用户管理' },
    { href: `/${locale}/admin/generations`, icon: Image, label: '生成记录' },
    { href: `/${locale}/admin/transactions`, icon: CreditCard, label: '积分交易' },
    { href: `/${locale}/admin/payments`, icon: Wallet, label: '支付记录' },
    { href: `/${locale}/admin/referrals`, icon: UserPlus, label: '邀请记录' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-800 rounded-lg text-white"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-white/10 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Morphix 管理后台</h1>
          <p className="text-sm text-zinc-400 mt-1 truncate">{userEmail}</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
