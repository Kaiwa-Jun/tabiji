/**
 * 日付ユーティリティ関数
 * date-fnsを使用した日付操作とフォーマット
 */

import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 「X泊Y日」をフォーマット
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 「X泊Y日」形式の文字列（例: "2泊3日"）
 *
 * @example
 * formatDuration(new Date('2025-10-13'), new Date('2025-10-15'))
 * // => "2泊3日"
 *
 * formatDuration(new Date('2025-10-13'), new Date('2025-10-13'))
 * // => "日帰り"
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate) + 1
  const nights = days - 1

  if (nights === 0) {
    return '日帰り'
  }

  return `${nights}泊${days}日`
}

/**
 * 日付を「yyyy年M月d日」形式でフォーマット
 *
 * @param date - フォーマットする日付
 * @returns 「yyyy年M月d日」形式の文字列（例: "2025年10月13日"）
 *
 * @example
 * formatJapaneseDate(new Date('2025-10-13'))
 * // => "2025年10月13日"
 */
export function formatJapaneseDate(date: Date): string {
  return format(date, 'yyyy年M月d日', { locale: ja })
}

/**
 * 日付を「yyyy年M月d日（曜日）」形式でフォーマット
 *
 * @param date - フォーマットする日付
 * @returns 「yyyy年M月d日（曜日）」形式の文字列（例: "2025年10月13日（月）"）
 *
 * @example
 * formatJapaneseDateWithWeekday(new Date('2025-10-13'))
 * // => "2025年10月13日（月）"
 */
export function formatJapaneseDateWithWeekday(date: Date): string {
  return format(date, 'yyyy年M月d日（E）', { locale: ja })
}

/**
 * 日付を「M月d日」形式でフォーマット（年なし）
 *
 * @param date - フォーマットする日付
 * @returns 「M月d日」形式の文字列（例: "10月13日"）
 *
 * @example
 * formatShortJapaneseDate(new Date('2025-10-13'))
 * // => "10月13日"
 */
export function formatShortJapaneseDate(date: Date): string {
  return format(date, 'M月d日', { locale: ja })
}

/**
 * 日付が今日かどうかを判定
 *
 * @param date - 判定する日付
 * @returns 今日の場合はtrue、それ以外はfalse
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 2つの日付が同じ日かどうかを判定
 *
 * @param date1 - 比較する日付1
 * @param date2 - 比較する日付2
 * @returns 同じ日の場合はtrue、それ以外はfalse
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
