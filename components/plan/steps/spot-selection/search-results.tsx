'use client'

import { Loader2, MapPin } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'

interface SearchResultsProps {
  results: PlaceResult[]
  isLoading: boolean
  onSelectSpot?: (spot: PlaceResult) => void
}

/**
 * 検索結果コンポーネント
 * キーワード検索の結果を表示
 */
export function SearchResults({
  results,
  isLoading,
  onSelectSpot,
}: SearchResultsProps) {
  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">検索中...</p>
      </div>
    )
  }

  // 空状態
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">検索結果がありません</p>
        <p className="mt-1 text-xs text-gray-400">
          別のキーワードで検索してください
        </p>
      </div>
    )
  }

  // 検索結果表示
  return (
    <div>
      <div className="mb-3 text-sm text-gray-700">
        {results.length}件の結果
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
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{spot.name}</h3>

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
