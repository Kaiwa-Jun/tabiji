'use client'

import { usePlanForm } from '@/contexts/plan-form-context'

/**
 * ステップ4: プレビューコンポーネント
 * 入力内容を確認し、プランを保存する前の最終確認ステップ
 * TODO: 実際のプレビューUIを実装（別issue）
 */
export function PreviewStep() {
  const { formData } = usePlanForm()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">👀 プレビュー</h2>
        <p className="mt-1 text-sm text-gray-600">入力内容を確認してください</p>
      </div>

      {/* プレビュー内容 */}
      <div className="space-y-4">
        {/* 日程 */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-700">📅 日程</h3>
          <div className="mt-2 text-sm text-gray-600">
            {formData.startDate && formData.endDate ? (
              <>
                {formData.startDate.toLocaleDateString('ja-JP')} 〜{' '}
                {formData.endDate.toLocaleDateString('ja-JP')}
              </>
            ) : (
              '未設定'
            )}
          </div>
        </div>

        {/* エリア */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-700">🗾 エリア</h3>
          <div className="mt-2 text-sm text-gray-600">
            {formData.region && formData.prefecture
              ? `${formData.region} - ${formData.prefecture}`
              : '未設定'}
          </div>
        </div>

        {/* スポット */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-700">📍 スポット</h3>
          <div className="mt-2 text-sm text-gray-600">
            選択済み: {formData.selectedSpots.length}件
            <br />
            カスタム: {formData.customSpots.length}件
          </div>
        </div>

        {/* 実装予定メッセージ */}
        <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-800">
            ℹ️ 詳細なプレビュー表示（地図・ルート等）は別issueで実装予定です
          </p>
        </div>
      </div>
    </div>
  )
}
