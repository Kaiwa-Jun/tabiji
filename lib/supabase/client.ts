import { createBrowserClient } from '@supabase/ssr'

/**
 * シングルトンのSupabaseクライアントインスタンス
 * ブラウザ側で1つのクライアントのみを生成・再利用します
 */
let client: ReturnType<typeof createBrowserClient> | undefined

/**
 * Client Component用のSupabaseクライアントを作成します。
 *
 * @returns {ReturnType<typeof createBrowserClient>} Supabaseクライアントインスタンス
 *
 * @example
 * ```tsx
 * // Client Componentでの使用例
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function PlanCard({ plan }) {
 *   const supabase = createClient()
 *
 *   const handleDelete = async () => {
 *     await supabase
 *       .from('travel_plans')
 *       .delete()
 *       .eq('id', plan.id)
 *   }
 *
 *   return <button onClick={handleDelete}>削除</button>
 * }
 * ```
 *
 * @remarks
 * - シングルトンパターンで実装されており、複数回呼び出しても同じインスタンスを返します
 * - NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYが必要
 * - RLSポリシーが適用されます
 * - Cookie管理は自動的に行われます（document.cookie経由）
 */
export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return client
}
