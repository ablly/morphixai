import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh ? '创建3D模型 - AI图片转3D工具' : 'Create 3D Model - AI Image to 3D Tool',
    description: isZh
      ? '上传图片，使用AI即时生成高质量3D模型。支持物体和人体模式，可导出GLB格式。简单三步完成3D建模。'
      : 'Upload an image and generate high-quality 3D models instantly with AI. Supports object and body modes. Export to GLB format. Create 3D models in 3 simple steps.',
    alternates: {
      canonical: `https://www.morphix-ai.com/${locale}/create`,
      languages: {
        en: 'https://www.morphix-ai.com/en/create',
        zh: 'https://www.morphix-ai.com/zh/create',
      },
    },
    openGraph: {
      title: isZh ? '创建3D模型 - Morphix AI' : 'Create 3D Model - Morphix AI',
      description: isZh
        ? '上传图片，使用AI即时生成高质量3D模型。'
        : 'Upload an image and generate high-quality 3D models instantly with AI.',
      url: `https://www.morphix-ai.com/${locale}/create`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
