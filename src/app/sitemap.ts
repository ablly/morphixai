import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morphix.ai';
  const locales = ['en', 'zh'];
  const lastModified = new Date();

  // 静态页面
  const staticPages = ['', '/features', '/pricing', '/about', '/demo'];

  const routes: MetadataRoute.Sitemap = [];

  // 为每个语言生成静态页面
  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  // 认证页面（较低优先级）
  const authPages = ['/login', '/signup', '/forgot-password'];
  for (const locale of locales) {
    for (const page of authPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return routes;
}
