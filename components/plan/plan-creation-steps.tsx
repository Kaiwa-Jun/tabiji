'use client'

import { usePlanForm } from '@/contexts/plan-form-context'
import { StepIndicator } from './step-indicator'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { DateInputStep } from './steps/date-input'
import { SpotSelectionStep } from './steps/spot-selection'
import { PreviewStep } from './steps/preview'
import { CompletionStep } from './steps/completion'

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
  const { formData, nextStep, prevStep } = usePlanForm()

  /**
   * 次のステップに進めるかを検証
   */
  const canGoNext = (): boolean => {
    switch (formData.currentStep) {
      case 1:
        // ステップ1: 日程入力 - 開始日と終了日が必須
        return formData.startDate !== null && formData.endDate !== null
      case 2:
        // ステップ2: スポット選択 - 最低1つのスポット（マスタorカスタム）
        return formData.selectedSpots.length > 0 || formData.customSpots.length > 0
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
        return <PreviewStep />
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
    if (formData.currentStep === 3) {
      return 'プランを保存'
    }
    return '次へ'
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ステップインジケーター（ヘッダー） */}
      <StepIndicator currentStep={formData.currentStep} />

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-hidden">
        {formData.currentStep === 2 ? (
          // ステップ2（マップ）はパディングなしで画面いっぱいに表示
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
          <div className="flex items-center gap-3">
            {/* 戻るボタン（ステップ1では非表示） */}
            {formData.currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="h-12 flex-1"
                size="lg"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                戻る
              </Button>
            )}

            {/* 次へボタン */}
            <Button
              onClick={nextStep}
              disabled={!canGoNext()}
              className="h-12 flex-1 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
              size="lg"
            >
              {getNextButtonLabel()}
              {formData.currentStep < 3 && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
