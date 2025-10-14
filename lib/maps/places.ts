/**
 * Google Places API ラッパー
 * スポット検索とスポット詳細取得機能を提供
 */

import { initGoogleMaps } from './loader'

/**
 * Places APIから取得したスポット情報
 * アプリ内部のSpot型への変換に使用
 */
export interface PlaceResult {
  /** Google Places ID（一意識別子） */
  placeId: string
  /** スポット名 */
  name: string
  /** 住所（formatted_address） */
  address: string
  /** 緯度 */
  lat: number
  /** 経度 */
  lng: number
  /** 写真URL（オプション） */
  photoUrl?: string
  /** 評価（1.0-5.0、オプション） */
  rating?: number
  /** スポットタイプ（例: tourist_attraction, museum） */
  types?: string[]
}

/**
 * Places API検索のオプション
 */
export interface SearchOptions {
  /** スポットタイプでフィルタリング（例: 'tourist_attraction', 'museum'） */
  type?: string
  /** 取得する最大件数（デフォルト: 20） */
  limit?: number
}

/**
 * エリア名から観光スポットを検索する
 * Google Places API の Text Search を使用
 *
 * @param area - 検索対象のエリア名（例: "東京都", "京都府"）
 * @param options - 検索オプション（タイプ指定、件数制限）
 * @returns 検索結果のスポット配列
 * @throws Places API呼び出しに失敗した場合
 *
 * @example
 * ```typescript
 * // 東京都の観光地を20件取得
 * const spots = await searchPlacesByArea('東京都')
 *
 * // 京都府の美術館を10件取得
 * const museums = await searchPlacesByArea('京都府', {
 *   type: 'museum',
 *   limit: 10
 * })
 * ```
 */
export async function searchPlacesByArea(
  area: string,
  options?: SearchOptions
): Promise<PlaceResult[]> {
  const google = await initGoogleMaps()

  // PlacesServiceは実際のDOM要素が必要（非表示でOK）
  const service = new google.maps.places.PlacesService(document.createElement('div'))

  return new Promise((resolve, reject) => {
    const request: google.maps.places.TextSearchRequest = {
      query: `${area} 観光地`,
      type: options?.type,
      language: 'ja',
      region: 'jp',
    }

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places = results
          .slice(0, options?.limit || 20)
          .map((place) => ({
            placeId: place.place_id!,
            name: place.name!,
            address: place.formatted_address || '',
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
            rating: place.rating,
            types: place.types,
          }))

        console.log(`[searchPlacesByArea] Found ${places.length} places in ${area}`)
        resolve(places)
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        // 検索結果が0件の場合は空配列を返す（エラーではない）
        console.log(`[searchPlacesByArea] No results found for ${area}`)
        resolve([])
      } else {
        const error = new Error(`Places search failed: ${status}`)
        console.error('[searchPlacesByArea] Error:', error)
        reject(error)
      }
    })
  })
}

/**
 * Google Places IDからスポットの詳細情報を取得する
 * Google Places API の Place Details を使用
 *
 * @param placeId - Google Places ID
 * @returns スポット詳細情報（見つからない場合はnull）
 * @throws Places API呼び出しに失敗した場合
 *
 * @example
 * ```typescript
 * const detail = await getPlaceDetails('ChIJN1t_tDeuEmsRUsoyG83frY4')
 * if (detail) {
 *   console.log(`${detail.name}: ${detail.rating}⭐`)
 * }
 * ```
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const google = await initGoogleMaps()
  const service = new google.maps.places.PlacesService(document.createElement('div'))

  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'photos',
          'rating',
          'types',
          'place_id',
        ],
        language: 'ja',
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const result: PlaceResult = {
            placeId: place.place_id!,
            name: place.name!,
            address: place.formatted_address || '',
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
            rating: place.rating,
            types: place.types,
          }

          console.log(`[getPlaceDetails] Retrieved details for ${result.name}`)
          resolve(result)
        } else if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
          // スポットが見つからない場合はnullを返す（エラーではない）
          console.log(`[getPlaceDetails] Place not found: ${placeId}`)
          resolve(null)
        } else {
          const error = new Error(`Place details fetch failed: ${status}`)
          console.error('[getPlaceDetails] Error:', error)
          reject(error)
        }
      }
    )
  })
}
