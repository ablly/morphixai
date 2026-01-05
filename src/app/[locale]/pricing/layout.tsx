import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '价格方案 - 灵活的积分套餐' : 'Pricing - Flexible Credit Packages',
    description: isZh
      ? '选择适合您的Morphix AI积分套餐。入门版$9.90起，创作者版$29.90，专业版$99.90。新用户免费获得10积分试用。'
      : 'Choose the right Morphix AI credit package for you. Starter from $9.90, Creator $29.90, Pro $99.90. New users get 10 free credits to try.',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/pricing`,
      languages: {
        en: 'https://www.morphix-ai.com/en/pricing',
        zh: 'https://www.morphix-ai.com/zh/pricing',
      },
    },
    openGraph: {
      title: isZh ? '价格方案 - Morphix AI' : 'Pricing - Morphix AI',
      description: isZh
        ? '选择适合您的积分套餐，开始创建3D模型。'
        : 'Choose the right credit package and start creating 3D models.',
      url: `https://www.morphix-ai.com/${locale}/pricing`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
