'use server'

import { createClient } from '@/lib/supabase/server'
import type { PlaceResult } from '@/lib/maps/places'
import type { Tables } from '@/types/database'

/**
 * スポット保存結果
 */
interface SaveSpotResult {
  data: Tables<'spots'> | null
  error: string | null
}

/**
 * PlaceResultをSupabaseのspotsテーブルに保存する
 *
 * @param spot - Places APIから取得したスポット情報
 * @returns 保存されたスポットレコード、またはエラー
 *
 * @remarks
 * - google_place_idで重複チェックを行う
 * - 既存レコードがあれば、新規作成せずに既存レコードを返す
 * - Places APIのtypesは最初の要素をcategoryに保存
 * - その他のメタデータはmetadataフィールドにJSON形式で保存
 * - APIコスト削減のため、同じスポットは複数回保存しない
 *
 * @example
 * ```typescript
 * const placeResult = await searchPlacesByArea('東京都')
 * const result = await saveSpot(placeResult[0])
 *
 * if (result.error) {
 *   console.error('保存失敗:', result.error)
 * } else {
 *   console.log('保存成功:', result.data.id)
 * }
 * ```
 */
export async function saveSpot(spot: PlaceResult): Promise<SaveSpotResult> {
  try {
    // 1. 入力値の検証
    if (!spot.placeId || spot.placeId.trim() === '') {
      console.error('[saveSpot] Invalid placeId:', spot.placeId)
      return {
        data: null,
        error: 'Google Place IDが無効です',
      }
    }

    if (!spot.name || spot.name.trim() === '') {
      console.error('[saveSpot] Invalid name:', spot.name)
      return {
        data: null,
        error: 'スポット名が無効です',
      }
    }

    // 緯度・経度の範囲チェック（-90〜90、-180〜180）
    if (spot.lat < -90 || spot.lat > 90 || spot.lng < -180 || spot.lng > 180) {
      console.error('[saveSpot] Invalid coordinates:', { lat: spot.lat, lng: spot.lng })
      return {
        data: null,
        error: '緯度・経度の値が無効です',
      }
    }

    const supabase = await createClient()

    // 2. Google Place IDで重複チェック
    const { data: existingSpot, error: selectError } = await supabase
      .from('spots')
      .select('*')
      .eq('google_place_id', spot.placeId)
      .maybeSingle()

    // 既存レコードがあれば返す
    if (existingSpot) {
      console.log(`[saveSpot] Spot already exists: ${spot.name} (ID: ${existingSpot.id})`)
      return { data: existingSpot, error: null }
    }

    // selectErrorがある場合（レコードが見つからない以外のエラー）
    if (selectError) {
      console.error('[saveSpot] Select error:', selectError)
      return { data: null, error: selectError.message }
    }

    // 3. 新規作成
    const { data, error: insertError } = await supabase
      .from('spots')
      .insert({
        google_place_id: spot.placeId,
        name: spot.name,
        address: spot.address,
        latitude: spot.lat,
        longitude: spot.lng,
        photo_url: spot.photoUrl,
        rating: spot.rating,
        category: spot.types?.[0], // 最初のtypeをcategoryとして保存
        metadata: spot.types ? { types: spot.types } : null, // typesを全てmetadataに保存
      })
      .select()
      .single()

    if (insertError) {
      console.error('[saveSpot] Insert error:', insertError)
      return { data: null, error: insertError.message }
    }

    console.log(`[saveSpot] Successfully saved spot: ${spot.name} (ID: ${data.id})`)
    return { data, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'スポットの保存に失敗しました'
    console.error('[saveSpot] Unexpected error:', error)
    return { data: null, error: message }
  }
}
