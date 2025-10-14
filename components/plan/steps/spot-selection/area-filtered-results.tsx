'use client'

import { Loader2, MapPin } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'

interface AreaFilteredResultsProps {
  results: PlaceResult[]
  isLoading: boolean
  prefecture: string
  onSelectSpot?: (spot: PlaceResult) => void
}

/**
 * エリアフィルター結果コンポーネント
 * 選択されたエリアの人気スポットを表示
 */
export function AreaFilteredResults({
  results,
  isLoading,
  prefecture,
  onSelectSpot,
}: AreaFilteredResultsProps) {
  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    )
  }

  // 空状態
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">スポットが見つかりませんでした</p>
        <p className="mt-1 text-xs text-gray-400">
          別のエリアを選択してください
        </p>
      </div>
    )
  }

  // 結果表示
  return (
    <div>
      <div className="mb-3 text-sm text-gray-700">
        {prefecture}の人気スポット {results.length}件
      </div>

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {results.map((spot) => (
          <button
            key={spot.placeId}
            className="flex w-full gap-3 p-4 text-left hover:bg-gray-50"
            onClick={() => onSelectSpot?.(spot)}
          >
            {/* サムネイル画像 */}
            {spot.photoUrl ? (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <img
                  src={spot.photoUrl}
                  alt={spot.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                <MapPin className="h-6 w-6 text-gray-400" />
              </div>
            )}

            {/* スポット情報 */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{spot.name}</h3>

              {/* 評価 */}
              {spot.rating && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  <span>⭐️ {spot.rating}</span>
                </div>
              )}

              {/* 住所 */}
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
