'use server'

import { createClient } from '@/lib/supabase/server'
import type { PlaceResult } from '@/lib/maps/places'
import type { Tables } from '@/types/database'
import { errorToString } from '@/lib/utils/error-handling'

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
      // 空のオブジェクト`{}`をチェック
      let isEmptyObject = false
      if (selectError !== null && selectError !== undefined && typeof selectError === 'object') {
        try {
          const errorJson = JSON.stringify(selectError)
          isEmptyObject = errorJson === '{}'
        } catch {
          // シリアライズできない場合は空オブジェクトではない
        }
        if (!isEmptyObject) {
          isEmptyObject = Object.keys(selectError).length === 0
        }
      }
      
      // 文字列`"{}"`のチェック
      const isStringEmptyObject = typeof selectError === 'string' && (selectError.trim() === '{}' || selectError === '{}')
      
      // 空のオブジェクトまたは文字列`"{}"`の場合はnullを返す（エラーとして扱わない）
      if (isEmptyObject || isStringEmptyObject) {
        console.warn('[saveSpot] Empty selectError received, returning null')
        return { data: null, error: null }
      }
      
      console.error('[saveSpot] Select error:', {
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
        code: selectError.code,
      })
      const errorMessage = errorToString(selectError)
      if (!errorMessage || errorMessage.trim() === '' || errorMessage.trim() === '{}' || errorMessage === '{}') {
        console.warn('[saveSpot] Empty error message after conversion for selectError, returning null')
        return { data: null, error: null }
      }
      return { data: null, error: errorMessage }
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
      // 空のオブジェクト`{}`をチェック
      let isEmptyObject = false
      if (insertError !== null && insertError !== undefined && typeof insertError === 'object') {
        try {
          const errorJson = JSON.stringify(insertError)
          isEmptyObject = errorJson === '{}'
        } catch {
          // シリアライズできない場合は空オブジェクトではない
        }
        if (!isEmptyObject) {
          isEmptyObject = Object.keys(insertError).length === 0
        }
      }
      
      // 文字列`"{}"`のチェック
      const isStringEmptyObject = typeof insertError === 'string' && (insertError.trim() === '{}' || insertError === '{}')
      
      // 空のオブジェクトまたは文字列`"{}"`の場合はnullを返す（エラーとして扱わない）
      if (isEmptyObject || isStringEmptyObject) {
        console.warn('[saveSpot] Empty insertError received, returning null')
        return { data: null, error: null }
      }
      
      console.error('[saveSpot] Insert error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      })
      const errorMessage = errorToString(insertError)
      if (!errorMessage || errorMessage.trim() === '' || errorMessage.trim() === '{}' || errorMessage === '{}') {
        console.warn('[saveSpot] Empty error message after conversion for insertError, returning null')
        return { data: null, error: null }
      }
      return { data: null, error: errorMessage }
    }

    console.log(`[saveSpot] Successfully saved spot: ${spot.name} (ID: ${data.id})`)
    return { data, error: null }
  } catch (error) {
    // 空のオブジェクト`{}`をチェック
    let isEmptyObject = false
    if (error !== null && error !== undefined && typeof error === 'object') {
      try {
        const errorJson = JSON.stringify(error)
        isEmptyObject = errorJson === '{}'
      } catch {
        // シリアライズできない場合は空オブジェクトではない
      }
      if (!isEmptyObject) {
        isEmptyObject = Object.keys(error).length === 0
      }
    }
    
    // 文字列`"{}"`のチェック
    const isStringEmptyObject = typeof error === 'string' && (String(error).trim() === '{}' || error === '{}')
    
    // 空のオブジェクトまたは文字列`"{}"`の場合はnullを返す（エラーとして扱わない）
    if (isEmptyObject || isStringEmptyObject) {
      console.warn('[saveSpot] Empty error received, returning null')
      return { data: null, error: null }
    }
    
    console.error('[saveSpot] Unexpected error:', {
      error,
      errorType: typeof error,
      message: error instanceof Error ? error.message : String(error),
    })
    const errorMessage = errorToString(error)
    if (!errorMessage || errorMessage.trim() === '' || errorMessage.trim() === '{}' || errorMessage === '{}') {
      console.warn('[saveSpot] Empty error message after conversion, returning null')
      return { data: null, error: null }
    }
    return { data: null, error: errorMessage }
  }
}
