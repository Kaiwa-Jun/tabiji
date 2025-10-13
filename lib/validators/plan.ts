/**
 * プランバリデーション用のヘルパー関数
 * 各ステップでのバリデーション実行と日数計算などのユーティリティを提供
 */

import {
  dateInputSchema,
  areaSelectionSchema,
  spotSelectionSchema,
  planSchema,
} from '@/lib/schemas/plan'
import type {
  DateInputFormData,
  AreaSelectionFormData,
  SpotSelectionFormData,
  PlanSchemaData,
  ValidationResult,
} from '@/types/plan'

// ========================================
// バリデーション関数
// ========================================

/**
 * 日程入力データのバリデーション
 *
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 *
 * @example
 * ```ts
 * const result = validateDateInput({
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-01-03'),
 * })
 *
 * if (result.success) {
 *   console.log('バリデーション成功:', result.data)
 * } else {
 *   console.error('エラー:', result.errors)
 * }
 * ```
 */
export function validateDateInput(data: unknown): ValidationResult<DateInputFormData> {
  const result = dateInputSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * エリア選択データのバリデーション
 *
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 *
 * @example
 * ```ts
 * const result = validateAreaSelection({
 *   region: '関東',
 *   prefecture: '東京都',
 * })
 *
 * if (result.success) {
 *   console.log('バリデーション成功:', result.data)
 * } else {
 *   console.error('エラー:', result.errors)
 * }
 * ```
 */
export function validateAreaSelection(data: unknown): ValidationResult<AreaSelectionFormData> {
  const result = areaSelectionSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * スポット選択データのバリデーション
 *
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 *
 * @example
 * ```ts
 * const result = validateSpotSelection({
 *   selectedSpots: [spot1, spot2],
 *   customSpots: [],
 * })
 *
 * if (result.success) {
 *   console.log('バリデーション成功:', result.data)
 * } else {
 *   console.error('エラー:', result.errors)
 * }
 * ```
 */
export function validateSpotSelection(data: unknown): ValidationResult<SpotSelectionFormData> {
  const result = spotSelectionSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * プラン全体のバリデーション
 *
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 *
 * @example
 * ```ts
 * const result = validatePlan({
 *   title: '北海道旅行',
 *   startDate: new Date('2025-07-01'),
 *   endDate: new Date('2025-07-05'),
 *   region: '北海道',
 *   prefecture: '北海道',
 *   selectedSpots: [spot1, spot2],
 *   customSpots: [],
 * })
 *
 * if (result.success) {
 *   console.log('プラン作成準備完了:', result.data)
 * } else {
 *   console.error('エラー:', result.errors)
 * }
 * ```
 */
export function validatePlan(data: unknown): ValidationResult<PlanSchemaData> {
  const result = planSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

// ========================================
// 日数計算ユーティリティ
// ========================================

/**
 * 開始日と終了日から旅行日数を計算
 * 開始日を含めた日数を返す（例: 1/1〜1/3 → 3日間）
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 旅行日数
 *
 * @example
 * ```ts
 * const days = calculateDays(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-03')
 * )
 * console.log(days) // 3
 * ```
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // 開始日も含める
}

/**
 * 「X泊Y日」形式の文字列を生成
 * 日帰りの場合は「日帰り」を返す
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 期間を表す文字列
 *
 * @example
 * ```ts
 * // 2泊3日の場合
 * formatDuration(new Date('2025-01-01'), new Date('2025-01-03'))
 * // '2泊3日'
 *
 * // 日帰りの場合
 * formatDuration(new Date('2025-01-01'), new Date('2025-01-01'))
 * // '日帰り'
 * ```
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const days = calculateDays(startDate, endDate)
  const nights = days - 1

  if (nights === 0) {
    return '日帰り'
  }

  return `${nights}泊${days}日`
}

/**
 * 日付範囲が有効かチェック
 * 終了日が開始日以降であればtrue
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 有効な場合true
 *
 * @example
 * ```ts
 * isValidDateRange(new Date('2025-01-01'), new Date('2025-01-03')) // true
 * isValidDateRange(new Date('2025-01-03'), new Date('2025-01-01')) // false
 * ```
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate >= startDate
}

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 *
 * @param date - 変換する日付
 * @returns YYYY-MM-DD 形式の文字列
 *
 * @example
 * ```ts
 * formatDateToString(new Date('2025-01-01'))
 * // '2025-01-01'
 * ```
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 日付範囲から日付の配列を生成
 * プラン作成時に各日のplan_daysレコードを作成する際に使用
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 日付の配列
 *
 * @example
 * ```ts
 * const dates = generateDateRange(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-03')
 * )
 * // [Date('2025-01-01'), Date('2025-01-02'), Date('2025-01-03')]
 * ```
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// ========================================
// スポット数チェック
// ========================================

/**
 * 選択されたスポットの合計数を取得
 *
 * @param selectedSpots - 選択されたスポット
 * @param customSpots - カスタムスポット
 * @returns スポットの合計数
 *
 * @example
 * ```ts
 * getTotalSpotCount([spot1, spot2], [customSpot1])
 * // 3
 * ```
 */
export function getTotalSpotCount(
  selectedSpots: unknown[],
  customSpots: unknown[]
): number {
  return selectedSpots.length + customSpots.length
}

/**
 * スポットが選択されているかチェック
 *
 * @param selectedSpots - 選択されたスポット
 * @param customSpots - カスタムスポット
 * @returns スポットが1つ以上選択されている場合true
 *
 * @example
 * ```ts
 * hasSelectedSpots([spot1], []) // true
 * hasSelectedSpots([], []) // false
 * ```
 */
export function hasSelectedSpots(
  selectedSpots: unknown[],
  customSpots: unknown[]
): boolean {
  return getTotalSpotCount(selectedSpots, customSpots) > 0
}
