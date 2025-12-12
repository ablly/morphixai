import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
        default: "Morphix AI - 2D to 3D Neural Generation",
        template: "%s | Morphix AI",
    },
    description: "Transform 2D images into high-fidelity 3D models using advanced neural rendering. Experience the next evolution of digital synthesis.",
    keywords: ["3D generation", "AI", "neural rendering", "image to 3D", "3D modeling", "machine learning"],
    authors: [{ name: "Morphix AI" }],
    creator: "Morphix AI",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://morphix.ai",
        siteName: "Morphix AI",
        title: "Morphix AI - 2D to 3D Neural Generation",
        description: "Transform 2D images into high-fidelity 3D models using advanced neural rendering.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Morphix AI",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Morphix AI - 2D to 3D Neural Generation",
        description: "Transform 2D images into high-fidelity 3D models using advanced neural rendering.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
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
            <body className="antialiased font-sans">
                <NextIntlClientProvider messages={messages}>
                    <ToastProvider>
                        <ConfirmProvider>
                            {children}
                        </ConfirmProvider>
                    </ToastProvider>
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    );
}
