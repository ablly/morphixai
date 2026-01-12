import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.morphix-ai.com';
  const locales = ['en', 'zh'];
  const lastModified = new Date();

  // 主要页面（只包含应该被索引的公开页面）
  const mainPages = [
    '',           // 首页
    '/features',  // 功能页
    '/pricing',   // 定价页
    '/about',     // 关于页
    '/demo',      // 演示页
    '/blog',      // 博客列表页
    '/create',    // 创建页
  ];

  // 生成所有语言版本的页面
  const pages: MetadataRoute.Sitemap = [];

  // 各语言版本的页面
  for (const locale of locales) {
    for (const page of mainPages) {
      // 首页优先级最高
      const priority = page === '' ? 1.0 : 
                       page === '/features' ? 0.9 : 
                       page === '/pricing' ? 0.9 :
                       page === '/create' ? 0.9 :
                       page === '/blog' ? 0.8 : 
                       0.7;
      
      pages.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: page === '' || page === '/blog' ? 'daily' : 'weekly',
        priority,
        // 添加 alternates 帮助 Google 理解语言版本关系
        alternates: {
          languages: {
            en: `${baseUrl}/en${page}`,
            zh: `${baseUrl}/zh${page}`,
          },
        },
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
