import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import type { Metadata } from 'next';
import { FixedUI } from '@/components/FixedUI';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const locales = ['en', 'zh'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const slugs = getAllPostSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);
  const isZh = locale === 'zh';

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(locale, slug, post.tags);

  // Generate JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Morphix AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.morphix-ai.com/logo.png',
      },
    },
  };

  return (
    <div className="min-h-screen bg-black">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <FixedUI />

      {/* Back Link - 添加顶部间距 */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {isZh ? '返回博客' : 'Back to Blog'}
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 pb-32">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-zinc-400 mb-6">
            {post.description}
          </p>
          <div className="flex items-center gap-6 text-zinc-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {post.readingTime}
            </span>
            <span>{post.author}</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">
              {isZh ? '分享这篇文章' : 'Share this article'}
            </span>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.morphix-ai.com/${locale}/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
              >
                <Share2 className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            {isZh ? '准备好将图片转换为 3D 模型了吗？' : 'Ready to Convert Images to 3D Models?'}
          </h3>
          <p className="text-zinc-400 mb-6">
            {isZh 
              ? '免费试用 Morphix AI，体验 AI 3D 生成的魔力'
              : 'Try Morphix AI for free and experience the magic of AI 3D generation'}
          </p>
          <Link
            href={`/${locale}/create`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            {isZh ? '免费开始' : 'Start for Free'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">
              {isZh ? '相关文章' : 'Related Articles'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/${locale}/blog/${relatedPost.slug}`}
                  className="p-6 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-cyan-500/50 transition"
                >
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
