import type { Metadata } from "next";

export const metadata: Metadata = {
    metadataBase: new URL('https://www.morphix-ai.com'),
    title: {
        default: "Morphix AI - AI 3D Model Generator | Image to 3D",
        template: "%s | Morphix AI",
    },
    description: "Turn text and images into high-quality 3D models instantly. The ultimate AI tool for game developers, designers and 3D artists. Export in GLB, OBJ, FBX formats. Free trial available.",
    keywords: [
        "text to 3D AI", "image to 3D converter", "AI 3D model generator",
        "AI 3D mesh generator", "3D asset generator",
        "export GLB files", "export OBJ files", "export FBX files",
        "3D models for Unity", "3D models for Unreal Engine", "game-ready 3D assets",
        "AI 3D assets for game dev", "rapid prototyping 3D", "AI character generator",
        "3D model from photo", "instant 3D generation",
        "Morphix AI", "Morphix 3D",
        "AI 3D生成", "图片转3D", "文字转3D", "3D模型生成器"
    ],
    authors: [{ name: "Morphix AI" }],
    creator: "Morphix AI",
    publisher: "Morphix AI",
    alternates: {
        canonical: "https://www.morphix-ai.com",
        languages: {
            'en': 'https://www.morphix-ai.com/en',
            'zh': 'https://www.morphix-ai.com/zh',
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        alternateLocale: "zh_CN",
        url: "https://www.morphix-ai.com",
        siteName: "Morphix AI",
        title: "Morphix AI - Text & Image to 3D Generator | Create Game-Ready Assets",
        description: "Turn text and images into high-quality 3D models instantly. Export in GLB, OBJ, FBX. Perfect for game developers and designers.",
        images: [
            {
                url: "https://www.morphix-ai.com/og-image.png",
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
        images: ["https://www.morphix-ai.com/og-image.png"],
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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
