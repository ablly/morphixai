import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

// 需要登录的路径
const protectedPaths = ['/dashboard', '/create', '/settings'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 创建 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 刷新会话
  const { data: { user } } = await supabase.auth.getUser();

  // 检查受保护路径
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(path =>
    pathname.includes(path)
  );

  // 获取当前语言
  const locale = pathname.split('/')[1];
  const validLocale = ['en', 'zh'].includes(locale) ? locale : 'en';

  if (isProtectedPath && !user) {
    // 未登录用户访问受保护页面，重定向到登录页
    const loginUrl = new URL(`/${validLocale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 处理国际化
  const intlResponse = intlMiddleware(request);

  // 合并 cookies
  response.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
