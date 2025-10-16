/**
 * 時刻計算ロジック
 * スポットごとの滞在時間を推定し、訪問時刻を自動計算する
 */

/**
 * スポットの訪問時刻情報
 */
export interface TimeSlot {
  /** 到着時刻 */
  arrivalTime: Date
  /** 出発時刻 */
  departureTime: Date
  /** 滞在時間（分） */
  durationMinutes: number
}

/**
 * 時刻を「HH:MM」形式にフォーマット
 *
 * @param date - Date オブジェクト
 * @returns フォーマット済み時刻文字列（例: "09:30"）
 *
 * @example
 * ```typescript
 * const date = new Date('2025-04-01T09:30:00')
 * formatTime(date) // "09:30"
 * ```
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 時刻を調整する
 *
 * @param originalTime - 元の時刻
 * @param adjustmentMinutes - 調整する分数（正の値で未来へ、負の値で過去へ）
 * @returns 調整後の時刻
 *
 * @example
 * ```typescript
 * const time = new Date('2025-04-01T09:00:00')
 * const adjusted = adjustTime(time, 30) // 30分後
 * formatTime(adjusted) // "09:30"
 * ```
 */
export function adjustTime(originalTime: Date, adjustmentMinutes: number): Date {
  const adjusted = new Date(originalTime)
  adjusted.setMinutes(adjusted.getMinutes() + adjustmentMinutes)
  return adjusted
}

/**
 * スポットタイプに基づいて滞在時間を推定
 *
 * Google Places APIの `types` 配列から適切な滞在時間を推定します。
 * 配列の最初にマッチしたタイプの滞在時間を返すため、
 * より具体的なタイプが優先されます。
 *
 * @param spotTypes - Google Places APIのtype配列（例: ['museum', 'tourist_attraction']）
 * @returns 推定滞在時間（分）
 *
 * @example
 * ```typescript
 * estimateStayDuration(['museum']) // 90分
 * estimateStayDuration(['park']) // 45分
 * estimateStayDuration(['unknown']) // 60分（デフォルト）
 * estimateStayDuration() // 60分（デフォルト）
 * ```
 */
export function estimateStayDuration(spotTypes?: string[]): number {
  if (!spotTypes || spotTypes.length === 0) {
    return 60 // デフォルト: 1時間
  }

  // スポットタイプ別の推定滞在時間（分）
  const durationMap: Record<string, number> = {
    museum: 90, // 博物館: 1.5時間
    art_gallery: 90, // 美術館: 1.5時間
    aquarium: 120, // 水族館: 2時間
    zoo: 180, // 動物園: 3時間
    amusement_park: 240, // 遊園地: 4時間
    park: 45, // 公園: 45分
    tourist_attraction: 60, // 観光地: 1時間
    shopping_mall: 120, // ショッピングモール: 2時間
    restaurant: 60, // レストラン: 1時間
    cafe: 30, // カフェ: 30分
    temple: 30, // 寺: 30分
    shrine: 30, // 神社: 30分
    church: 30, // 教会: 30分
  }

  // 最初にマッチしたタイプの滞在時間を返す
  for (const type of spotTypes) {
    if (durationMap[type]) {
      return durationMap[type]
    }
  }

  return 60 // デフォルト: 1時間
}

/**
 * 訪問時刻を自動計算
 *
 * 開始時刻から順に、各スポットの到着時刻・滞在時間・出発時刻を計算します。
 * スポット間の移動時間（Directions APIから取得）を考慮して、
 * 次のスポットへの到着時刻を算出します。
 *
 * @param startTime - 開始時刻（例: 2025-04-01 09:00:00）
 * @param spots - スポット配列（順序最適化済み）
 * @param travelDurations - スポット間の移動時間配列（秒単位）。配列長は `spots.length - 1`
 * @returns 各スポットの訪問時刻情報のマップ（キー: スポットID）
 *
 * @example
 * ```typescript
 * const startTime = new Date('2025-04-01T09:00:00')
 * const spots = [
 *   { id: '1', types: ['museum'] },
 *   { id: '2', types: ['park'] },
 *   { id: '3', types: ['restaurant'] },
 * ]
 * const travelDurations = [900, 600] // 15分、10分（秒単位）
 *
 * const timeSlots = calculateVisitTimes(startTime, spots, travelDurations)
 *
 * // スポット1: 9:00到着、90分滞在、10:30出発
 * // スポット2: 10:45到着、45分滞在、11:30出発
 * // スポット3: 11:40到着、60分滞在、12:40出発
 * ```
 */
export function calculateVisitTimes(
  startTime: Date,
  spots: Array<{ id: string; types?: string[] }>,
  travelDurations: number[]
): Map<string, TimeSlot> {
  const timeSlots = new Map<string, TimeSlot>()
  let currentTime = new Date(startTime)

  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i]

    // 到着時刻
    const arrivalTime = new Date(currentTime)

    // 滞在時間を推定
    const stayMinutes = estimateStayDuration(spot.types)

    // 出発時刻 = 到着時刻 + 滞在時間
    const departureTime = new Date(arrivalTime)
    departureTime.setMinutes(departureTime.getMinutes() + stayMinutes)

    timeSlots.set(spot.id, {
      arrivalTime,
      departureTime,
      durationMinutes: stayMinutes,
    })

    // 次のスポットへの移動時間を加算
    if (i < travelDurations.length) {
      const travelMinutes = Math.ceil(travelDurations[i] / 60)
      currentTime = new Date(departureTime)
      currentTime.setMinutes(currentTime.getMinutes() + travelMinutes)
    }
  }

  return timeSlots
}

/**
 * 時刻変更後の再計算
 *
 * ユーザーが特定のスポットの出発時刻を手動で変更した場合、
 * それ以降のスポットの時刻を再計算します。
 *
 * @param newDepartureTime - 変更後の出発時刻
 * @param remainingSpots - 後続のスポット配列
 * @param travelDurations - 後続スポット間の移動時間配列（秒単位）
 * @returns 更新された時刻情報のマップ
 *
 * @example
 * ```typescript
 * // ユーザーがスポット2の出発時刻を12:00に変更
 * const newDeparture = new Date('2025-04-01T12:00:00')
 * const remaining = [
 *   { id: '3', types: ['restaurant'] },
 *   { id: '4', types: ['cafe'] },
 * ]
 * const durations = [600] // 10分
 *
 * const updated = recalculateAfterAdjustment(newDeparture, remaining, durations)
 * // スポット3: 12:10到着、60分滞在、13:10出発
 * // スポット4: 13:20到着、30分滞在、13:50出発
 * ```
 */
export function recalculateAfterAdjustment(
  newDepartureTime: Date,
  remainingSpots: Array<{ id: string; types?: string[] }>,
  travelDurations: number[]
): Map<string, TimeSlot> {
  return calculateVisitTimes(newDepartureTime, remainingSpots, travelDurations)
}
