import { MetadataRoute } from 'next';
import { getAllPosts, getAllPostSlugs } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    '/blog',      // 博客列表页
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
      const priority = page === '' ? 0.9 : page === '/features' ? 0.8 : page === '/blog' ? 0.8 : 0.7;
      pages.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: page === '' || page === '/blog' ? 'daily' : 'weekly',
        priority,
      });
    }

    // 博客文章页面
    const posts = await getAllPosts(locale);
    for (const post of posts) {
      pages.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return pages;
}
