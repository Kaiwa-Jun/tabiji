'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📱 tabiji
          </h1>
          <p className="text-gray-600">旅行計画・記録アプリ 開発環境</p>
        </motion.div>

        {/* LIFF機能テスト用（LINEログイン必要） */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📱</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                LIFF機能テスト（スマホ専用）
              </h2>
              <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  ⚠️ LINEログインが必要です
                </p>
                <p className="text-xs text-green-800">
                  このボタンはスマホのLINEアプリからアクセスしてください。<br />
                  PCでクリックするとLINEログイン画面にリダイレクトされます。
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <NavLink
              href="/liff"
              icon="🔐"
              title="LIFFトップ（LINE連携）"
              description="LINEログイン → プロフィール取得"
              highlight
            />
            <NavLink
              href="/liff/test"
              icon="🧪"
              title="LIFF SDK動作確認"
              description="LINE機能の実機テスト"
              highlight
            />
          </div>
        </motion.div>

        {/* ナビゲーションカード */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* LIFF画面セクション */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              LIFF画面（PC開発用）
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              UI/UX開発・DB連携確認（LINEログイン不要）
            </p>
            <div className="space-y-3">
              <NavLink
                href="/liff/plans"
                icon="📋"
                title="プラン一覧"
                description="作成した旅行プラン"
              />
              <NavLink
                href="/liff/plan/new"
                icon="➕"
                title="プラン作成"
                description="新しい旅行プランを作成"
              />
              <NavLink
                href="/liff/help"
                icon="❓"
                title="ヘルプ"
                description="使い方ガイド"
              />
            </div>
          </motion.div>

          {/* テスト画面セクション */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              テスト画面
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              開発・動作確認用のテストページ
            </p>
            <div className="space-y-3">
              <NavLink
                href="/test-client"
                icon="⚙️"
                title="Client Component"
                description="クライアントコンポーネントのテスト"
              />
              <NavLink
                href="/test-server"
                icon="🖥️"
                title="Server Component"
                description="サーバーコンポーネントのテスト"
              />
            </div>
          </motion.div>
        </div>

        {/* 開発情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">📝</span>
            開発ワークフロー
          </h2>
          <div className="space-y-4">
            {/* 通常の開発 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                🖥️ 通常の開発（95%）
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                localhost:3000 で開発・確認
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                npm run dev
              </code>
              <p className="text-xs text-gray-500 mt-2">
                DB操作、UI/UX、ビジネスロジック等
              </p>
            </div>

            {/* LIFF機能テスト */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                📱 LIFF機能テスト（5%）
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                スマホのLINEアプリから確認
              </p>
              <div className="space-y-1">
                <code className="block text-xs bg-gray-100 px-2 py-1 rounded">
                  ターミナル1: npm run dev
                </code>
                <code className="block text-xs bg-gray-100 px-2 py-1 rounded">
                  ターミナル2: npm run dev:liff
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                LINEプロフィール取得、メッセージ送信等
              </p>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              💡 <strong>ヒント:</strong> localhost:3000のLIFFページはUI確認用。実際のLIFF SDK機能（LINE連携）はスマホLINEアプリから操作します。
            </p>
          </div>
        </motion.div>

        {/* フッター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>開発サーバー: http://localhost:3000</p>
          <p className="mt-1">
            <a
              href="https://github.com/Kaiwa-Jun/tabiji"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Repository
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function NavLink({
  href,
  icon,
  title,
  description,
  highlight = false,
}: {
  href: string
  icon: string
  title: string
  description: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`block p-4 border rounded-lg transition-colors ${
        highlight
          ? 'border-green-300 bg-white hover:bg-green-50 hover:border-green-400'
          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3
            className={`font-semibold ${highlight ? 'text-green-900' : 'text-gray-900'}`}
          >
            {title}
          </h3>
          <p
            className={`text-xs mt-1 ${highlight ? 'text-green-700' : 'text-gray-600'}`}
          >
            {description}
          </p>
        </div>
        <span className={highlight ? 'text-green-400' : 'text-gray-400'}>→</span>
      </div>
    </Link>
  )
}
