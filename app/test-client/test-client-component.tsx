'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

/**
 * Client Component用のテストコンポーネント
 *
 * ブラウザ側でSupabaseクライアントを使用してデータを取得します。
 */
export function TestClientComponent() {
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Supabase接続テスト: usersテーブルのレコード数を取得
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        if (error) {
          setError(error.message)
        } else {
          setCount(count)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Client Component テスト
      </h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">接続状態</h2>
          <p className="text-sm text-gray-600">
            {loading ? (
              <span className="text-blue-600">⏳ 読み込み中...</span>
            ) : error ? (
              <span className="text-red-600">❌ エラー: {error}</span>
            ) : (
              <span className="text-green-600">✅ 接続成功</span>
            )}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700">ユーザー数</h2>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? '...' : count !== null ? count : '取得失敗'}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            このコンポーネントはClient Componentとして実装されています。
            <br />
            データは<code className="bg-gray-100 px-1 rounded">@/lib/supabase/client</code>から取得されました。
          </p>
        </div>
      </div>
    </div>
  )
}
