import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.morphix-ai.com';

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
