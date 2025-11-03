/**
 * プラン生成統合ロジック - エンドポイント対応版
 * スタート/ゴール地点・宿泊先を考慮したプラン生成
 */

import { optimizeSpotOrderWithGoal } from './optimizer-with-goal'
import { getMultipleRoutes } from '@/lib/maps/directions'
import { calculateVisitTimes } from './time-calculator'
import type { PlaceResult } from '@/lib/maps/places'
import type { TripEndpoints, DayItinerary } from '@/types/models'

/**
 * エンドポイント対応プラン生成結果
 */
export interface GeneratedPlanWithEndpoints {
  /** 日ごとの旅程 */
  dayItineraries: DayItinerary[]
  /** 総移動距離（km） */
  totalDistance: number
}

/**
 * スタート/ゴール地点・宿泊先を考慮したプラン生成
 *
 * @param selectedSpots - ユーザーが選択したスポット配列
 * @param startDate - 旅行開始日
 * @param numberOfDays - 旅行日数
 * @param endpoints - スタート/ゴール地点・宿泊先情報
 * @returns 生成されたプラン（日ごとの旅程）
 *
 * @example
 * ```typescript
 * // 2泊3日の旅行
 * const endpoints: TripEndpoints = {
 *   tripStart: { placeId: 's', name: '東京駅', lat: 35.6812, lng: 139.7671, ... },
 *   tripEnd: { placeId: 'e', name: '東京駅', lat: 35.6812, lng: 139.7671, ... },
 *   accommodations: [
 *     { placeId: 'h1', name: 'ホテルA', lat: 35.6895, lng: 139.6917, ... },
 *     { placeId: 'h2', name: 'ホテルB', lat: 35.7148, lng: 139.7967, ... },
 *   ],
 * }
 *
 * const plan = await generatePlanWithEndpoints(
 *   selectedSpots,
 *   new Date('2025-04-01'),
 *   3,
 *   endpoints
 * )
 * ```
 */
