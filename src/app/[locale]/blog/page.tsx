import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { FixedUI } from '@/components/FixedUI';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  
  return {
    title: isZh ? '博客 - AI 3D 生成教程与资讯' : 'Blog - AI 3D Generation Tutorials & News',
    description: isZh 
      ? '探索 AI 3D 模型生成的最新教程、技巧和行业资讯。学习如何将图片转换为 3D 模型。'
      : 'Explore the latest tutorials, tips, and news about AI 3D model generation. Learn how to convert images to 3D models.',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/blog`,
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = await getAllPosts(locale);
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <FixedUI />

      {/* Hero - 添加顶部间距以避免被固定导航遮挡 */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isZh ? 'AI 3D 生成博客' : 'AI 3D Generation Blog'}
          </h1>
          <p className="text-xl text-zinc-400">
            {isZh 
              ? '教程、技巧和行业最新资讯'
              : 'Tutorials, tips, and the latest industry news'}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-lg">
                {isZh ? '暂无文章' : 'No posts yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article 
                  key={post.slug}
                  className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition group"
                >
                  {post.image && (
                    <div className="aspect-video bg-zinc-800 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition">
                      <Link href={`/${locale}/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-zinc-400 mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link 
                      href={`/${locale}/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
                    >
                      {isZh ? '阅读更多' : 'Read more'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/10 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isZh ? '准备好开始创作了吗？' : 'Ready to Start Creating?'}
          </h2>
          <p className="text-zinc-400 mb-8">
            {isZh 
              ? '免费试用 Morphix AI，将您的图片转换为 3D 模型'
              : 'Try Morphix AI for free and convert your images to 3D models'}
          </p>
          <Link
            href={`/${locale}/create`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            {isZh ? '免费开始' : 'Start for Free'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
