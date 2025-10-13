'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Info, Clock, MapPin, Check } from 'lucide-react'
import { ja } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { usePlanForm } from '@/contexts/plan-form-context'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration, formatJapaneseDate } from '@/lib/utils/date'

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

  return (
    <div>
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
                  <div className="mt-1.5 space-y-1 text-sm text-green-700 dark:text-green-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>開始日: {formatJapaneseDate(range.from)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>終了日: {formatJapaneseDate(range.to)}</span>
                    </div>
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
    </div>
  )
}
