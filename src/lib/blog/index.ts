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

// Generate URL-safe slug from filename or frontmatter
function generateSlug(filename: string, frontmatterSlug?: string): string {
  if (frontmatterSlug) {
    return frontmatterSlug;
  }
  // Remove .md extension and convert to URL-safe slug
  const name = filename.replace(/\.md$/, '');
  // If it's already URL-safe (English), return as-is
  if (/^[a-z0-9-]+$/i.test(name)) {
    return name.toLowerCase();
  }
  // For non-ASCII (Chinese etc), create a hash-based slug
  const hash = Buffer.from(name).toString('base64url').slice(0, 12);
  return hash;
}

// Map to store filename <-> slug relationships
const slugToFilename: Map<string, Map<string, string>> = new Map();
const filenameToSlug: Map<string, Map<string, string>> = new Map();

// Initialize slug mappings for a locale
function initSlugMappings(locale: string) {
  if (slugToFilename.has(locale)) return;
  
  const localeDir = path.join(contentDirectory, locale);
  if (!fs.existsSync(localeDir)) {
    slugToFilename.set(locale, new Map());
    filenameToSlug.set(locale, new Map());
    return;
  }

  const slugMap = new Map<string, string>();
  const fileMap = new Map<string, string>();
  
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.md'));
  
  for (const filename of files) {
    const filePath = path.join(localeDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    
    const slug = generateSlug(filename, data.slug);
    slugMap.set(slug, filename);
    fileMap.set(filename, slug);
  }
  
  slugToFilename.set(locale, slugMap);
  filenameToSlug.set(locale, fileMap);
}

// Get filename from slug
function getFilenameFromSlug(locale: string, slug: string): string | undefined {
  initSlugMappings(locale);
  return slugToFilename.get(locale)?.get(slug);
}

// Get slug from filename
function getSlugFromFilename(locale: string, filename: string): string {
  initSlugMappings(locale);
  return filenameToSlug.get(locale)?.get(filename) || filename.replace(/\.md$/, '');
}

// Get all blog posts for a locale
export async function getAllPosts(locale: string): Promise<BlogPostMeta[]> {
  const localeDir = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  initSlugMappings(locale);
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(filename => {
    const slug = getSlugFromFilename(locale, filename);
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
  initSlugMappings(locale);
  
  // Try to find filename from slug mapping
  let filename = getFilenameFromSlug(locale, slug);
  
  // Fallback: try direct filename match
  if (!filename) {
    const directPath = path.join(contentDirectory, locale, `${slug}.md`);
    if (fs.existsSync(directPath)) {
      filename = `${slug}.md`;
    }
  }
  
  // Also try URL-decoded slug for Chinese filenames
  if (!filename) {
    const decodedSlug = decodeURIComponent(slug);
    const decodedPath = path.join(contentDirectory, locale, `${decodedSlug}.md`);
    if (fs.existsSync(decodedPath)) {
      filename = `${decodedSlug}.md`;
    }
  }
  
  if (!filename) {
    return null;
  }
  
  const filePath = path.join(contentDirectory, locale, filename);
  
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
  initSlugMappings(locale);
  const slugMap = slugToFilename.get(locale);
  if (!slugMap) return [];
  return Array.from(slugMap.keys());
}

// Get related posts by tags
export async function getRelatedPosts(locale: string, currentSlug: string, tags: string[], limit = 3): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts(locale);
  
  return allPosts
    .filter(post => post.slug !== currentSlug)
    .filter(post => post.tags.some(tag => tags.includes(tag)))
    .slice(0, limit);
}
