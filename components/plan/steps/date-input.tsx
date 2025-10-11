'use client'

import { usePlanForm } from '@/contexts/plan-form-context'

/**
 * ステップ1: 日程入力コンポーネント
 * 旅行の開始日と終了日を入力するステップ
 */
export function DateInputStep() {
  const { formData, updateFormData } = usePlanForm()

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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">📅 旅行日程を選択</h2>
        <p className="mt-1 text-sm text-gray-600">旅行の開始日と終了日を入力してください</p>
      </div>

      {/* 日程入力フォーム */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            出発日 <span className="text-red-500">*</span>
          </label>
          <input
            id="start-date"
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            帰着日 <span className="text-red-500">*</span>
          </label>
          <input
            id="end-date"
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            min={formatDateForInput(formData.startDate)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 旅程概要 */}
      {formData.startDate && formData.endDate && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">旅程概要</h3>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-blue-700">開始日:</dt>
              <dd className="font-medium text-blue-900">
                {formData.startDate.toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">終了日:</dt>
              <dd className="font-medium text-blue-900">
                {formData.endDate.toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">日数:</dt>
              <dd className="font-medium text-blue-900">
                {Math.ceil(
                  (formData.endDate.getTime() - formData.startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1}
                日間
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
