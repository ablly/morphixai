import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 允许加载外部图片
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // 静态资源优化
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(glb|gltf|obj|mtl)$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/files/',
                    outputPath: 'static/files/',
                },
            },
        });
        return config;
    },
    // 重定向错误的 URL 到正确的页面
    async redirects() {
        return [
            // 修复错误的博客 URL（中文 slug 出现在英文路径下）
            {
                source: '/en/blog/ai-3d-comparison-zh',
                destination: '/zh/blog/ai-3d-comparison-zh',
                permanent: true,
            },
            {
                source: '/en/blog/image-to-3d-guide-zh',
                destination: '/zh/blog/image-to-3d-guide-zh',
                permanent: true,
            },
            {
                source: '/en/blog/ai-3d-game-dev-zh',
                destination: '/zh/blog/ai-3d-game-dev-zh',
                permanent: true,
            },
            // 修复没有语言前缀的博客 URL
            {
                source: '/blog/:slug*',
                destination: '/en/blog/:slug*',
                permanent: true,
            },
            // 根路径重定向到英文版
            {
                source: '/',
                destination: '/en',
                permanent: false,
            },
        ];
    },
};

export default withNextIntl(nextConfig);
