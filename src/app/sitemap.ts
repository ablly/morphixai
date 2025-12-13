import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.morphix-ai.com';
  const locales = ['en', 'zh'];
  const lastModified = new Date();

  // 主要页面
  const mainPages = [
    '',           // 首页
    '/features',  // 功能页
    '/pricing',   // 定价页
    '/about',     // 关于页
    '/demo',      // 演示页
  ];

  // 生成所有语言版本的页面
  const pages: MetadataRoute.Sitemap = [];

  // 根路径
  pages.push({
    url: baseUrl,
    lastModified,
    changeFrequency: 'daily',
    priority: 1,
  });

  // 各语言版本的页面
  for (const locale of locales) {
    for (const page of mainPages) {
      const priority = page === '' ? 0.9 : page === '/features' ? 0.8 : 0.7;
      pages.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority,
      });
    }
  }

  return pages;
}
