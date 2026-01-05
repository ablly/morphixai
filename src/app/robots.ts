import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.morphix-ai.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/dashboard/',
                    '/settings/',
                    '/admin/',
                    '/license/',
                    '/ref/',
                    '/login',
                    '/signup',
                    '/forgot-password',
                    '/reset-password',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
