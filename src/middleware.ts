import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

// 需要登录的路径 - 暂时禁用 middleware 级别的保护，让页面自己处理
// const protectedPaths = ['/dashboard', '/create', '/settings'];

export async function middleware(request: NextRequest) {
  // 先处理国际化
  const intlResponse = intlMiddleware(request);

  // 创建 Supabase 客户端，直接在 intlResponse 上设置 cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // 直接在 intlResponse 上设置 cookies
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 刷新会话 - 这会更新 cookie
  // 重要：这确保 session 保持有效
  await supabase.auth.getUser();

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
