import { createClient } from '@/lib/supabase/server'

/**
 * Server Component用Supabaseクライアントのテストページ
 *
 * このページはSupabaseへの接続をテストするために作成されました。
 * データベースからユーザー数を取得して表示します。
 */
export default async function TestServerPage() {
  const supabase = await createClient()

  // Supabase接続テスト: usersテーブルのレコード数を取得
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Server Component テスト
        </h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">接続状態</h2>
            <p className="text-sm text-gray-600">
              {error ? (
                <span className="text-red-600">❌ エラー: {error.message}</span>
              ) : (
                <span className="text-green-600">✅ 接続成功</span>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">ユーザー数</h2>
            <p className="text-3xl font-bold text-blue-600">
              {count !== null ? count : '取得失敗'}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              このページはServer Componentとして実装されています。
              <br />
              データは<code className="bg-gray-100 px-1 rounded">@/lib/supabase/server</code>から取得されました。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
