import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '功能特性 - AI 3D模型生成技术' : 'Features - AI 3D Model Generation Technology',
    description: isZh
      ? '探索Morphix AI强大的3D生成功能：一键图片转3D、高精度网格生成、多格式导出（GLB/OBJ/FBX）、游戏资产优化、3D打印支持等。'
      : 'Explore Morphix AI powerful 3D generation features: one-click image to 3D, high-precision mesh generation, multi-format export (GLB/OBJ/FBX), game asset optimization, 3D printing support.',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/features`,
      languages: {
        en: 'https://www.morphix-ai.com/en/features',
        zh: 'https://www.morphix-ai.com/zh/features',
      },
    },
    openGraph: {
      title: isZh ? '功能特性 - Morphix AI' : 'Features - Morphix AI',
      description: isZh
        ? '探索Morphix AI强大的3D生成功能，支持多种导出格式。'
        : 'Explore Morphix AI powerful 3D generation features with multiple export formats.',
      url: `https://www.morphix-ai.com/${locale}/features`,
    },
  };
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
