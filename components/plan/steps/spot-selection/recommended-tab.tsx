'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import { useSearchModal } from '@/contexts/search-modal-context'
import { useRecommendedSpots } from '@/hooks/useRecommendedSpots'
import Image from 'next/image'

/**
 * おすすめタブコンポーネント
 * ハイブリッドアプローチ:
 * - 選択なし: 日本の人気観光地
 * - 選択あり: 最後に選択したスポットと同じ都道府県の人気スポット
 */
export function RecommendedTab() {
  const { selectedSpots, selectSpot } = useSearchModal()
  const { results, isLoading } = useRecommendedSpots(selectedSpots)

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="mb-3 h-12 w-12 animate-spin text-gray-300" />
        <p className="text-sm text-gray-500">おすすめスポットを読み込み中...</p>
      </div>
    )
  }

  // 結果なし状態
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">おすすめスポットが見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <Sparkles className="h-4 w-4" />
        <span>
          {selectedSpots.length === 0
            ? '日本の人気観光スポット'
            : `${selectedSpots[selectedSpots.length - 1].address.match(/(北海道|.+?[都道府県])/)?.[1] || '近くの'}人気スポット`}
        </span>
      </div>

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {results.map((spot) => (
          <button
            key={spot.placeId}
            className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50"
            onClick={() => selectSpot(spot)}
          >
            {spot.photoUrl && (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                width={60}
                height={60}
                className="h-[60px] w-[60px] flex-shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{spot.name}</h3>
              {spot.rating && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  <span>⭐️ {spot.rating}</span>
                </div>
              )}
              {spot.address && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  {spot.address.replace(/〒?\d{3}-?\d{4}\s*/, '')}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
