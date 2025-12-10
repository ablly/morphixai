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
};

export default withNextIntl(nextConfig);
