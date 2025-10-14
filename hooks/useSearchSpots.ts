'use client'

import { useEffect, useState } from 'react'
import { searchSpotsByKeyword } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * スポット検索フック
 * キーワードと都道府県でスポットを検索（300msデバウンス）
 */
export function useSearchSpots(keyword: string, prefecture: string | null) {
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
        const spots = await searchSpotsByKeyword(keyword, prefecture || undefined)
        setResults(spots)
      } catch (error) {
        console.error('[useSearchSpots] Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [keyword, prefecture])

  return { results, isLoading }
}
