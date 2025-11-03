import { useEffect, useState } from 'react'
import { searchRecommendedSpots } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'
import type { TripEndpoints } from '@/types/models'

/**
 * おすすめスポット取得フック
 * エンドポイント（出発地・宿泊施設・目的地）がある場合: それらの地点から近い観光地
 * エンドポイントがない場合で選択済みスポットがある場合: 最後に選択したスポットと同じ都道府県の人気スポット
 * どちらもない場合: 日本の人気観光地
 * @param selectedSpots - 選択済みスポット配列
 * @param endpoints - 旅程のエンドポイント（オプション）
 */
export function useRecommendedSpots(
  selectedSpots: PlaceResult[],
  endpoints?: TripEndpoints | null
) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoading(true)
      try {
        const spots = await searchRecommendedSpots(selectedSpots, endpoints)
        setResults(spots)
      } catch (error) {
        console.error('[useRecommendedSpots] Error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommended()
  }, [selectedSpots, endpoints])

  return { results, isLoading }
}
