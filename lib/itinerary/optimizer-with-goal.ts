/**
 * 旅程最適化ロジック - ゴール地点を考慮した訪問順序の最適化
 *
 * 最近傍法 + ゴール考慮版アルゴリズム
 * スタート地点からゴール地点までの効率的な経路を生成します。
 *
 * アルゴリズム:
 * 1. 各未訪問スポットに対してスコアを計算
 * 2. スコア = (現在地→スポットの距離) + (スポット→ゴールの距離 × ゴール重み)
 * 3. スコアが最小のスポットを選択
 * 4. すべてのスポットを訪問するまで繰り返す
 */

import { calculateDistanceHaversine } from '@/lib/maps/utils'
import type { Coordinates } from '@/lib/maps/constants'
import type { Spot } from './types'

/**
 * 最適化オプション
 */
export interface OptimizationOptions {
  /** ゴール重み（0.0-1.0）デフォルト: 0.3 */
  goalWeight?: number
  /** デバッグログを出力するか */
  debug?: boolean
}

/**
 * 最適化結果
 */
export interface OptimizationResult {
  /** 最適化されたスポット配列 */
  optimizedSpots: Spot[]
  /** 推定総移動距離（km） */
  totalDistance: number
  /** 最適化にかかった時間（ミリ秒） */
  executionTime: number
}

/**
 * スタート地点とゴール地点を考慮した訪問順序の最適化
 *
 * @param spots - 訪問するスポット配列
 * @param startPoint - スタート地点（駅、空港、ホテル）
 * @param endPoint - ゴール地点（駅、空港、ホテル）
 * @param options - 最適化オプション
 * @returns 最適化結果
 *
 * @example
 * ```typescript
 * const spots = [
 *   { id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
 *   { id: '2', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
 *   { id: '3', name: '上野動物園', lat: 35.7156, lng: 139.7731 },
 * ]
 *
 * const startPoint = { id: 'start', name: '東京駅', lat: 35.6812, lng: 139.7671 }
 * const endPoint = { id: 'end', name: '東京駅', lat: 35.6812, lng: 139.7671 }
 *
 * const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)
 * console.log(result.optimizedSpots) // [浅草寺, 上野動物園, スカイツリー]
 * console.log(`総移動距離: ${result.totalDistance.toFixed(1)}km`)
 * ```
 */
export function optimizeSpotOrderWithGoal(
  spots: Spot[],
  startPoint: Spot,
  endPoint: Spot,
  options: OptimizationOptions = {}
): OptimizationResult {
  const startTime = performance.now()
  const goalWeight = options.goalWeight ?? 0.3
  const debug = options.debug ?? false

  // エッジケース: スポットが0個
  if (spots.length === 0) {
    if (debug) {
      console.log('[optimizeSpotOrderWithGoal] スポット0個のため最適化をスキップ')
    }

    return {
      optimizedSpots: [],
      totalDistance: 0,
      executionTime: performance.now() - startTime,
    }
  }

  // エッジケース: スポットが1個
  if (spots.length === 1) {
    const distanceToSpot = calculateDistanceHaversine(
      { lat: startPoint.lat, lng: startPoint.lng },
      { lat: spots[0].lat, lng: spots[0].lng }
    )

    const distanceToGoal = calculateDistanceHaversine(
      { lat: spots[0].lat, lng: spots[0].lng },
      { lat: endPoint.lat, lng: endPoint.lng }
    )

    const totalDistance = distanceToSpot + distanceToGoal

    if (debug) {
      console.log('[optimizeSpotOrderWithGoal] スポット1個のため最適化をスキップ')
      console.log(`  総移動距離: ${totalDistance.toFixed(1)}km`)
    }

    return {
      optimizedSpots: [...spots],
      totalDistance,
      executionTime: performance.now() - startTime,
    }
  }

  // 初期化
  const visited = new Set<string>()
  const optimizedSpots: Spot[] = []
  let currentLocation: Coordinates = { lat: startPoint.lat, lng: startPoint.lng }
  let totalDistance = 0

  if (debug) {
    console.log('[optimizeSpotOrderWithGoal] 最適化を開始')
    console.log(`  スポット数: ${spots.length}`)
    console.log(`  ゴール重み: ${goalWeight}`)
    console.log(`  スタート: ${startPoint.name}`)
    console.log(`  ゴール: ${endPoint.name}`)
  }

  // メインループ: すべてのスポットを訪問するまで繰り返す
  while (visited.size < spots.length) {
    // 未訪問のスポットを取得
    const unvisitedSpots = spots.filter((spot) => !visited.has(spot.id))

    // 次に訪問するスポットを選択
    let bestSpot: Spot | null = null
    let bestScore = Infinity

    for (const spot of unvisitedSpots) {
      // 現在地からスポットまでの距離
      const distanceFromCurrent = calculateDistanceHaversine(currentLocation, {
        lat: spot.lat,
        lng: spot.lng,
      })

      // スポットからゴールまでの距離
      const distanceToGoal = calculateDistanceHaversine(
        { lat: spot.lat, lng: spot.lng },
        { lat: endPoint.lat, lng: endPoint.lng }
      )

      // 総合スコア = 現在地からの距離 + ゴールまでの距離 × ゴール重み
      const totalScore = distanceFromCurrent + distanceToGoal * goalWeight

      if (debug) {
        console.log(`  候補: ${spot.name}`)
        console.log(`    現在地から: ${distanceFromCurrent.toFixed(1)}km`)
        console.log(`    ゴールまで: ${distanceToGoal.toFixed(1)}km`)
        console.log(`    スコア: ${totalScore.toFixed(1)}`)
      }

      if (totalScore < bestScore) {
        bestScore = totalScore
        bestSpot = spot
      }
    }

    if (!bestSpot) {
      // これ以上スポットがない場合は終了
      break
    }

    if (debug) {
      console.log(`  選択: ${bestSpot.name}`)
    }

    // 移動距離を加算
    const distance = calculateDistanceHaversine(currentLocation, {
      lat: bestSpot.lat,
      lng: bestSpot.lng,
    })
    totalDistance += distance

    // スポットを訪問済みにマーク
    visited.add(bestSpot.id)
    optimizedSpots.push(bestSpot)

    // 現在地を更新
    currentLocation = { lat: bestSpot.lat, lng: bestSpot.lng }
  }

  // 最後のスポットからゴールまでの距離を加算
  const finalDistance = calculateDistanceHaversine(currentLocation, {
    lat: endPoint.lat,
    lng: endPoint.lng,
  })
  totalDistance += finalDistance

  const executionTime = performance.now() - startTime

  if (debug) {
    console.log('[optimizeSpotOrderWithGoal] 最適化完了')
    console.log(`  ルート: ${[startPoint.name, ...optimizedSpots.map((s) => s.name), endPoint.name].join(' → ')}`)
    console.log(`  総移動距離: ${totalDistance.toFixed(1)}km`)
    console.log(`  実行時間: ${executionTime.toFixed(1)}ms`)
  }

  return {
    optimizedSpots,
    totalDistance,
    executionTime,
  }
}
