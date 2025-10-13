/**
 * Google Maps操作のユーティリティ関数
 */

import type { Coordinates } from './constants'

/**
 * 地図を指定された座標に移動する
 * スムーズなパン（移動）アニメーションで移動
 *
 * @param map - Google Mapインスタンス
 * @param lat - 目的地の緯度
 * @param lng - 目的地の経度
 * @param zoom - オプション: 移動後のズームレベル
 *
 * @example
 * ```typescript
 * panToLocation(map, 35.6812, 139.7671, 15) // 東京駅にズーム15で移動
 * ```
 */
export function panToLocation(
  map: google.maps.Map,
  lat: number,
  lng: number,
  zoom?: number
): void {
  map.panTo({ lat, lng })
  if (zoom !== undefined) {
    map.setZoom(zoom)
  }
}

/**
 * 複数の地点が全て表示されるように地図の表示範囲を調整する
 * マーカーやスポットのリストを表示する際に便利
 *
 * @param map - Google Mapインスタンス
 * @param locations - 表示したい座標の配列
 * @param padding - オプション: 境界からの余白（ピクセル、デフォルト: 50）
 *
 * @example
 * ```typescript
 * const spots = [
 *   { lat: 35.6812, lng: 139.7671 }, // 東京駅
 *   { lat: 35.6586, lng: 139.7454 }, // 東京タワー
 * ]
 * fitBounds(map, spots)
 * ```
 */
export function fitBounds(
  map: google.maps.Map,
  locations: Coordinates[],
  padding: number = 50
): void {
  if (locations.length === 0) {
    throw new Error('[fitBounds] No locations provided')
  }

  // 1つの地点のみの場合は、その地点にパンする
  if (locations.length === 1) {
    map.panTo(locations[0])
    return
  }

  // 複数地点の場合、全てを含む境界を計算
  const bounds = new google.maps.LatLngBounds()
  locations.forEach((loc) => {
    bounds.extend(new google.maps.LatLng(loc.lat, loc.lng))
  })

  // 境界に合わせて表示（パディング付き）
  map.fitBounds(bounds, padding)
}

/**
 * 2つの座標間の距離を計算する（メートル単位）
 * Haversine公式を使用した球面上の距離計算
 *
 * @param from - 始点座標
 * @param to - 終点座標
 * @returns 距離（メートル）
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(
 *   { lat: 35.6812, lng: 139.7671 }, // 東京駅
 *   { lat: 35.6586, lng: 139.7454 }  // 東京タワー
 * )
 * console.log(`距離: ${Math.round(distance)}m`) // 距離: 2900m
 * ```
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const fromLatLng = new google.maps.LatLng(from.lat, from.lng)
  const toLatLng = new google.maps.LatLng(to.lat, to.lng)

  // Geometry APIを使用して距離を計算
  return google.maps.geometry.spherical.computeDistanceBetween(
    fromLatLng,
    toLatLng
  )
}

/**
 * 地図の中心座標を取得する
 *
 * @param map - Google Mapインスタンス
 * @returns 現在の中心座標
 *
 * @example
 * ```typescript
 * const center = getMapCenter(map)
 * console.log(`中心: ${center.lat}, ${center.lng}`)
 * ```
 */
export function getMapCenter(map: google.maps.Map): Coordinates {
  const center = map.getCenter()
  if (!center) {
    throw new Error('Failed to get map center')
  }
  return {
    lat: center.lat(),
    lng: center.lng(),
  }
}

/**
 * 地図の現在のズームレベルを取得する
 *
 * @param map - Google Mapインスタンス
 * @returns 現在のズームレベル
 *
 * @example
 * ```typescript
 * const zoom = getMapZoom(map)
 * console.log(`ズーム: ${zoom}`)
 * ```
 */
export function getMapZoom(map: google.maps.Map): number {
  const zoom = map.getZoom()
  if (zoom === undefined) {
    throw new Error('Failed to get map zoom')
  }
  return zoom
}
