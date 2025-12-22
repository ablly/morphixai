import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  tags: string[];
  locale: string;
  readingTime: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  tags: string[];
  locale: string;
  readingTime: string;
}

// Get all blog posts for a locale
export async function getAllPosts(locale: string): Promise<BlogPostMeta[]> {
  const localeDir = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(filename => {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(localeDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Morphix AI',
      image: data.image,
      tags: data.tags || [],
      locale,
      readingTime: stats.text,
    };
  });

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get a single blog post
export async function getPostBySlug(locale: string, slug: string): Promise<BlogPost | null> {
  const filePath = path.join(contentDirectory, locale, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    author: data.author || 'Morphix AI',
    image: data.image,
    tags: data.tags || [],
    locale,
    readingTime: stats.text,
    content: contentHtml,
  };
}

// Get all slugs for static generation
export function getAllPostSlugs(locale: string): string[] {
  const localeDir = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  return fs.readdirSync(localeDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

// Get related posts by tags
export async function getRelatedPosts(locale: string, currentSlug: string, tags: string[], limit = 3): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts(locale);
  
  return allPosts
    .filter(post => post.slug !== currentSlug)
    .filter(post => post.tags.some(tag => tags.includes(tag)))
    .slice(0, limit);
}
