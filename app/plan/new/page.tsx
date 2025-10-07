/**
 * プラン作成ページ
 * 新しい旅行プランを作成
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewPlanPage() {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Server Actionでプラン作成
    console.log('プラン作成:', { title, startDate, endDate })

    alert('プラン作成機能は実装中です')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ➕ 新しいプラン
          </h1>
          <p className="text-sm text-gray-600">
            旅行プランの基本情報を入力してください
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プラン名 */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block mb-2">
              <span className="text-sm font-semibold text-gray-700">
                プラン名 <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 京都旅行 2025春"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>

          {/* 日程 */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              日程 <span className="text-red-500">*</span>
            </h3>

            <label className="block">
              <span className="text-sm text-gray-600">出発日</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">帰着日</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              プランを作成
            </button>

            <Link
              href="/plans"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>

        {/* フッター */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="block text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
