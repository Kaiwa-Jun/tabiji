'use client'

import { History } from 'lucide-react'

/**
 * 履歴タブコンポーネント
 * 検索履歴を表示
 */
export function HistoryTab() {
  // TODO: LocalStorageから検索履歴を取得
  // 仮データ: 検索履歴の例
  const history: string[] = [
    '浅草寺',
    '東京スカイツリー',
    '築地市場',
    '上野公園',
    '銀座',
    '渋谷スクランブル交差点',
  ]

  // 空状態の表示
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">検索履歴がありません</p>
        <p className="mt-1 text-xs text-gray-400">
          スポットを検索すると、ここに履歴が表示されます
        </p>
      </div>
    )
  }

  // 履歴があるときの表示
  return (
    <div>
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {history.map((item, index) => (
          <button
            key={index}
            className="flex w-full items-center gap-2 p-4 text-left hover:bg-gray-50"
          >
            <History className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="text-sm">{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
