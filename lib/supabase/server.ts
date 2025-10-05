import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server Component用のSupabaseクライアントを作成します。
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} Supabaseクライアントインスタンス
 *
 * @example
 * ```tsx
 * // Server Componentでの使用例
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data: plans } = await supabase
 *     .from('travel_plans')
 *     .select('*')
 *
 *   return <div>...</div>
 * }
 * ```
 *
 * @remarks
 * - Next.js 15の非同期cookies() APIに対応
 * - NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYが必要
 * - RLSポリシーが適用されます
 * - セッション情報はCookieで管理されます
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
