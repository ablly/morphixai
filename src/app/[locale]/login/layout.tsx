import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '登录 - Morphix AI' : 'Login - Morphix AI',
    description: isZh
      ? '登录您的Morphix AI账户，开始创建AI 3D模型。'
      : 'Sign in to your Morphix AI account and start creating AI 3D models.',
    // 登录页面不应该被索引
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    // 不设置 canonical，因为不希望被索引
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
