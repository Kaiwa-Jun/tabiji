'use client'

import { useMemo } from 'react'
import { usePlanForm } from '@/contexts/plan-form-context'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Calendar, ArrowDown } from 'lucide-react'
import { formatTime } from '@/lib/itinerary/time-calculator'
import { formatDuration } from '@/lib/maps/directions'
import type { OptimizedSpot } from '@/lib/itinerary/types'

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
 * 旅程リスト表示コンポーネント
 * プレビューモード時に最適化されたスポットを日程ごとにリスト形式で表示
 */
export function RouteListView() {
  const { formData } = usePlanForm()

  // 日程とスポットの分割を計算
  const { dates, daySpots, totalSpots } = useMemo(() => {
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.dayPlan ||
      formData.dayPlan.size === 0
    ) {
      return { dates: [], daySpots: new Map<number, OptimizedSpot[]>(), totalSpots: 0 }
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const dateRange = generateDateRange(startDate, endDate)

    // dayPlanから合計スポット数を計算
    let total = 0
    formData.dayPlan.forEach((spots) => {
      total += spots.length
    })

    return {
      dates: dateRange,
      daySpots: formData.dayPlan,
      totalSpots: total,
    }
  }, [formData.startDate, formData.endDate, formData.dayPlan])

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
          // dayPlanは1始まり、datesは0始まりなので+1する
          const spotsForDay = daySpots.get(dayIndex + 1) || []

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
                  spotsForDay.map((spot: OptimizedSpot, spotIndex: number) => {
                    // 時刻情報を取得
                    const timeSlot = formData.timeSlots?.get(spot.id)

                    // 移動情報を取得（次のスポットへの移動）
                    const isLast = spotIndex === spotsForDay.length - 1
                    let routeToNext = null

                    if (!isLast && formData.routeInfo) {
                      // optimizedSpotsの中でこのスポットのインデックスを見つける
                      const globalIndex = formData.optimizedSpots?.findIndex(
                        (s) => s.placeId === spot.id
                      )
                      if (globalIndex !== undefined && globalIndex >= 0) {
                        routeToNext = formData.routeInfo[globalIndex]
                      }
                    }

                    // 元のPlaceResultを取得（写真や評価などの詳細情報）
                    const placeDetails = formData.optimizedSpots?.find(
                      (s) => s.placeId === spot.id
                    )

                    return (
                      <div key={spot.id}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* 順番バッジ */}
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                                {spot.orderIndex}
                              </div>

                              {/* スポット情報 */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {spot.name}
                                </h3>

                                {/* 住所 */}
                                {placeDetails?.address && (
                                  <p className="mt-1 text-xs text-gray-500 truncate">
                                    {placeDetails.address}
                                  </p>
                                )}

                                {/* 評価・カテゴリ */}
                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                                  {placeDetails?.rating && (
                                    <div className="flex items-center gap-1">
                                      <span>⭐</span>
                                      <span>{placeDetails.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                  {placeDetails?.types && placeDetails.types.length > 0 && (
                                    <span className="rounded bg-gray-100 px-2 py-0.5">
                                      {placeDetails.types[0].replace(/_/g, ' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 時刻情報 */}
                            {timeSlot && (
                              <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-xs">
                                <div>
                                  <div className="text-muted-foreground">到着</div>
                                  <div className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(timeSlot.arrivalTime)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">滞在</div>
                                  <div className="font-medium">
                                    {timeSlot.durationMinutes}分
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">出発</div>
                                  <div className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(timeSlot.departureTime)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* 移動時間 */}
                        {!isLast && routeToNext && (
                          <div className="flex items-center gap-2 py-3 pl-11">
                            <ArrowDown className="h-4 w-4 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                移動: {formatDuration(routeToNext.duration)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(routeToNext.distance / 1000).toFixed(1)}km)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 py-4">この日のスポットはありません</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
