import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - The Team Behind Morphix AI',
  description: 'Learn about Morphix AI, the innovative team building the future of AI-powered 3D generation. Our mission is to democratize 3D content creation.',
  keywords: [
    'Morphix AI team', 'AI 3D company', '3D generation startup',
    'AI innovation', 'about Morphix'
  ],
  openGraph: {
    title: 'About Morphix AI - Revolutionizing 3D Creation',
    description: 'Meet the team building the future of AI-powered 3D model generation.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
