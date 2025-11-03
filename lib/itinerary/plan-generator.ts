/**
 * プラン生成統合ロジック
 * 既存の最適化・ルート取得・時刻計算・日程配分ロジックを統合
 */

import { optimizeSpotOrder } from './optimizer'
import { getMultipleRoutes } from '@/lib/maps/directions'
import { calculateVisitTimes, type TimeSlot } from './time-calculator'
import { generateDayPlan } from './spot-allocator'
import type { PlaceResult } from '@/lib/maps/places'
import type { RouteInfo } from '@/lib/maps/directions'
import type { OptimizedSpot } from './types'

/**
 * プラン生成結果
 */
export interface GeneratedPlan {
  /** 最適化されたスポット順序 */
  optimizedSpots: PlaceResult[]
  /** スポット間のルート情報 */
  routeInfo: RouteInfo[]
  /** 各スポットの訪問時刻情報 */
  timeSlots: Map<string, TimeSlot>
  /** 日ごとに配分されたスポット */
  dayPlan: Map<number, OptimizedSpot[]>
}

/**
 * スポット配列からプランを生成
 *
 * 以下の処理を順次実行します：
 * 1. 訪問順序の最適化（最も西のスポットから開始し、最近傍法で順序決定）
 * 2. スポット間のルート取得（Directions APIで移動時間・距離・経路を取得）
 * 3. 訪問時刻の自動計算（スポットタイプに応じた滞在時間推定）
 * 4. 日ごとの配分（旅行日数に応じてスポットを均等分割）
 *
 * @param selectedSpots - 選択されたスポット配列（未最適化）
 * @param startDate - 旅行開始日
 * @param numberOfDays - 旅行日数
 * @returns 生成されたプラン（最適化されたスポット、ルート、時刻、日程）
 * @throws Directions API呼び出しに失敗した場合
 *
 * @example
 * ```typescript
 * const selectedSpots = [...] // ユーザーが選択したスポット
 * const startDate = new Date('2025-04-01')
 * const numberOfDays = 3
 *
 * const plan = await generatePlan(selectedSpots, startDate, numberOfDays)
 * console.log(`最適化後のスポット数: ${plan.optimizedSpots.length}`)
 * console.log(`ルート区間数: ${plan.routeInfo.length}`)
 * ```
 */
export async function generatePlan(
  selectedSpots: PlaceResult[],
  startDate: Date,
  numberOfDays: number
): Promise<GeneratedPlan> {
  console.log('[generatePlan] プラン生成を開始します')
  console.log(`[generatePlan] スポット数: ${selectedSpots.length}`)
  console.log(`[generatePlan] 開始日: ${startDate.toLocaleDateString('ja-JP')}`)
  console.log(`[generatePlan] 日数: ${numberOfDays}日`)

  // 1. 訪問順序の最適化 (issue#42)
  console.log('[generatePlan] Step 1: 訪問順序を最適化中...')
  const optimizedSpots = optimizeSpotOrder(
    selectedSpots.map((spot) => ({
      id: spot.placeId,
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
    }))
  )

  // PlaceResultの順序を最適化後の順序に合わせる
  const optimizedPlaceResults = optimizedSpots.map((spot) =>
    selectedSpots.find((s) => s.placeId === spot.id)!
  )

  console.log(
    `[generatePlan] 最適化完了: ${optimizedPlaceResults.map((s) => s.name).join(' → ')}`
  )

  // 2. スポット間のルート取得 (issue#43)
  console.log('[generatePlan] Step 2: スポット間のルートを取得中...')
  const locations = optimizedSpots.map((spot) => ({
    lat: spot.lat,
    lng: spot.lng,
  }))

  const routeInfo = await getMultipleRoutes(locations)
  console.log(`[generatePlan] ルート取得完了: ${routeInfo.length}区間`)

  // 3. 訪問時刻の計算 (issue#44)
  console.log('[generatePlan] Step 3: 訪問時刻を計算中...')
  const startTime = new Date(startDate)
  startTime.setHours(9, 0, 0, 0) // デフォルト: 09:00開始

  const travelDurations = routeInfo.map((route) => route.duration)

  const spotsWithTypes = optimizedSpots.map((spot) => {
    const original = selectedSpots.find((s) => s.placeId === spot.id)
    return {
      id: spot.id,
      types: original?.types,
    }
  })

  const timeSlots = calculateVisitTimes(startTime, spotsWithTypes, travelDurations)
  console.log(`[generatePlan] 時刻計算完了: ${timeSlots.size}スポット`)

  // 4. 日ごとの配分
  console.log('[generatePlan] Step 4: 日ごとのスポット配分中...')
  const dayPlan = generateDayPlan(optimizedSpots, numberOfDays)
  console.log(`[generatePlan] 日程配分完了: ${dayPlan.size}日分`)

  // 各日の詳細をログ出力
  dayPlan.forEach((spots, day) => {
    console.log(`[generatePlan]   ${day}日目: ${spots.length}スポット`)
  })

  console.log('[generatePlan] プラン生成が完了しました✅')

  return {
    optimizedSpots: optimizedPlaceResults,
    routeInfo,
    timeSlots,
    dayPlan,
  }
}
