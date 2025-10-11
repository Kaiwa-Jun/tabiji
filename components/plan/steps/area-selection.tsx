'use client'

import { usePlanForm } from '@/contexts/plan-form-context'

/**
 * ステップ2: エリア選択コンポーネント
 * 旅行先の地方と都道府県を選択するステップ
 * TODO: 実際のエリア選択UIを実装（別issue）
 */
export function AreaSelectionStep() {
  const { formData, updateFormData } = usePlanForm()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">🗾 エリアを選択</h2>
        <p className="mt-1 text-sm text-gray-600">旅行先の地方と都道府県を選択してください</p>
      </div>

      {/* プレースホルダー */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              地方 <span className="text-red-500">*</span>
            </label>
            <select
              id="region"
              value={formData.region ?? ''}
              onChange={(e) => updateFormData({ region: e.target.value || null })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="hokkaido">北海道</option>
              <option value="tohoku">東北</option>
              <option value="kanto">関東</option>
              <option value="chubu">中部</option>
              <option value="kinki">近畿</option>
              <option value="chugoku">中国</option>
              <option value="shikoku">四国</option>
              <option value="kyushu">九州</option>
            </select>
          </div>

          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700">
              都道府県 <span className="text-red-500">*</span>
            </label>
            <input
              id="prefecture"
              type="text"
              value={formData.prefecture ?? ''}
              onChange={(e) => updateFormData({ prefecture: e.target.value || null })}
              placeholder="例: 東京都"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 実装予定メッセージ */}
        <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-800">
            ℹ️ 地図ベースのエリア選択UIは別issueで実装予定です
          </p>
        </div>
      </div>
    </div>
  )
}
