/**
 * ヘルプページ
 * アプリの使い方ガイド
 */

import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ❓ ヘルプ
          </h1>
          <p className="text-sm text-gray-600">
            tabijiの使い方をご案内します
          </p>
        </div>

        {/* ヘルプセクション */}
        <div className="space-y-4">
          {/* プラン作成 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span>
              プランの作成
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>1. 「新しいプラン」をタップ</strong>
              </p>
              <p className="pl-4">
                トップページまたはプラン一覧から作成できます
              </p>
              <p>
                <strong>2. 基本情報を入力</strong>
              </p>
              <p className="pl-4">
                プラン名、出発日、帰着日を入力します
              </p>
              <p>
                <strong>3. 「プランを作成」をタップ</strong>
              </p>
              <p className="pl-4">
                作成したプランはプラン一覧に表示されます
              </p>
            </div>
          </div>

          {/* スポット追加 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📍</span>
              スポットの追加
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>1. プラン詳細を開く</strong>
              </p>
              <p className="pl-4">
                プラン一覧から確認したいプランをタップ
              </p>
              <p>
                <strong>2. 「スポットを追加」をタップ</strong>
              </p>
              <p className="pl-4">
                検索または地図から訪問先を選択できます
              </p>
              <p>
                <strong>3. 詳細を入力</strong>
              </p>
              <p className="pl-4">
                訪問時間、滞在時間などを設定します
              </p>
            </div>
          </div>

          {/* ルート最適化 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              ルート最適化
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                追加したスポットは自動的に最適な順序で並び替えられます。
              </p>
              <p>
                移動時間や営業時間を考慮した効率的なルートを提案します。
              </p>
            </div>
          </div>

          {/* 共有機能 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">👥</span>
              プランの共有
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                作成したプランは友達と共有できます。
              </p>
              <p>
                プラン詳細画面から「共有」ボタンをタップしてください。
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-bold text-blue-900 mb-3">
            よくある質問
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-blue-900">
                Q. プランは何個まで作成できますか？
              </p>
              <p className="text-blue-800 pl-4 mt-1">
                A. 制限はありません。必要なだけ作成できます。
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                Q. 作成したプランは削除できますか？
              </p>
              <p className="text-blue-800 pl-4 mt-1">
                A. はい。プラン詳細画面から削除できます。
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                Q. オフラインでも使えますか？
              </p>
              <p className="text-blue-800 pl-4 mt-1">
                A. 地図機能など一部機能はインターネット接続が必要です。
              </p>
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            お問い合わせ
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            その他ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
            LINEで問い合わせる
          </button>
        </div>

        {/* フッター */}
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
