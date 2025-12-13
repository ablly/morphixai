import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 中无法设置 cookie
          }
        },
      },
    }
  );
}

// 使用 service role key 的管理员客户端
// 重要: 不依赖 cookies，用于 webhook 和后台任务
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createAdminClient() {
  // 使用 service role key 创建客户端，绕过所有 RLS 策略
  // 这对于 webhook 和后台任务是必需的
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
