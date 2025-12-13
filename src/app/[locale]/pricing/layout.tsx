import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Affordable AI 3D Generation Plans',
  description: 'Choose the perfect Morphix AI plan for your needs. Free trial with 10 credits. Starter, Creator, and Pro plans available. Generate unlimited 3D models.',
  keywords: [
    'AI 3D pricing', 'Morphix AI plans', '3D generation cost',
    'affordable 3D modeling', 'AI tool pricing', 'free 3D trial'
  ],
  openGraph: {
    title: 'Morphix AI Pricing - Start Creating 3D Models Today',
    description: 'Free trial available. Affordable plans for individuals and teams. Generate game-ready 3D assets.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
