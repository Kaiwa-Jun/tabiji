/**
 * Google Maps JavaScript API ローダー
 * Client Componentでのみ使用可能
 */

import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

// シングルトン: 初期化済みフラグ
let isInitialized = false
let googleMapsPromise: Promise<typeof google> | null = null

/**
 * Google Maps APIを初期化する
 * 複数回呼び出しても重複読み込みは発生しない（同じPromiseを返す）
 *
 * @returns Google Maps API オブジェクト
 * @throws APIキーが未設定の場合
 *
 * @example
 * ```typescript
 * const google = await initGoogleMaps()
 * const map = new google.maps.Map(element, options)
 * ```
 */
export function initGoogleMaps(): Promise<typeof google> {
  // 既に読み込み中または完了している場合は同じPromiseを返す
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  // APIキーの確認
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error(
      'Google Maps API key is not defined. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local'
    )
  }

  // API設定（1回のみ）
  if (!isInitialized) {
    setOptions({
      key: apiKey,
      v: 'weekly', // 最新機能を使用（本番環境では'quarterly'を推奨）
      language: 'ja', // 日本語
      region: 'JP', // 日本
    })
    isInitialized = true
  }

  // Maps APIを読み込み（Promiseをキャッシュ）
  // 必要なライブラリを読み込む
  googleMapsPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('geometry'),
    importLibrary('marker'), // Advanced Markers API
  ]).then(() => {
    // グローバルのgoogleオブジェクトを返す
    return google
  })

  return googleMapsPromise
}

/**
 * Google Mapsが読み込み済みかチェックする
 *
 * @returns 読み込み済みの場合true
 *
 * @example
 * ```typescript
 * if (isGoogleMapsLoaded()) {
 *   // Google Maps APIを使用
 * }
 * ```
 */
export function isGoogleMapsLoaded(): boolean {
  try {
    return typeof google !== 'undefined' && typeof google.maps !== 'undefined'
  } catch {
    return false
  }
}

/**
 * エラーハンドリング付きでGoogle Maps APIを読み込む
 * エラーが発生した場合はnullを返す
 *
 * @returns Google Maps APIオブジェクト、またはエラー時null
 *
 * @example
 * ```typescript
 * const google = await loadGoogleMapsSafely()
 * if (!google) {
 *   return <ErrorMessage message="地図の読み込みに失敗しました" />
 * }
 * ```
 */
export async function loadGoogleMapsSafely(): Promise<typeof google | null> {
  try {
    const google = await initGoogleMaps()
    return google
  } catch (error) {
    console.error('[Google Maps] Failed to load Google Maps:', error)
    return null
  }
}

/**
 * ローダーの状態をリセットする（テスト用）
 * @internal
 */
export function resetGoogleMapsLoader(): void {
  isInitialized = false
  googleMapsPromise = null
}
