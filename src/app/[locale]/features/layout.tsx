import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - AI 3D Model Generation Technology',
  description: 'Explore Morphix AI features: Text to 3D, Image to 3D conversion, real-time preview, PBR materials, and export to GLB, OBJ, FBX formats. Perfect for game developers and designers.',
  keywords: [
    'AI 3D features', 'text to 3D', 'image to 3D', 'PBR materials',
    'GLB export', 'OBJ export', 'FBX export', 'game-ready 3D assets',
    '3D printing models', 'real-time 3D preview'
  ],
  openGraph: {
    title: 'Morphix AI Features - AI 3D Model Generation',
    description: 'Text to 3D, Image to 3D, PBR materials, and multi-format export. Create game-ready 3D assets in seconds.',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
