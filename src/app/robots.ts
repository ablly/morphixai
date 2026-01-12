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
                    '/en/blog/*',
                    '/en/create',
                    '/zh/features',
                    '/zh/pricing',
                    '/zh/about',
                    '/zh/demo',
                    '/zh/blog',
                    '/zh/blog/*',
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
                    // 明确禁止所有语言版本的登录/注册页面
                    '/login',
                    '/signup',
                    '/forgot-password',
                    '/reset-password',
                    '/en/login',
                    '/en/signup',
                    '/en/forgot-password',
                    '/en/reset-password',
                    '/zh/login',
                    '/zh/signup',
                    '/zh/forgot-password',
                    '/zh/reset-password',
                    '/en/dashboard',
                    '/zh/dashboard',
                    '/en/settings',
                    '/zh/settings',
                    '/en/admin',
                    '/zh/admin',
                    // 禁止带查询参数的favicon
                    '/favicon.ico?*',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
