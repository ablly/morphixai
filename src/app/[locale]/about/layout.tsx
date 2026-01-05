import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '关于我们 - Morphix AI团队' : 'About Us - Morphix AI Team',
    description: isZh
      ? '了解Morphix AI的使命和愿景。我们致力于让每个人都能轻松创建高质量3D内容，推动AI 3D生成技术的民主化。'
      : 'Learn about Morphix AI mission and vision. We are dedicated to making high-quality 3D content creation accessible to everyone, democratizing AI 3D generation technology.',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/about`,
      languages: {
        en: 'https://www.morphix-ai.com/en/about',
        zh: 'https://www.morphix-ai.com/zh/about',
      },
    },
    openGraph: {
      title: isZh ? '关于我们 - Morphix AI' : 'About Us - Morphix AI',
      description: isZh
        ? '了解Morphix AI的使命和愿景。'
        : 'Learn about Morphix AI mission and vision.',
      url: `https://www.morphix-ai.com/${locale}/about`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
