/**
 * 旅程最適化ロジック - 日ごとのスポット配分
 */

import type { Spot, OptimizedSpot } from './types'

// 型を再エクスポート
export type { Spot, OptimizedSpot } from './types'

/**
 * スポットを日ごとに配分
 *
 * @param spots - 最適化されたスポット配列
 * @param numberOfDays - 旅行日数
 * @returns 日ごとに配分されたスポット
 *
 * @example
 * ```typescript
 * const spots = [
 *   { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
 *   { id: '2', name: 'スポット2', lat: 35.6895, lng: 139.6917 },
 *   // ... 全6スポット
 * ]
 *
 * const allocated = allocateSpotsByDay(spots, 2)
 * // 1日目: 3スポット、2日目: 3スポット
 * ```
 */
export function allocateSpotsByDay(
  spots: Spot[],
  numberOfDays: number
): OptimizedSpot[] {
  // エッジケース: 空配列または日数が0の場合
  if (spots.length === 0 || numberOfDays === 0) return []

  // 1日あたりの基本スポット数
  const spotsPerDay = Math.floor(spots.length / numberOfDays)
  // 余りのスポット数（最初の数日に1つずつ追加）
  const remainder = spots.length % numberOfDays

  const allocated: OptimizedSpot[] = []
  let currentIndex = 0

  for (let day = 1; day <= numberOfDays; day++) {
    // この日のスポット数（余りがあれば1つ追加）
    const spotsForThisDay = spotsPerDay + (day <= remainder ? 1 : 0)

    for (let i = 0; i < spotsForThisDay; i++) {
      if (currentIndex >= spots.length) break

      allocated.push({
        ...spots[currentIndex],
        dayNumber: day,
        orderIndex: i + 1, // 1-indexed
      })

      currentIndex++
    }
  }

  return allocated
}

/**
 * 日ごとのスポット配分マップを生成
 *
 * @param spots - 選択されたスポット
 * @param numberOfDays - 旅行日数
 * @returns 日ごとに配分されたスポットのMap
 *
 * @example
 * ```typescript
 * const spots = [
 *   { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
 *   // ... 全6スポット
 * ]
 *
 * const dayPlan = generateDayPlan(spots, 2)
 * // Map {
 * //   1 => [{ id: '1', ... dayNumber: 1, orderIndex: 1 }, ...],
 * //   2 => [{ id: '4', ... dayNumber: 2, orderIndex: 1 }, ...]
 * // }
 * ```
 */
export function generateDayPlan(
  spots: Spot[],
  numberOfDays: number
): Map<number, OptimizedSpot[]> {
  const allocated = allocateSpotsByDay(spots, numberOfDays)

  const dayPlan = new Map<number, OptimizedSpot[]>()

  for (const spot of allocated) {
    const daySpots = dayPlan.get(spot.dayNumber) || []
    daySpots.push(spot)
    dayPlan.set(spot.dayNumber, daySpots)
  }

  return dayPlan
}
