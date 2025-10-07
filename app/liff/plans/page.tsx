/**
 * プラン一覧ページ
 * 作成した旅行プランの一覧を表示
 */

import Link from 'next/link'

export default function PlansPage() {
  // TODO: Supabaseからプラン一覧を取得

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            📋 プラン一覧
          </h1>
          <Link
            href="/liff/plan/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            ＋ 新規作成
          </Link>
        </div>

        {/* プラン一覧（仮データ） */}
        <div className="space-y-3">
          {/* サンプルプラン1 */}
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                京都旅行 2025春
              </h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                計画中
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              2025/04/15 - 2025/04/17 (3日間)
            </p>
            <div className="flex gap-2">
              <Link
                href="/liff/plan/1"
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm text-center hover:bg-gray-200 transition-colors"
              >
                詳細
              </Link>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                編集
              </button>
            </div>
          </div>

          {/* サンプルプラン2 */}
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                沖縄旅行 2025夏
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                予約済み
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              2025/08/10 - 2025/08/14 (5日間)
            </p>
            <div className="flex gap-2">
              <Link
                href="/liff/plan/2"
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm text-center hover:bg-gray-200 transition-colors"
              >
                詳細
              </Link>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                編集
              </button>
            </div>
          </div>
        </div>

        {/* 空の状態メッセージ（プランがない場合） */}
        {/*
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            まだプランがありません
          </p>
          <Link
            href="/liff/plan/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            最初のプランを作成
          </Link>
        </div>
        */}

        {/* フッターナビゲーション */}
        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/liff"
            className="block text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
