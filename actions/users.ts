'use server'

import { createClient } from '@/lib/supabase/server'
import type { User, LiffUserProfile } from '@/types/user'
import { errorToString } from '@/lib/utils/error-handling'

/**
 * LIFFプロフィール情報からユーザーを登録または更新
 *
 * @param profile - LIFFから取得したユーザープロフィール
 * @returns ユーザーデータまたはエラー
 */
export async function registerOrUpdateUser(
  profile: LiffUserProfile
): Promise<{ data: User | null; error: string | null }> {
  try {
    // 入力値の検証
    if (!profile.userId || profile.userId.trim() === '') {
      console.error('[registerOrUpdateUser] Invalid userId:', profile.userId)
      return {
        data: null,
        error: 'ユーザーIDが無効です',
      }
    }

    // LINE User IDの形式チェック（Uで始まる33文字）
    // 開発環境のモックIDは許可
    const isMockId = profile.userId.startsWith('mock-')
    if (!isMockId && (!profile.userId.startsWith('U') || profile.userId.length !== 33)) {
      console.error(
        '[registerOrUpdateUser] Invalid LINE User ID format:',
        profile.userId
      )
      return {
        data: null,
        error: 'LINE User IDの形式が無効です',
      }
    }

    const supabase = await createClient()

    // 1. 既存ユーザーを検索
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('*')
      .eq('line_user_id', profile.userId)
      .maybeSingle()

    if (searchError) {
      console.error('[registerOrUpdateUser] Search error:', {
        message: searchError.message,
        details: searchError.details,
        hint: searchError.hint,
        code: searchError.code,
      })
      throw searchError
    }

    if (existingUser) {
      // 2. 既存ユーザーの情報を更新
      const { data, error } = await supabase
        .from('users')
        .update({
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          status_message: profile.statusMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('line_user_id', profile.userId)
        .select()
        .single()

      if (error) {
        console.error('[registerOrUpdateUser] Update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log('[registerOrUpdateUser] User updated:', data.id)
      return { data, error: null }
    } else {
      // 3. 新規ユーザーを作成
      const { data, error } = await supabase
        .from('users')
        .insert({
          line_user_id: profile.userId,
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          status_message: profile.statusMessage,
        })
        .select()
        .single()

      if (error) {
        console.error('[registerOrUpdateUser] Insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log('[registerOrUpdateUser] New user created:', data.id)

      // 4. 新規ユーザーの場合、デフォルト設定も作成
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: data.id,
          notification_enabled: true,
          reminder_enabled: false,
          reminder_hours_before: 24,
          default_display_mode: 'order_only',
        })

      if (settingsError) {
        console.error('[registerOrUpdateUser] Settings creation error:', settingsError)
        // 設定作成に失敗してもユーザー作成は成功とみなす
      } else {
        console.log('[registerOrUpdateUser] User settings created for:', data.id)
      }

      return { data, error: null }
    }
  } catch (error) {
    // Supabaseエラーの詳細を取得
    const supabaseError = error as { details?: string; hint?: string; code?: string }

    console.error('[registerOrUpdateUser] Failed:', {
      error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      // Supabaseエラーの詳細
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
    })

    // エラーメッセージを文字列に変換
    const errorMessage = errorToString(error)

    // 空のエラー（空オブジェクト含む）の場合は error: null を返す
    if (!errorMessage) {
      console.warn('[registerOrUpdateUser] Invalid error received, treating as success')
      return {
        data: null,
        error: null,
      }
    }

    // 有効なエラーの場合はエラーメッセージを返す
    return {
      data: null,
      error: errorMessage,
    }
  }
}

/**
 * LINE User IDからユーザー情報を取得
 *
 * @param lineUserId - LINE User ID
 * @returns ユーザーデータまたはエラー
 */
export async function getUserByLineId(
  lineUserId: string
): Promise<{ data: User | null; error: string | null }> {
  try {
    // 入力値の検証
    if (!lineUserId || lineUserId.trim() === '') {
      console.error('[getUserByLineId] Invalid lineUserId:', lineUserId)
      return {
        data: null,
        error: 'ユーザーIDが無効です',
      }
    }

    // LINE User IDの形式チェック
    // 開発環境のモックIDは許可
    const isMockId = lineUserId.startsWith('mock-')
    if (!isMockId && (!lineUserId.startsWith('U') || lineUserId.length !== 33)) {
      console.error(
        '[getUserByLineId] Invalid LINE User ID format:',
        lineUserId
      )
      return {
        data: null,
        error: 'LINE User IDの形式が無効です',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('line_user_id', lineUserId)
      .maybeSingle()

    if (error) {
      console.error('[getUserByLineId] Query error:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('[getUserByLineId] Failed:', {
      error,
      errorType: typeof error,
      message: error instanceof Error ? error.message : String(error),
    })

    // エラーメッセージを文字列に変換
    const errorMessage = errorToString(error)

    // 空のエラー（空オブジェクト含む）の場合は error: null を返す
    if (!errorMessage) {
      console.warn('[getUserByLineId] Invalid error received, treating as success')
      return {
        data: null,
        error: null,
      }
    }

    // 有効なエラーの場合はエラーメッセージを返す
    return {
      data: null,
      error: errorMessage,
    }
  }
}
