import { TestClientComponent } from './test-client-component'

/**
 * Client Component用Supabaseクライアントのテストページ
 *
 * このページはSupabaseへのブラウザ側からの接続をテストします。
 */
export default function TestClientPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <TestClientComponent />
    </div>
  )
}
