import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.morphix-ai.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/en/',
                    '/zh/',
                    '/en/features',
                    '/en/pricing',
                    '/en/about',
                    '/en/demo',
                    '/en/blog',
                    '/en/create',
                    '/zh/features',
                    '/zh/pricing',
                    '/zh/about',
                    '/zh/demo',
                    '/zh/blog',
                    '/zh/create',
                ],
                disallow: [
                    '/api/',
                    '/auth/',
                    '/_next/',
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
