import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = '225bfbbc73e540bdbbeafc7b2017515f';
const SITE_HOST = 'www.morphix-ai.com';

// 提交 URL 到 IndexNow
async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  return {
    status: response.status,
    ok: response.ok,
  };
}

// GET: 手动触发提交所有重要页面
export async function GET() {
  const importantUrls = [
    `https://${SITE_HOST}/`,
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
    `https://${SITE_HOST}/en/blog`,
    `https://${SITE_HOST}/zh/blog`,
  ];

  try {
    const result = await submitToIndexNow(importantUrls);
    return NextResponse.json({
      success: result.ok,
      status: result.status,
      urlsSubmitted: importantUrls.length,
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

    const result = await submitToIndexNow(urls);
    return NextResponse.json({
      success: result.ok,
      status: result.status,
      urlsSubmitted: urls.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
