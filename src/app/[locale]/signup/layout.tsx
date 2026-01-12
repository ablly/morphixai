import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '注册 - Morphix AI' : 'Sign Up - Morphix AI',
    description: isZh
      ? '注册Morphix AI账户，免费获得10积分，开始创建AI 3D模型。'
      : 'Create your Morphix AI account, get 10 free credits, and start creating AI 3D models.',
    // 注册页面不应该被索引
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
