/**
 * エリア（都道府県）関連のユーティリティ関数
 */

import { ALL_PREFECTURES } from '@/lib/constants/areas'
import type { DayItinerary } from '@/types/models'

/**
 * 住所文字列から都道府県名を抽出
 *
 * Google Places APIから取得した住所（例: "日本、〒100-0001 東京都千代田区..."）から
 * 都道府県名を抽出します。
 *
 * @param address - 住所文字列
 * @returns 都道府県名（例: "東京都"）、見つからない場合はundefined
 *
 * @example
 * ```ts
 * extractPrefectureFromAddress("日本、〒100-0001 東京都千代田区千代田1-1")
 * // => "東京都"
 *
 * extractPrefectureFromAddress("日本、〒060-0001 北海道札幌市中央区北一条西2丁目")
 * // => "北海道"
 * ```
 */
export function extractPrefectureFromAddress(address: string): string | undefined {
  // ALL_PREFECTURES定数（47都道府県）と完全一致チェック
  for (const prefecture of ALL_PREFECTURES) {
    if (address.includes(prefecture)) {
      return prefecture
    }
  }
  return undefined
}

/**
 * 日程データから主要な都道府県を抽出
 *
 * 全日程のスポット（スタート地点、観光スポット、ゴール地点）から
 * 都道府県を集計し、最も多く登場する都道府県を返します。
 *
 * @param dayItineraries - 日程データの配列
 * @returns 都道府県名（例: "東京都"）、抽出できない場合は空文字列
 *
 * @example
 * ```ts
 * const itineraries = [
 *   {
 *     dayNumber: 1,
 *     startPoint: { address: "東京都新宿区...", ... },
 *     spots: [
 *       { address: "東京都渋谷区...", ... },
 *       { address: "東京都港区...", ... },
 *     ],
 *     endPoint: { address: "神奈川県横浜市...", ... },
 *   },
 * ]
 *
 * extractAreaFromItineraries(itineraries)
 * // => "東京都" (3回登場 > 神奈川県1回)
 * ```
 */
export function extractAreaFromItineraries(dayItineraries: DayItinerary[]): string {
  const prefectureCounts = new Map<string, number>()

  // 全日程のスポットから都道府県を集計
  for (const day of dayItineraries) {
    // スタート地点
    const startPref = extractPrefectureFromAddress(day.startPoint.address || '')
    if (startPref) {
      prefectureCounts.set(startPref, (prefectureCounts.get(startPref) || 0) + 1)
    }

    // 観光スポット
    for (const spot of day.spots) {
      const spotPref = extractPrefectureFromAddress(spot.address || '')
      if (spotPref) {
        prefectureCounts.set(spotPref, (prefectureCounts.get(spotPref) || 0) + 1)
      }
    }

    // ゴール地点
    const endPref = extractPrefectureFromAddress(day.endPoint.address || '')
    if (endPref) {
      prefectureCounts.set(endPref, (prefectureCounts.get(endPref) || 0) + 1)
    }
  }

  // 最も多く登場する都道府県を返す
  let maxCount = 0
  let mainPrefecture = ''

  for (const [prefecture, count] of prefectureCounts.entries()) {
    if (count > maxCount) {
      maxCount = count
      mainPrefecture = prefecture
    }
  }

  return mainPrefecture
}
