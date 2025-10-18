/**
 * Google Maps Polyline Decoder
 * Google Directions APIから返されるエンコードされたポリライン文字列を
 * 座標配列にデコードします
 */

/**
 * Google Maps Polyline Algorithmでエンコードされた文字列をデコード
 *
 * エンコード形式:
 * - 座標の差分値を5ビットずつエンコード
 * - 各5ビット値に63を加えてASCII文字に変換
 * - 値が20以上の場合は継続ビットを立てる
 *
 * @param encoded - エンコードされたポリライン文字列
 * @returns デコードされた座標配列
 *
 * @example
 * ```typescript
 * const polyline = "u~vFvyys@fCsCnGgGfCsC"
 * const coordinates = decodePolyline(polyline)
 * // coordinates = [
 * //   { lat: 38.5, lng: -120.2 },
 * //   { lat: 40.7, lng: -120.95 },
 * //   { lat: 43.252, lng: -126.453 }
 * // ]
 * ```
 */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    // 緯度の差分値をデコード
    let shift = 0
    let result = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    // 経度の差分値をデコード
    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    // スケールを復元（1e5で割る）して座標に変換
    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    })
  }

  return points
}

/**
 * デコードした座標をGoogle Maps LatLng配列に変換
 *
 * @param encoded - エンコードされたポリライン文字列
 * @returns Google Maps LatLng配列
 *
 * @example
 * ```typescript
 * const polyline = "u~vFvyys@fCsCnGgGfCsC"
 * const latLngs = decodePolylineToLatLngs(polyline)
 * // Google Mapsで使用可能なLatLng配列
 * ```
 */
export function decodePolylineToLatLngs(encoded: string): google.maps.LatLng[] {
  const points = decodePolyline(encoded)
  return points.map((point) => new google.maps.LatLng(point.lat, point.lng))
}
