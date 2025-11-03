'use client'

import { useEffect, useState } from 'react'
import { searchSpotsByKeyword } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'
import type { SearchType } from '@/contexts/search-modal-context'

/**
 * SearchTypeから検索フィルター用のtypes配列を取得
 */
function getPlaceTypes(searchType: SearchType): string[] | undefined {
  switch (searchType) {
    case 'station':
      return ['train_station', 'transit_station', 'airport', 'subway_station']
    case 'accommodation':
      return ['lodging', 'hotel', 'resort_hotel']
    case 'spot':
    default:
      return undefined // すべてのタイプを許可
  }
}

/**
 * スポット検索フック
 * キーワード、都道府県、検索タイプでスポットを検索（300msデバウンス）
 * @param keyword - 検索キーワード
 * @param prefecture - 都道府県名
 * @param searchType - 検索タイプ
 * @param nearLocation - 検索の中心位置（位置ベース検索用、オプション）
 */
export function useSearchSpots(
  keyword: string,
  prefecture: string | null,
  searchType: SearchType = 'spot',
  nearLocation?: { lat: number; lng: number }
) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const types = getPlaceTypes(searchType)
        console.log('[useSearchSpots] 🔍 検索開始:', {
          keyword,
          prefecture,
          searchType,
          types,
          nearLocation,
        })
        const spots = await searchSpotsByKeyword(
          keyword,
          prefecture || undefined,
          types,
          nearLocation
        )
        console.log('[useSearchSpots] ✅ 検索結果:', {
          count: spots.length,
          results: spots.slice(0, 3).map((s) => s.name),
        })
        setResults(spots)
      } catch (error) {
        console.error('[useSearchSpots] ❌ Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [keyword, prefecture, searchType, nearLocation])

  return { results, isLoading }
}
