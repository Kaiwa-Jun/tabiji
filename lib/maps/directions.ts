/**
 * Google Directions API ラッパー
 * スポット間の移動時間とルート情報を取得
 */

import { initGoogleMaps } from './loader'

/**
 * Directions APIから取得したルート情報
 */
export interface RouteInfo {
  /** 距離（メートル） */
  distance: number
  /** 所要時間（秒） */
  duration: number
  /** 出発地の住所 */
  startAddress: string
  /** 目的地の住所 */
  endAddress: string
  /** エンコードされたポリライン（地図上にルートを描画する際に使用） */
  polyline?: string
}

/**
 * 2地点間のルート情報を取得
 *
 * @param origin - 出発地の座標
 * @param destination - 目的地の座標
 * @param mode - 移動手段（デフォルト: 徒歩）
 * @returns ルート情報（ルートが見つからない場合はnull）
 *
 * @example
 * ```typescript
 * const route = await getDirections(
 *   { lat: 35.6586, lng: 139.7454 }, // 東京タワー
 *   { lat: 35.6585, lng: 139.7471 }, // 増上寺
 *   google.maps.TravelMode.WALKING
 * )
 *
 * if (route) {
 *   console.log(`距離: ${route.distance}m`)
 *   console.log(`所要時間: ${formatDuration(route.duration)}`)
 * }
 * ```
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode?: google.maps.TravelMode
): Promise<RouteInfo | null> {
  const google = await initGoogleMaps()
  const service = new google.maps.DirectionsService()

  // デフォルトは徒歩モード
  const travelMode = mode ?? google.maps.TravelMode.WALKING

  return new Promise((resolve) => {
    service.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: travelMode,
        language: 'ja',
        region: 'jp',
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0]
          const leg = route.legs[0]

          resolve({
            distance: leg.distance?.value || 0,
            duration: leg.duration?.value || 0,
            startAddress: leg.start_address || '',
            endAddress: leg.end_address || '',
            polyline: route.overview_polyline || '',
          })
        } else {
          console.error(`[getDirections] Directions request failed: ${status}`)
          resolve(null)
        }
      }
    )
  })
}

/**
 * 複数地点の経路を一括取得
 * スポットの配列を順番に巡るルートを取得する
 *
 * @param locations - スポット座標の配列
 * @param mode - 移動手段（デフォルト: 徒歩）
 * @returns スポット間のルート情報配列（ルートが見つからない区間はスキップ）
 *
 * @example
 * ```typescript
 * const locations = [
 *   { lat: 35.6812, lng: 139.7671 }, // 東京駅
 *   { lat: 35.6586, lng: 139.7454 }, // 東京タワー
 *   { lat: 35.7101, lng: 139.8107 }, // スカイツリー
 * ]
 *
 * const routes = await getMultipleRoutes(locations)
 * console.log(`全${routes.length}区間のルートを取得`)
 * ```
 */
export async function getMultipleRoutes(
  locations: Array<{ lat: number; lng: number }>,
  mode?: google.maps.TravelMode
): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = []

  for (let i = 0; i < locations.length - 1; i++) {
    const route = await getDirections(locations[i], locations[i + 1], mode)
    if (route) {
      routes.push(route)
    }
  }

  return routes
}

/**
 * 移動時間の合計を計算
 *
 * @param routes - ルート情報配列
 * @returns 合計移動時間（秒）
 *
 * @example
 * ```typescript
 * const routes = await getMultipleRoutes(locations)
 * const total = calculateTotalDuration(routes)
 * console.log(`合計移動時間: ${formatDuration(total)}`)
 * ```
 */
export function calculateTotalDuration(routes: RouteInfo[]): number {
  return routes.reduce((total, route) => total + route.duration, 0)
}

/**
 * 秒を「◯時間◯分」形式に変換
 *
 * @param seconds - 秒数
 * @returns フォーマット済み文字列
 *
 * @example
 * ```typescript
 * formatDuration(900)   // "15分"
 * formatDuration(3600)  // "1時間0分"
 * formatDuration(7380)  // "2時間3分"
 * ```
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}時間${minutes}分`
  } else {
    return `${minutes}分`
  }
}
