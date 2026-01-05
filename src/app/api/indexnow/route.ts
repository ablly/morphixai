import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = '225bfbbc73e540bdbbeafc7b2017515f';
const SITE_HOST = 'www.morphix-ai.com';

// IndexNow 端点列表
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

// 提交 URL 到 IndexNow（多个搜索引擎）
async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return {
        endpoint,
        status: response.status,
        ok: response.ok,
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      endpoint: INDEXNOW_ENDPOINTS[index],
      status: 0,
      ok: false,
      error: result.reason?.message,
    };
  });
}

// GET: 手动触发提交所有重要页面
export async function GET() {
  const importantUrls = [
    `https://${SITE_HOST}/en`,
    `https://${SITE_HOST}/zh`,
    `https://${SITE_HOST}/en/features`,
    `https://${SITE_HOST}/zh/features`,
    `https://${SITE_HOST}/en/pricing`,
    `https://${SITE_HOST}/zh/pricing`,
    `https://${SITE_HOST}/en/about`,
    `https://${SITE_HOST}/zh/about`,
    `https://${SITE_HOST}/en/create`,
    `https://${SITE_HOST}/zh/create`,
    `https://${SITE_HOST}/en/demo`,
    `https://${SITE_HOST}/zh/demo`,
    `https://${SITE_HOST}/en/blog`,
    `https://${SITE_HOST}/zh/blog`,
    // 英文博客文章
    `https://${SITE_HOST}/en/blog/ai-3d-for-game-development`,
    `https://${SITE_HOST}/en/blog/best-ai-3d-generators-2025`,
    `https://${SITE_HOST}/en/blog/how-to-convert-image-to-3d-model`,
    // 中文博客文章
    `https://${SITE_HOST}/zh/blog/ai-3d-comparison-zh`,
    `https://${SITE_HOST}/zh/blog/image-to-3d-guide-zh`,
    `https://${SITE_HOST}/zh/blog/ai-3d-game-dev-zh`,
  ];

  try {
    const results = await submitToIndexNow(importantUrls);
    const allSuccess = results.every((r) => r.ok);
    return NextResponse.json({
      success: allSuccess,
      urlsSubmitted: importantUrls.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: 提交特定 URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls array required' }, { status: 400 });
    }

    const results = await submitToIndexNow(urls);
    const allSuccess = results.every((r) => r.ok);
    return NextResponse.json({
      success: allSuccess,
      urlsSubmitted: urls.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
