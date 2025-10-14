import { useEffect, useState } from 'react'
import { searchRecommendedSpots } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * おすすめスポット取得フック
 * 選択済みスポットに基づいてハイブリッド推薦を行う
 * - 選択なし: 日本の人気観光地
 * - 選択あり: 最後に選択したスポットと同じ都道府県の人気スポット
 */
export function useRecommendedSpots(selectedSpots: PlaceResult[]) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoading(true)
      try {
        const spots = await searchRecommendedSpots(selectedSpots)
        setResults(spots)
      } catch (error) {
        console.error('[useRecommendedSpots] Error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommended()
  }, [selectedSpots])

  return { results, isLoading }
}
