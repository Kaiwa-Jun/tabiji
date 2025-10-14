'use client'

import { useEffect, useState } from 'react'
import { searchPopularSpotsByArea } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * エリア別人気スポット取得フック
 * 都道府県が選択されたときに人気スポットを取得
 */
export function useAreaSpots(prefecture: string | null) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!prefecture) {
      setResults([])
      return
    }

    const fetchSpots = async () => {
      setIsLoading(true)
      try {
        const spots = await searchPopularSpotsByArea(prefecture)
        setResults(spots)
      } catch (error) {
        console.error('[useAreaSpots] Fetch error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpots()
  }, [prefecture])

  return { results, isLoading }
}
