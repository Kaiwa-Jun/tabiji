'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { savePlanSchema, type SavePlanData } from '@/lib/schemas/plan'
import { errorToString } from '@/lib/utils/error-handling'
import { extractAreaFromItineraries } from '@/lib/utils/area'
import type { PlanFormData } from '@/types/models'

/**
 * Server Actionの戻り値の型
 */
interface SavePlanResult {
  success: boolean
  planId?: string
  error?: string
}

/**
 * PlanFormDataをSavePlanDataに変換するヘルパー関数
 *
 * @param formData - プランフォームのデータ
 * @param title - プランタイトル
 * @returns 保存用のデータ形式
 */
function convertFormDataToSaveData(formData: PlanFormData, title: string): SavePlanData {
  if (!formData.startDate || !formData.endDate) {
    throw new Error('開始日と終了日は必須です')
  }

  if (!formData.dayItineraries || formData.dayItineraries.length === 0) {
    throw new Error('日程情報が必要です')
  }

  // 日付を YYYY-MM-DD 形式に変換
  const startDate = formData.startDate.toISOString().split('T')[0]
  const endDate = formData.endDate.toISOString().split('T')[0]

  // エリア（都道府県）をスポットの住所から抽出
  const area = extractAreaFromItineraries(formData.dayItineraries)

  // 日程情報を変換
  const dayItineraries = formData.dayItineraries.map((day) => {
    // 各スポットの時刻情報を取得
    const spots = day.spots.map((spot) => {
      // timeSlotsから時刻情報を取得
      const timeSlot = day.timeSlots?.get(spot.placeId || spot.name)

      // Date型をHH:MM:SS形式の文字列に変換するヘルパー
      const formatTime = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${hours}:${minutes}:${seconds}`
      }

      return {
        place_id: spot.placeId || null,
        name: spot.name,
        address: spot.address || null,
        lat: spot.lat,
        lng: spot.lng,
        photo_url: spot.photoUrl || null,
        category: spot.types?.[0] || null,
        rating: spot.rating || null,
        metadata: {
          types: spot.types || [],
        },
        arrivalTime: timeSlot?.arrivalTime ? formatTime(timeSlot.arrivalTime) : null,
        departureTime: timeSlot?.departureTime ? formatTime(timeSlot.departureTime) : null,
        durationMinutes: timeSlot?.durationMinutes || null,
        isCustom: false,
      }
    })

    return {
      dayNumber: day.dayNumber,
      date: new Date(
        formData.startDate!.getTime() + (day.dayNumber - 1) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      startPoint: {
        place_id: day.startPoint.placeId || null,
        name: day.startPoint.name,
        address: day.startPoint.address || null,
        lat: day.startPoint.lat,
        lng: day.startPoint.lng,
        photo_url: day.startPoint.photoUrl || null,
        category: day.startPoint.types?.[0] || null,
        rating: day.startPoint.rating || null,
        metadata: null,
      },
      endPoint: {
        place_id: day.endPoint.placeId || null,
        name: day.endPoint.name,
        address: day.endPoint.address || null,
        lat: day.endPoint.lat,
        lng: day.endPoint.lng,
        photo_url: day.endPoint.photoUrl || null,
        category: day.endPoint.types?.[0] || null,
        rating: day.endPoint.rating || null,
        metadata: null,
      },
      spots,
    }
  })

  return {
    title,
    startDate,
    endDate,
    area,
    displayMode: formData.timeSlots ? 'with_time' : 'order_only',
    isPublic: false,
    dayItineraries,
  }
}

/**
 * 旅行プランを保存するServer Action
 *
 * @param formData - プランフォームのデータ
 * @param title - プランタイトル（オプション、デフォルト: "新しい旅行プラン"）
 * @returns 保存結果（成功時はプランID、失敗時はエラーメッセージ）
 */
export async function savePlan(
  formData: PlanFormData,
  title: string = '新しい旅行プラン'
): Promise<SavePlanResult> {
  try {
    const supabase = await createClient()

    // 1. 認証チェック（auth.uid()を使用）
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[savePlan] Authentication failed:', authError)
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    console.log('[savePlan] Authenticated user:', user.id)

    // 2. FormDataをSaveDataに変換
    let saveData: SavePlanData
    try {
      saveData = convertFormDataToSaveData(formData, title)
    } catch (error) {
      console.error('[savePlan] Data conversion error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'データの変換に失敗しました',
      }
    }

    // 3. Zodバリデーション
    const validation = savePlanSchema.safeParse(saveData)
    if (!validation.success) {
      console.error('[savePlan] Validation error:', validation.error.flatten())
      return {
        success: false,
        error: '入力データが正しくありません',
      }
    }

    // 4. PostgreSQL関数をRPC経由で呼び出し
    // Note: p_user_idにauth.uid()（user.id）を使用
    // Note: save_travel_plan関数は型定義されていないため、型アサーションを使用
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: planId, error: rpcError } = await (supabase.rpc as any)('save_travel_plan', {
      p_user_id: user.id, // auth.uid() を使用（RLSポリシーと一致）
      p_title: saveData.title,
      p_start_date: saveData.startDate,
      p_end_date: saveData.endDate,
      p_area: saveData.area,
      p_display_mode: saveData.displayMode,
      p_is_public: saveData.isPublic,
      p_day_itineraries: saveData.dayItineraries,
    })

    if (rpcError) {
      console.error('[savePlan] RPC error:', {
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
        code: rpcError.code,
      })
      throw rpcError
    }

    if (!planId) {
      throw new Error('プランIDの取得に失敗しました')
    }

    console.log('[savePlan] Plan saved successfully:', planId)

    // 5. キャッシュの再検証
    revalidatePath('/liff/plans')

    return {
      success: true,
      planId,
    }
  } catch (error) {
    console.error('[savePlan] Failed:', {
      error,
      errorType: typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // エラーメッセージを文字列に変換
    const errorMessage = errorToString(error)

    return {
      success: false,
      error: errorMessage || 'プランの保存に失敗しました',
    }
  }
}
