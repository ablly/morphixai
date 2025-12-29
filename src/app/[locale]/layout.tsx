import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';

// 动态生成 metadata 基于语言
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  const title = isZh
    ? 'Morphix AI - AI 3D模型生成器 | 图片转3D'
    : 'Morphix AI - AI 3D Model Generator | Image to 3D';

  const description = isZh
    ? '使用AI将图片和文字即时转换为高质量3D模型。支持GLB、OBJ、FBX格式导出。游戏开发者、设计师和3D艺术家的终极工具。免费试用。'
    : 'Turn text and images into high-quality 3D models instantly. The ultimate AI tool for game developers, designers and 3D artists. Export in GLB, OBJ, FBX formats. Free trial available.';

  return {
    metadataBase: new URL('https://www.morphix-ai.com'),
    title: {
      default: title,
      template: `%s | Morphix AI`,
    },
    description,
    keywords: isZh
      ? [
          'AI 3D生成',
          '图片转3D',
          '文字转3D',
          '3D模型生成器',
          'AI建模',
          '游戏资产生成',
          '3D角色生成',
          'GLB导出',
          'OBJ导出',
          'Morphix AI',
        ]
      : [
          'text to 3D AI',
          'image to 3D converter',
          'AI 3D model generator',
          'AI 3D mesh generator',
          '3D asset generator',
          'export GLB files',
          'export OBJ files',
          '3D models for Unity',
          '3D models for Unreal Engine',
          'game-ready 3D assets',
          'Morphix AI',
        ],
    authors: [{ name: 'Morphix AI' }],
    creator: 'Morphix AI',
    publisher: 'Morphix AI',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}`,
      languages: {
        en: 'https://www.morphix-ai.com/en',
        zh: 'https://www.morphix-ai.com/zh',
      },
    },
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
      url: `https://www.morphix-ai.com/${locale}`,
      siteName: 'Morphix AI',
      title: isZh
        ? 'Morphix AI - AI 3D模型生成器 | 图片转3D'
        : 'Morphix AI - Text & Image to 3D Generator | Create Game-Ready Assets',
      description: isZh
        ? '使用AI将图片和文字即时转换为高质量3D模型。支持GLB、OBJ、FBX格式导出。'
        : 'Turn text and images into high-quality 3D models instantly. Export in GLB, OBJ, FBX. Perfect for game developers and designers.',
      images: [
        {
          url: 'https://www.morphix-ai.com/og-image.png',
          width: 1200,
          height: 630,
          alt: isZh ? 'Morphix AI - AI 3D模型生成器' : 'Morphix AI - AI 3D Model Generator',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@MorphixAI',
      creator: '@MorphixAI',
      title: isZh ? 'Morphix AI - AI 3D模型生成器' : 'Morphix AI - Text & Image to 3D Generator',
      description: isZh
        ? '使用AI将图片和文字即时转换为高质量3D模型。'
        : 'Turn text and images into high-quality 3D models instantly. The ultimate AI tool for game developers.',
      images: ['https://www.morphix-ai.com/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'technology',
  };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <OrganizationJsonLd />
                <SoftwareApplicationJsonLd />
            </head>
            <body className="antialiased font-sans">
                <NextIntlClientProvider messages={messages}>
                    <ToastProvider>
                        <ConfirmProvider>
                            {children}
                        </ConfirmProvider>
                    </ToastProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
