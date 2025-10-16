/**
 * 旅程最適化ロジック
 *
 * このモジュールは、旅行スポットの訪問順序を最適化し、
 * 日ごとにスポットを配分する機能を提供します。
 *
 * @module itinerary
 *
 * @example
 * ```typescript
 * import { optimizeSpotOrder, allocateSpotsByDay } from '@/lib/itinerary'
 *
 * // 1. スポットの訪問順序を最適化（貪欲法・最近傍法）
 * const spots = [
 *   { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
 *   { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
 *   { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
 * ]
 * const optimized = optimizeSpotOrder(spots)
 *
 * // 2. 最適化されたスポットを日ごとに配分
 * const allocated = allocateSpotsByDay(optimized, 2)
 * // 1日目: 2スポット、2日目: 1スポット
 * ```
 */

// 型定義
export type { Spot, OptimizedSpot } from './types'

// 訪問順序最適化
export { optimizeSpotOrder } from './optimizer'

// 日ごとのスポット配分
export { allocateSpotsByDay, generateDayPlan } from './spot-allocator'
