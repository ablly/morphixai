import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import type { Metadata } from 'next';

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

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-bold text-white">
            Morphix <span className="text-cyan-400">AI</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href={`/${locale}/blog`} className="text-zinc-400 hover:text-white transition">
              {isZh ? '博客' : 'Blog'}
            </Link>
            <Link 
              href={`/${locale}/create`}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-medium hover:opacity-90 transition"
            >
              {isZh ? '开始创作' : 'Start Creating'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {isZh ? '返回博客' : 'Back to Blog'}
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 pb-20">
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
          className="blog-content prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Custom styles for blog content */}
        <style jsx global>{`
          .blog-content {
            color: #e4e4e7 !important;
          }
          .blog-content h1,
          .blog-content h2,
          .blog-content h3,
          .blog-content h4,
          .blog-content h5,
          .blog-content h6 {
            color: #ffffff !important;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .blog-content h2 {
            font-size: 1.75rem;
            margin-top: 3rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .blog-content h3 {
            font-size: 1.375rem;
            margin-top: 2rem;
          }
          .blog-content p {
            color: #d4d4d8 !important;
            line-height: 1.8;
            margin-bottom: 1.25rem;
          }
          .blog-content a {
            color: #22d3ee !important;
            text-decoration: none;
          }
          .blog-content a:hover {
            text-decoration: underline;
          }
          .blog-content strong {
            color: #ffffff !important;
            font-weight: 600;
          }
          .blog-content ul,
          .blog-content ol {
            color: #d4d4d8 !important;
            margin: 1.25rem 0;
            padding-left: 1.5rem;
          }
          .blog-content li {
            color: #d4d4d8 !important;
            margin-bottom: 0.5rem;
          }
          .blog-content li::marker {
            color: #22d3ee;
          }
          .blog-content code {
            color: #22d3ee !important;
            background: #27272a;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
          }
          .blog-content pre {
            background: #18181b !important;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
            margin: 1.5rem 0;
          }
          .blog-content pre code {
            background: transparent;
            padding: 0;
            color: #e4e4e7 !important;
          }
          .blog-content blockquote {
            border-left: 4px solid #22d3ee;
            padding-left: 1rem;
            color: #a1a1aa !important;
            font-style: italic;
            margin: 1.5rem 0;
          }
          .blog-content img {
            border-radius: 0.75rem;
            margin: 1.5rem 0;
          }
          .blog-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          .blog-content th,
          .blog-content td {
            border: 1px solid rgba(255,255,255,0.1);
            padding: 0.75rem;
            text-align: left;
            color: #d4d4d8 !important;
          }
          .blog-content th {
            background: #27272a;
            color: #ffffff !important;
            font-weight: 600;
          }
          .blog-content hr {
            border-color: rgba(255,255,255,0.1);
            margin: 2rem 0;
          }
        `}</style>

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
