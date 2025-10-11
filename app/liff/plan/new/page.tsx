/**
 * プラン作成ページ
 * 新しい旅行プランを作成
 */

'use client'

import Link from 'next/link'
import { PlanFormProvider, usePlanForm } from '@/contexts/plan-form-context'

/**
 * プラン作成フォームコンポーネント（Context内部）
 */
function NewPlanForm() {
  const { formData, updateFormData, nextStep, prevStep, resetForm } = usePlanForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Server Actionでプラン作成
    console.log('プラン作成:', {
      startDate: formData.startDate,
      endDate: formData.endDate,
      region: formData.region,
      prefecture: formData.prefecture,
    })

    alert('プラン作成機能は実装中です')
  }

  // Date → input[type="date"]用の文字列に変換
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  // input[type="date"]の文字列 → Dateに変換
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    updateFormData({
      [field]: value ? new Date(value) : null,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ➕ 新しいプラン
          </h1>
          <p className="text-sm text-gray-600">
            旅行プランの基本情報を入力してください
          </p>
          {/* デバッグ情報 */}
          <p className="text-xs text-gray-400 mt-2">
            現在のステップ: {formData.currentStep} / 5
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 日程 */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              日程 <span className="text-red-500">*</span>
            </h3>

            <label className="block">
              <span className="text-sm text-gray-600">出発日</span>
              <input
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">帰着日</span>
              <input
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>

          {/* デバッグ用ステップ操作ボタン */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-yellow-800 mb-2">
              デバッグ用コントロール
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                ← 前のステップ
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
              >
                次のステップ →
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300"
              >
                リセット
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              プランを作成（開発中）
            </button>

            <Link
              href="/liff/plans"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>

        {/* フッター */}
        <div className="mt-6 pt-6 border-t border-gray-200">
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

/**
 * プラン作成ページ（Context Provider付き）
 */
export default function NewPlanPage() {
  return (
    <PlanFormProvider>
      <NewPlanForm />
    </PlanFormProvider>
  )
}
