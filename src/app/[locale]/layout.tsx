import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import type { Metadata } from "next";
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    metadataBase: new URL('https://morphix-ai.com'),
    title: {
        default: "Morphix AI - Text & Image to 3D Generator | Create Game-Ready Assets in Seconds",
        template: "%s | Morphix AI - AI 3D Model Generator",
    },
    description: "Turn text and images into high-quality 3D models instantly. The ultimate AI tool for game developers, designers and 3D artists. Export in GLB, OBJ, FBX formats. Free trial available.",
    keywords: [
        // 核心功能词
        "text to 3D AI", "image to 3D converter", "AI 3D model generator",
        "AI 3D mesh generator", "3D asset generator",
        // 格式/兼容性
        "export GLB files", "export OBJ files", "export FBX files",
        "3D models for Unity", "3D models for Unreal Engine", "game-ready 3D assets",
        // 场景词
        "AI 3D assets for game dev", "rapid prototyping 3D", "AI character generator",
        "3D model from photo", "instant 3D generation",
        // 品牌词
        "Morphix AI", "Morphix 3D",
        // 中文关键词
        "AI 3D生成", "图片转3D", "文字转3D", "3D模型生成器"
    ],
    authors: [{ name: "Morphix AI" }],
    creator: "Morphix AI",
    publisher: "Morphix AI",
    alternates: {
        canonical: "https://morphix-ai.com",
        languages: {
            'en': 'https://morphix-ai.com/en',
            'zh': 'https://morphix-ai.com/zh',
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        alternateLocale: "zh_CN",
        url: "https://morphix-ai.com",
        siteName: "Morphix AI",
        title: "Morphix AI - Text & Image to 3D Generator | Create Game-Ready Assets",
        description: "Turn text and images into high-quality 3D models instantly. Export in GLB, OBJ, FBX. Perfect for game developers and designers.",
        images: [
            {
                url: "https://morphix-ai.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Morphix AI - AI 3D Model Generator",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@MorphixAI",
        creator: "@MorphixAI",
        title: "Morphix AI - Text & Image to 3D Generator",
        description: "Turn text and images into high-quality 3D models instantly. The ultimate AI tool for game developers.",
        images: ["https://morphix-ai.com/og-image.png"],
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
    verification: {
        // 已使用文件验证方式：public/google2e5bee65a6daa4b1.html 和 public/BingSiteAuth.xml
        // 无需在此添加 meta 标签验证
    },
    category: 'technology',
};

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
