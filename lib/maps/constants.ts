/**
 * Google Maps関連の定数定義
 */

/**
 * 座標の型定義
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * 日本の中心座標（長野県付近）
 * 日本全体を表示する際の初期座標
 */
export const JAPAN_CENTER: Coordinates = {
  lat: 36.2048,
  lng: 138.2529,
}

/**
 * ズームレベル定数
 * Google Mapsのズームレベルは1（世界全体）～20（建物レベル）
 */

/**
 * 日本全体が見えるズームレベル
 * 北海道から沖縄まで表示
 */
export const JAPAN_ZOOM = 5

/**
 * 都道府県レベルのズーム
 * 1つの都道府県が見える程度
 */
export const PREFECTURE_ZOOM = 10

/**
 * 市区町村レベルのズーム
 * 市区町村の詳細が見える程度
 */
export const CITY_ZOOM = 13

/**
 * スポット詳細レベルのズーム
 * 個別のスポットや建物が見える程度
 */
export const SPOT_ZOOM = 15

/**
 * デフォルトのズームレベル
 * 特に指定がない場合に使用
 */
export const DEFAULT_ZOOM = 12
