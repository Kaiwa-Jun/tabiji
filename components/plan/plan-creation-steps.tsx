'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanForm } from '@/contexts/plan-form-context'
import { StepIndicator } from './step-indicator'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { DateInputStep } from './steps/date-input'
import { SpotSelectionStep } from './steps/spot-selection'
import { CompletionStep } from './steps/completion'
import { savePlan } from '@/actions/plans'

/**
 * プラン作成ステップコンポーネント
 * ステップインジケーター、コンテンツ、ナビゲーションボタンを統合したメインコンテナ
 *
 * @example
 * ```tsx
 * <PlanFormProvider>
 *   <PlanCreationSteps />
 * </PlanFormProvider>
 * ```
 */
export function PlanCreationSteps() {
  const { formData, nextStep, prevStep, updateFormData } = usePlanForm()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  /**
   * 次のステップに進めるかを検証
   */
  const canGoNext = (): boolean => {
    switch (formData.currentStep) {
      case 1:
        // ステップ1: 日程入力 - 開始日と終了日が必須
        return formData.startDate !== null && formData.endDate !== null
      case 2:
        // ステップ2: スポット選択 - 2箇所以上のスポット選択が必要
        return formData.selectedSpotsCount >= 2
      case 3:
        // ステップ3: プレビュー - 常に次へ進める
        return true
      case 4:
        // ステップ4: 完了 - 最終ステップなので次へボタンは表示しない
        return false
      default:
        return false
    }
  }

  /**
   * 現在のステップに対応するコンテンツをレンダリング
   */
  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return <DateInputStep />
      case 2:
        return <SpotSelectionStep />
      case 3:
        // ステップ3はプレビューモード（スポット選択画面でタブ表示）
        return <SpotSelectionStep />
      case 4:
        return <CompletionStep />
      default:
        return null
    }
  }

  /**
   * 次へボタンのラベル
   */
  const getNextButtonLabel = (): string => {
    if (formData.currentStep === 2) {
      // ステップ2: スポット選択
      return 'プランを作成する'
    }
    if (formData.currentStep === 3) {
      // ステップ3: プレビュー
      return '保存'
    }
    return '次へ'
  }

  /**
   * 次へボタンのクリック処理
   */
  const handleNextClick = async () => {
    if (formData.currentStep === 2 && !formData.isPreviewMode) {
      // ステップ2で通常モードの場合: プラン作成処理を開始
      // ステップ3（プレビュー）に進み、プレビューモードを有効化
      updateFormData({ isPreviewMode: true, currentStep: 3 })
    } else if (formData.currentStep === 3 && formData.isPreviewMode) {
      // ステップ3でプレビューモードの場合: 保存処理
      setIsSaving(true)
      setSaveError(null)

      try {
        // プランのタイトルを生成（エリア + 旅行）
        const title =
          formData.region && formData.prefecture
            ? `${formData.prefecture}旅行`
            : '新しい旅行プラン'

        // Server Actionでプランを保存（認証はServer Action内で自動実行）
        const result = await savePlan(formData, title)

        if (result.success) {
          console.log('[PlanCreationSteps] Plan saved successfully:', result.planId)

          // 成功時: プラン一覧画面にリダイレクト
          router.push('/liff/plans')
        } else {
          // エラー時: エラーメッセージを表示
          console.error('[PlanCreationSteps] Save error:', result.error)
          setSaveError(result.error || 'プランの保存に失敗しました')
          setIsSaving(false)
        }
      } catch (error) {
        console.error('[PlanCreationSteps] Unexpected error:', error)
        setSaveError('予期しないエラーが発生しました')
        setIsSaving(false)
      }
    } else {
      // その他の場合: 通常の次へ処理
      nextStep()
    }
  }

  /**
   * 戻るボタンのクリック処理
   */
  const handlePrevClick = () => {
    if (formData.currentStep === 3 && formData.isPreviewMode) {
      // ステップ3でプレビューモードの場合: ステップ2に戻り、プレビューモードを解除
      updateFormData({
        currentStep: 2,
        isPreviewMode: false,
        optimizedSpots: [],
        routeInfo: [],
        timeSlots: null,
        dayPlan: null,
      })
    } else {
      // その他の場合: 通常の戻る処理
      prevStep()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ステップインジケーター（ヘッダー） */}
      <StepIndicator currentStep={formData.currentStep} />

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-hidden">
        {formData.currentStep === 2 || formData.currentStep === 3 ? (
          // ステップ2・3（マップ）はパディングなしで画面いっぱいに表示
          <div className="h-full">{renderStep()}</div>
        ) : (
          // その他のステップはパディング付き、スクロールなし、上寄せ、デスクトップで中央揃え
          <div className="h-full overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto p-4">{renderStep()}</div>
          </div>
        )}
      </div>

      {/* ナビゲーションボタン（フッター） */}
      {formData.currentStep < 4 && (
        <div className="border-t bg-background p-4">
          {/* エラーメッセージ */}
          {saveError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {saveError}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* 戻るボタン（ステップ1では非表示） */}
            {formData.currentStep > 1 && (
              <Button
                onClick={handlePrevClick}
                variant="outline"
                className="h-12 flex-1"
                size="lg"
                disabled={isSaving}
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                戻る
              </Button>
            )}

            {/* 次へボタン */}
            <Button
              onClick={handleNextClick}
              disabled={!canGoNext() || isSaving}
              className="h-12 flex-1 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
              size="lg"
            >
              {isSaving ? '保存中...' : getNextButtonLabel()}
              {formData.currentStep < 3 && !isSaving && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
