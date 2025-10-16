'use client'

import { useMemo } from 'react'
import { usePlanForm } from '@/contexts/plan-form-context'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Calendar } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * 日付をフォーマット（例：10月16日（月））
 */
function formatDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[date.getDay()]

  return `${month}月${day}日（${weekday}）`
}

/**
 * 日程の配列を生成
 */
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * スポットを日数で均等に分割（仮実装）
 */
function divideSpotsByDays(
  spots: PlaceResult[],
  numDays: number
): Map<number, PlaceResult[]> {
  const spotsPerDay = Math.ceil(spots.length / numDays)
  const daySpots = new Map<number, PlaceResult[]>()

  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    const startIndex = dayIndex * spotsPerDay
    const endIndex = Math.min(startIndex + spotsPerDay, spots.length)
    daySpots.set(dayIndex, spots.slice(startIndex, endIndex))
  }

  return daySpots
}

/**
 * 旅程リスト表示コンポーネント
 * プレビューモード時に選択されたスポットを日程ごとにリスト形式で表示
 */
export function RouteListView() {
  const { formData } = usePlanForm()

  // 日程とスポットの分割を計算
  const { dates, daySpots, totalSpots } = useMemo(() => {
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.optimizedSpots ||
      formData.optimizedSpots.length === 0
    ) {
      return { dates: [], daySpots: new Map(), totalSpots: 0 }
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const dateRange = generateDateRange(startDate, endDate)
    const spotsByDay = divideSpotsByDays(formData.optimizedSpots, dateRange.length)

    return {
      dates: dateRange,
      daySpots: spotsByDay,
      totalSpots: formData.optimizedSpots.length,
    }
  }, [formData.startDate, formData.endDate, formData.optimizedSpots])

  // データが不足している場合のメッセージ表示
  if (dates.length === 0 || totalSpots === 0) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
        <div className="text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">プラン候補がありません</p>
        </div>
      </div>
    )
  }

  // 全体のスポット番号を追跡するためのカウンター
  let globalSpotIndex = 0

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-white pt-20">
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {dates.length}日間 • 選択されたスポット: {totalSpots}件
          </p>
        </div>

        {/* 日程ごとのスポットリスト */}
        {dates.map((date, dayIndex) => {
          const spotsForDay = daySpots.get(dayIndex) || []

          return (
            <div key={dayIndex} className="space-y-3">
              {/* 日付ヘッダー */}
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {dayIndex + 1}日目 - {formatDate(date)}
                </h3>
              </div>

              {/* その日のスポットリスト */}
              <div className="space-y-3 pl-2">
                {spotsForDay.length > 0 ? (
                  spotsForDay.map((spot) => {
                    const spotNumber = ++globalSpotIndex
                    return (
                      <Card
                        key={spot.placeId}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* 順番バッジ */}
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                              {spotNumber}
                            </div>

                            {/* スポット情報 */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{spot.name}</h3>

                              {/* 住所 */}
                              {spot.address && (
                                <p className="mt-1 text-xs text-gray-500 truncate">
                                  {spot.address}
                                </p>
                              )}

                              {/* 評価・カテゴリ */}
                              <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                                {spot.rating && (
                                  <div className="flex items-center gap-1">
                                    <span>⭐</span>
                                    <span>{spot.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {spot.types && spot.types.length > 0 && (
                                  <span className="rounded bg-gray-100 px-2 py-0.5">
                                    {spot.types[0].replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 仮の時刻情報（Phase 3実装後に実データを表示） */}
                          <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>到着: --:--</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>出発: --:--</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 py-4">この日のスポットはありません</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Phase 3実装予定の注記 */}
        <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-800">
            ℹ️ 訪問時刻や移動時間の表示、日程の最適化はPhase 3で実装予定です
          </p>
        </div>
      </div>
    </div>
  )
}
