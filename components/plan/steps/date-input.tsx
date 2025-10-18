'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Info, Check, Hotel, MapPinned } from 'lucide-react'
import { ja } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { usePlanForm } from '@/contexts/plan-form-context'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDuration } from '@/lib/utils/date'
import { EndpointInput } from './spot-selection/endpoint-input'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * ステップ1: 日程入力コンポーネント
 * 旅行の開始日と終了日をカレンダーUIで選択するステップ
 */
export function DateInputStep() {
  const { formData, updateFormData } = usePlanForm()

  // react-day-picker用の範囲選択状態
  const [range, setRange] = useState<DateRange | undefined>({
    from: formData.startDate || undefined,
    to: formData.endDate || undefined,
  })

  /**
   * カレンダーで日付範囲を選択したときの処理
   */
  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange)

    if (selectedRange?.from && selectedRange?.to) {
      updateFormData({
        startDate: selectedRange.from,
        endDate: selectedRange.to,
      })
    } else if (selectedRange?.from && !selectedRange?.to) {
      // 開始日のみ選択された状態（終了日はまだ未選択）
      updateFormData({
        startDate: selectedRange.from,
        endDate: null,
      })
    } else {
      // 両方クリアされた場合
      updateFormData({
        startDate: null,
        endDate: null,
      })
    }
  }

  // 両方の日付が選択されているか
  const hasCompleteDates = range?.from && range?.to

  // 宿泊数の計算
  const nights =
    formData.startDate && formData.endDate
      ? Math.floor(
          (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0

  // "出発地点と同じ"チェックボックスの状態
  const [sameAsStart, setSameAsStart] = useState(false)

  /**
   * 出発地点選択ハンドラー
   */
  const handleStartPointSelect = (place: PlaceResult) => {
    updateFormData({
      endpoints: {
        tripStart: place,
        tripEnd: formData.endpoints?.tripEnd || null,
        accommodations: formData.endpoints?.accommodations || [],
      },
    })
  }

  /**
   * 出発地点クリアハンドラー
   */
  const handleStartPointClear = () => {
    updateFormData({
      endpoints: {
        tripStart: null,
        tripEnd: formData.endpoints?.tripEnd || null,
        accommodations: formData.endpoints?.accommodations || [],
      },
    })
  }

  /**
   * 宿泊施設選択ハンドラー
   */
  const handleAccommodationSelect = (index: number, place: PlaceResult) => {
    const newAccommodations = [...(formData.endpoints?.accommodations || [])]
    newAccommodations[index] = place
    updateFormData({
      endpoints: {
        tripStart: formData.endpoints?.tripStart || null,
        tripEnd: formData.endpoints?.tripEnd || null,
        accommodations: newAccommodations,
      },
    })
  }

  /**
   * 宿泊施設クリアハンドラー
   */
  const handleAccommodationClear = (index: number) => {
    const newAccommodations = [...(formData.endpoints?.accommodations || [])]
    newAccommodations.splice(index, 1)
    updateFormData({
      endpoints: {
        tripStart: formData.endpoints?.tripStart || null,
        tripEnd: formData.endpoints?.tripEnd || null,
        accommodations: newAccommodations,
      },
    })
  }

  /**
   * 最終目的地選択ハンドラー
   */
  const handleGoalPointSelect = (place: PlaceResult) => {
    updateFormData({
      endpoints: {
        tripStart: formData.endpoints?.tripStart || null,
        tripEnd: place,
        accommodations: formData.endpoints?.accommodations || [],
      },
    })
  }

  /**
   * 最終目的地クリアハンドラー
   */
  const handleGoalPointClear = () => {
    updateFormData({
      endpoints: {
        tripStart: formData.endpoints?.tripStart || null,
        tripEnd: null,
        accommodations: formData.endpoints?.accommodations || [],
      },
    })
    setSameAsStart(false)
  }

  /**
   * "出発地点と同じ"チェックボックス変更ハンドラー
   */
  const handleSameAsStartChange = (checked: boolean) => {
    setSameAsStart(checked)
    if (checked && formData.endpoints?.tripStart) {
      updateFormData({
        endpoints: {
          tripStart: formData.endpoints.tripStart,
          tripEnd: formData.endpoints.tripStart,
          accommodations: formData.endpoints.accommodations,
        },
      })
    } else if (!checked) {
      updateFormData({
        endpoints: {
          tripStart: formData.endpoints?.tripStart || null,
          tripEnd: null,
          accommodations: formData.endpoints?.accommodations || [],
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* カレンダーCard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-5 w-5" />
            旅行日程を選択
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            locale={ja}
            numberOfMonths={1}
            className="mx-auto"
          />

          {/* 選択結果表示エリア */}
          {hasCompleteDates && range.from && range.to && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    選択した日程
                  </p>
                  <div className="mt-1.5 text-sm text-green-700 dark:text-green-300">
                    <span>
                      {range.from.getFullYear()}/{range.from.getMonth() + 1}/{range.from.getDate()}〜
                      {range.to.getFullYear()}/{range.to.getMonth() + 1}/{range.to.getDate()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-green-100 px-3 py-1.5 dark:bg-green-900/50">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-base font-bold text-green-900 dark:text-green-100">
                      {formatDuration(range.from, range.to)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* エンドポイント入力Card（日程が選択された後に表示） */}
      {hasCompleteDates && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinned className="h-5 w-5" />
              出発地・宿泊先・目的地を設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            {/* 説明文 */}
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  出発地や宿泊先を入れると、観光ルートを自動で最適化します
                </p>
              </div>
            </div>

            {/* 出発地点入力 */}
            <div>
              <EndpointInput
                label="出発地点"
                placeholder="東京駅、羽田空港などを検索..."
                searchType="station"
                value={formData.endpoints?.tripStart || null}
                onSelect={handleStartPointSelect}
                onClear={handleStartPointClear}
                required
              />
            </div>

            {/* 宿泊施設入力（宿泊数が1以上の場合のみ表示） */}
            {nights > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">宿泊施設</span>
                </div>
                {Array.from({ length: nights }, (_, i) => (
                  <EndpointInput
                    key={i}
                    label={`${i + 1}日目の宿泊施設`}
                    placeholder="ホテル名、旅館名などを検索..."
                    searchType="accommodation"
                    value={formData.endpoints?.accommodations[i] || null}
                    onSelect={(place) => handleAccommodationSelect(i, place)}
                    onClear={() => handleAccommodationClear(i)}
                  />
                ))}
              </div>
            )}

            {/* 最終目的地入力 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="same-as-start"
                  checked={sameAsStart}
                  onCheckedChange={handleSameAsStartChange}
                  disabled={!formData.endpoints?.tripStart}
                />
                <label
                  htmlFor="same-as-start"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  最終目的地を出発地点と同じにする
                </label>
              </div>

              {!sameAsStart && (
                <EndpointInput
                  label="最終目的地"
                  placeholder="東京駅、羽田空港などを検索..."
                  searchType="station"
                  value={formData.endpoints?.tripEnd || null}
                  onSelect={handleGoalPointSelect}
                  onClear={handleGoalPointClear}
                  required
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