export async function generatePlanWithEndpoints(
  selectedSpots: PlaceResult[],
  startDate: Date,
  numberOfDays: number,
  endpoints: TripEndpoints
): Promise<GeneratedPlanWithEndpoints> {
  console.log('[generatePlanWithEndpoints] プラン生成を開始します')
  console.log(`[generatePlanWithEndpoints] スポット数: ${selectedSpots.length}`)
  console.log(`[generatePlanWithEndpoints] 日数: ${numberOfDays}日`)

  // 1. スポットを日ごとに配分
  const spotsPerDay = allocateSpotsByDayMap(selectedSpots, numberOfDays)

  console.log('[generatePlanWithEndpoints] スポット配分:')
  spotsPerDay.forEach((spots, day) => {
    console.log(`  ${day}日目: ${spots.length}スポット`)
  })

  // 2. 各日の旅程を最適化
  const dayItineraries: DayItinerary[] = []

  for (let day = 1; day <= numberOfDays; day++) {
    console.log(`[generatePlanWithEndpoints] ${day}日目を最適化中...`)

    const daySpots = spotsPerDay.get(day) || []

    // スタート地点の決定
    let startPoint: PlaceResult
    if (day === 1) {
      // 1日目: 旅行全体のスタート地点（駅・空港）
      if (!endpoints.tripStart) {
        throw new Error('1日目のスタート地点が設定されていません')
      }
      startPoint = endpoints.tripStart
    } else {
      // 2日目以降: 前日の宿泊先
      const accommodationIndex = day - 2
      if (accommodationIndex >= endpoints.accommodations.length) {
        throw new Error(`${day}日目のスタート地点（前日の宿泊先）が設定されていません`)
      }
      startPoint = endpoints.accommodations[accommodationIndex]
    }

    // ゴール地点の決定
    let endPoint: PlaceResult
    if (day === numberOfDays) {
      // 最終日: 旅行全体のゴール地点（駅・空港）
      if (!endpoints.tripEnd) {
        throw new Error('最終日のゴール地点が設定されていません')
      }
      endPoint = endpoints.tripEnd
    } else {
      // それ以外: この日の宿泊先
      const accommodationIndex = day - 1
      if (accommodationIndex >= endpoints.accommodations.length) {
        throw new Error(`${day}日目のゴール地点（宿泊先）が設定されていません`)
      }
      endPoint = endpoints.accommodations[accommodationIndex]
    }

    console.log(`[generatePlanWithEndpoints]   スタート: ${startPoint.name}`)
    console.log(`[generatePlanWithEndpoints]   ゴール: ${endPoint.name}`)
    console.log(`[generatePlanWithEndpoints]   訪問スポット: ${daySpots.length}箇所`)

    // スポットが0個の場合（移動のみの日）
    if (daySpots.length === 0) {
      console.log('[generatePlanWithEndpoints]   この日は移動のみです')

      // スタート→ゴールの直接ルート
      const locations = [
        { lat: startPoint.lat, lng: startPoint.lng },
        { lat: endPoint.lat, lng: endPoint.lng },
      ]
      const routeInfo = await getMultipleRoutes(locations)

      // 訪問時刻の計算
      const dayStartTime = new Date(startDate)
      dayStartTime.setDate(startDate.getDate() + (day - 1))
      dayStartTime.setHours(9, 0, 0, 0) // 09:00開始

      const spotsWithTypes = [
        { id: startPoint.placeId, types: startPoint.types || [] },
        { id: endPoint.placeId, types: endPoint.types || [] },
      ]

      const timeSlots = calculateVisitTimes(
        dayStartTime,
        spotsWithTypes,
        routeInfo.map((r) => r.duration)
      )

      dayItineraries.push({
        dayNumber: day,
        startPoint,
        spots: [],
        endPoint,
        optimizedRoute: [startPoint, endPoint],
        routeInfo,
        timeSlots,
      })

      continue
    }

    // 3. この日のスポットを最適化（スタート/ゴール考慮）
    const optimizationResult = optimizeSpotOrderWithGoal(
      daySpots.map((spot) => ({
        id: spot.placeId,
        name: spot.name,
        lat: spot.lat,
        lng: spot.lng,
      })),
      {
        id: startPoint.placeId,
        name: startPoint.name,
        lat: startPoint.lat,
        lng: startPoint.lng,
      },
      {
        id: endPoint.placeId,
        name: endPoint.name,
        lat: endPoint.lat,
        lng: endPoint.lng,
      },
      { goalWeight: 0.3, debug: false }
    )

    console.log(
      `[generatePlanWithEndpoints]   最適化完了: ${optimizationResult.totalDistance.toFixed(1)}km`
    )

    // PlaceResultの順序を最適化後の順序に合わせる
    const optimizedPlaceResults = optimizationResult.optimizedSpots.map(
      (spot) => selectedSpots.find((s) => s.placeId === spot.id)!
    )

    // 4. 完全なルート（スタート → スポット群 → ゴール）を作成
    const fullRoute = [startPoint, ...optimizedPlaceResults, endPoint]

    console.log(
      `[generatePlanWithEndpoints]   ルート: ${fullRoute.map((s) => s.name).join(' → ')}`
    )

    // 5. ルート情報を取得（Directions API）
    const locations = fullRoute.map((s) => ({ lat: s.lat, lng: s.lng }))
    const routeInfo = await getMultipleRoutes(locations)

    console.log(`[generatePlanWithEndpoints]   ルート取得完了: ${routeInfo.length}区間`)

    // 6. 訪問時刻を計算
    const dayStartTime = new Date(startDate)
    dayStartTime.setDate(startDate.getDate() + (day - 1))
    dayStartTime.setHours(9, 0, 0, 0) // 09:00開始

    const spotsWithTypes = fullRoute.map((spot) => ({
      id: spot.placeId,
      types: spot.types || [],
    }))

    const timeSlots = calculateVisitTimes(
      dayStartTime,
      spotsWithTypes,
      routeInfo.map((r) => r.duration)
    )

    console.log(`[generatePlanWithEndpoints]   時刻計算完了: ${timeSlots.size}地点`)

    // 7. この日の旅程を追加
    dayItineraries.push({
      dayNumber: day,
      startPoint,
      spots: optimizedPlaceResults,
      endPoint,
      optimizedRoute: fullRoute,
      routeInfo,
      timeSlots,
    })
  }

  console.log('[generatePlanWithEndpoints] プラン生成が完了しました✅')

  // 総移動距離を計算
  const totalDistance = dayItineraries.reduce((sum, day) => {
    const dayDistance = (day.routeInfo || []).reduce((s, r) => s + r.distance, 0)
    return sum + dayDistance
  }, 0)

  console.log(`[generatePlanWithEndpoints] 総移動距離: ${totalDistance.toFixed(1)}km`)

  return {
    dayItineraries,
    totalDistance,
  }
}

/**
 * スポットを日ごとに配分（Map版）
 *
 * @param spots - 選択されたスポット
 * @param numberOfDays - 旅行日数
 * @returns 日ごとに配分されたスポットのMap
 */
function allocateSpotsByDayMap(
  spots: PlaceResult[],
  numberOfDays: number
): Map<number, PlaceResult[]> {
  const map = new Map<number, PlaceResult[]>()

  if (spots.length === 0 || numberOfDays === 0) {
    return map
  }

  // 1日あたりの基本スポット数
  const spotsPerDay = Math.floor(spots.length / numberOfDays)
  // 余りのスポット数（最初の数日に1つずつ追加）
  const remainder = spots.length % numberOfDays

  let currentIndex = 0

  for (let day = 1; day <= numberOfDays; day++) {
    // この日のスポット数（余りがあれば1つ追加）
    const spotsForThisDay = spotsPerDay + (day <= remainder ? 1 : 0)
    const daySpots: PlaceResult[] = []

    for (let i = 0; i < spotsForThisDay; i++) {
      if (currentIndex >= spots.length) break
      daySpots.push(spots[currentIndex])
      currentIndex++
    }

    map.set(day, daySpots)
  }

  return map
}
