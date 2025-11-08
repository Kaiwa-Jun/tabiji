/**
 * プラン詳細ページ
 * 保存された旅行プランの詳細情報を表示
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, Calendar, MapPin, Clock } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * 日付をフォーマットする関数
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 曜日を取得する関数
 */
function getDayOfWeek(dateString: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const date = new Date(dateString)
  return days[date.getDay()]
}

/**
 * 時刻をフォーマットする関数 (HH:MM:SS → HH:MM)
 */
function formatTime(timeString: string | null): string {
  if (!timeString) return '-'
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // プラン基本情報を取得
  const { data: plan, error: planError } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (planError || !plan) {
    console.error('[PlanDetailPage] Failed to fetch plan:', planError)
    return notFound()
  }

  // 日程情報を取得（スポット情報含む）
  const { data: planDays, error: daysError } = await supabase
    .from('plan_days')
    .select(
      `
      *,
      plan_spots (
        *,
        spot:spots (*)
      )
    `
    )
    .eq('plan_id', id)
    .order('day_number', { ascending: true })

  if (daysError) {
    console.error('[PlanDetailPage] Failed to fetch plan days:', daysError)
  }

  const days = planDays || []

  // 日数を計算
  const startDate = new Date(plan.start_date)
  const endDate = new Date(plan.end_date)
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/liff/plans"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 truncate">{plan.title}</h1>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* プラン概要 */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">
              {formatDate(plan.start_date)} ({getDayOfWeek(plan.start_date)}) -{' '}
              {formatDate(plan.end_date)} ({getDayOfWeek(plan.end_date)})
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>{plan.area || 'エリア未設定'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>{diffDays}日間の旅程</span>
            <span className="mx-2">•</span>
            <span>
              {plan.display_mode === 'with_time' ? '時刻付きプラン' : '順序のみプラン'}
            </span>
          </div>
        </div>

        {/* 日程詳細 */}
        {days.length > 0 ? (
          <div className="space-y-4">
            {days.map((day) => {
              const dayDate = new Date(day.date)
              const spots = (day.plan_spots || []).sort((a, b) => a.order_index - b.order_index)

              return (
                <div key={day.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* 日付ヘッダー */}
                  <div className="bg-blue-600 text-white px-4 py-3">
                    <div className="font-bold text-lg">
                      {day.day_number}日目
                    </div>
                    <div className="text-sm text-blue-100">
                      {formatDate(day.date)} ({getDayOfWeek(day.date)})
                    </div>
                  </div>

                  {/* スタート地点 */}
                  <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        START
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {(day.start_point as { name?: string })?.name || 'スタート地点'}
                        </div>
                        {(day.start_point as { address?: string })?.address && (
                          <div className="text-sm text-gray-600 mt-1">
                            {(day.start_point as { address?: string }).address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* スポット一覧 */}
                  {spots.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {spots.map((planSpot, index) => {
                        const spot = planSpot.is_custom
                          ? {
                              name: planSpot.custom_name || '不明',
                              address: (planSpot.custom_location as { address?: string })?.address,
                              photo_url: null,
                            }
                          : planSpot.spot

                        return (
                          <div key={planSpot.id} className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              {/* 番号 */}
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                {index + 1}
                              </div>

                              {/* スポット情報 */}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900">
                                  {spot?.name || '不明なスポット'}
                                </div>
                                {spot?.address && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {spot.address}
                                  </div>
                                )}

                                {/* 時刻情報 */}
                                {plan.display_mode === 'with_time' && (
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>到着: {formatTime(planSpot.arrival_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>出発: {formatTime(planSpot.departure_time)}</span>
                                    </div>
                                    {planSpot.duration_minutes && (
                                      <span className="text-blue-600">
                                        滞在 {planSpot.duration_minutes}分
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      スポットが登録されていません
                    </div>
                  )}

                  {/* ゴール地点 */}
                  <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        GOAL
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {(day.end_point as { name?: string })?.name || 'ゴール地点'}
                        </div>
                        {(day.end_point as { address?: string })?.address && (
                          <div className="text-sm text-gray-600 mt-1">
                            {(day.end_point as { address?: string }).address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">日程情報が登録されていません</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/liff/plans"
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-center font-semibold hover:bg-gray-200 transition-colors"
          >
            一覧に戻る
          </Link>
          {plan.created_by === user.id && (
            <Link
              href={`/liff/plan/${plan.id}/edit`}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
            >
              編集
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
