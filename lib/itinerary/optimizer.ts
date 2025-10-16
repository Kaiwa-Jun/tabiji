/**
 * 旅程最適化ロジック - 訪問順序の最適化
 */

import { calculateDistanceHaversine } from '@/lib/maps/utils'
import type { Coordinates } from '@/lib/maps/constants'
import type { Spot } from './types'

// 型を再エクスポート
export type { Spot } from './types'

/**
 * 貪欲法による訪問順序の最適化
 *
 * @param spots - 選択されたスポット一覧
 * @returns 最適化されたスポット配列
 *
 * @example
 * ```typescript
 * const spots = [
 *   { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
 *   { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
 *   { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
 * ]
 *
 * const optimized = optimizeSpotOrder(spots)
 * // 最も西にあるスポットから始まり、最近傍法で並べ替えられる
 * ```
 */
export function optimizeSpotOrder(spots: Spot[]): Spot[] {
  // 空配列または1つのスポットの場合はそのまま返す
  if (spots.length === 0) return []
  if (spots.length === 1) return [...spots]

  const visited = new Set<string>()
  const optimized: Spot[] = []

  // 最初のスポット: 最も西にあるスポットを選択
  let current = spots.reduce((westmost, spot) =>
    spot.lng < westmost.lng ? spot : westmost
  )

  optimized.push(current)
  visited.add(current.id)

  // 残りのスポットを順次選択（最近傍法）
  while (visited.size < spots.length) {
    let nearest: Spot | null = null
    let minDistance = Infinity

    const currentCoords: Coordinates = {
      lat: current.lat,
      lng: current.lng,
    }

    // 現在地から最も近いスポットを探す
    for (const spot of spots) {
      if (visited.has(spot.id)) continue

      const spotCoords: Coordinates = {
        lat: spot.lat,
        lng: spot.lng,
      }

      const distance = calculateDistanceHaversine(currentCoords, spotCoords)

      if (distance < minDistance) {
        minDistance = distance
        nearest = spot
      }
    }

    if (nearest) {
      optimized.push(nearest)
      visited.add(nearest.id)
      current = nearest
    } else {
      // これ以上スポットがない場合は終了
      break
    }
  }

  return optimized
}
