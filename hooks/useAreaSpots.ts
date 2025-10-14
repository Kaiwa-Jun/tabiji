'use client'

import { useEffect, useState } from 'react'
import {
  searchPopularSpotsByArea,
  searchPopularSpotsByRegion,
} from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'
import type { Region } from '@/lib/constants/areas'

/**
 * エリア別人気スポット取得フック
 * 地域または都道府県が選択されたときに人気スポットを取得
 */
export function useAreaSpots(
  region: Region | null,
  prefecture: string | null
) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 両方未選択の場合は何もしない
    if (!region && !prefecture) {
      setResults([])
      return
    }

    const fetchSpots = async () => {
      setIsLoading(true)
      try {
        // 都道府県が選択されている場合は都道府県で検索
        // そうでなければ地域で検索
        const spots = prefecture
          ? await searchPopularSpotsByArea(prefecture)
          : region
            ? await searchPopularSpotsByRegion(region)
            : []
        setResults(spots)
      } catch (error) {
        console.error('[useAreaSpots] Fetch error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpots()
  }, [region, prefecture])

  return { results, isLoading }
}
