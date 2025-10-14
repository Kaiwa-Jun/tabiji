'use client'

import { History } from 'lucide-react'
import { useSearchModal } from '@/contexts/search-modal-context'

/**
 * 履歴タブコンポーネント
 * 選択済みスポットの履歴を表示
 */
export function HistoryTab() {
  const { selectedSpots, selectSpot } = useSearchModal()

  // 空状態の表示
  if (selectedSpots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">選択したスポットがありません</p>
        <p className="mt-1 text-xs text-gray-400">
          スポットを選択すると、ここに履歴が表示されます
        </p>
      </div>
    )
  }

  // 履歴があるときの表示（最新順）
  const reversedSpots = [...selectedSpots].reverse()

  return (
    <div>
      <div className="mb-3 text-sm text-gray-700">
        選択済み: {selectedSpots.length}件
      </div>

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {reversedSpots.map((spot) => (
          <button
            key={spot.placeId}
            className="flex w-full items-center gap-2 p-4 text-left hover:bg-gray-50"
            onClick={() => selectSpot(spot)}
          >
            <History className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="min-w-0 flex-1 truncate text-sm">{spot.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
