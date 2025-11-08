/**
 * プラン一覧ページ
 * 作成した旅行プランの一覧を表示
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { TravelPlan } from '@/types/models'

/**
 * 日数を計算する関数
 */
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

/**
 * 日付をフォーマットする関数
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

export default async function PlansPage() {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link
            href="/liff"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    )
  }

  // プラン一覧を取得（RLSポリシーで自動的に作成したプランのみ取得）
  const { data: plans, error } = await supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[PlansPage] Failed to fetch plans:', error)
  }

  const travelPlans = (plans || []) as TravelPlan[]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 プラン一覧</h1>
          <Link
            href="/liff/plan/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            ＋ 新規作成
          </Link>
        </div>

        {/* プラン一覧 */}
        {travelPlans.length > 0 ? (
          <div className="space-y-3">
            {travelPlans.map((plan) => {
              const days = calculateDays(plan.start_date, plan.end_date)
              const isOwner = plan.created_by === user.id

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                    {isOwner && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        作成者
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">
                      {formatDate(plan.start_date)} - {formatDate(plan.end_date)} ({days}日間)
                    </p>
                    {plan.area && (
                      <p className="text-sm text-gray-500">📍 {plan.area}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/liff/plan/${plan.id}`}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm text-center hover:bg-gray-200 transition-colors"
                    >
                      詳細
                    </Link>
                    {isOwner && (
                      <Link
                        href={`/liff/plan/${plan.id}/edit`}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        編集
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">まだプランがありません</p>
            <Link
              href="/liff/plan/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              最初のプランを作成
            </Link>
          </div>
        )}

        {/* フッターナビゲーション */}
        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/liff"
            className="block text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
