import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://morphix.ai';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/auth/', '/dashboard/', '/create/', '/settings/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
