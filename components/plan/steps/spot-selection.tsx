'use client'

import { usePlanForm } from '@/contexts/plan-form-context'

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * TODO: 実際のスポット選択UIを実装（別issue）
 */
export function SpotSelectionStep() {
  const { formData } = usePlanForm()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">📍 スポットを選択</h2>
        <p className="mt-1 text-sm text-gray-600">訪問したいスポットを選択してください</p>
      </div>

      {/* プレースホルダー */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-center text-gray-500">
          <p className="text-sm">スポット選択UIは準備中です</p>
          <p className="mt-2 text-xs">
            選択済みスポット: {formData.selectedSpots.length}件
            <br />
            カスタムスポット: {formData.customSpots.length}件
          </p>
        </div>

        {/* 実装予定メッセージ */}
        <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-800">
            ℹ️ スポット検索・地図選択UIは別issueで実装予定です
          </p>
        </div>
      </div>
    </div>
  )
}
