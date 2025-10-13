'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

/**
 * ステップ定義
 */
interface Step {
  number: number
  label: string
}

const STEPS: Step[] = [
  { number: 1, label: '日程' },
  { number: 2, label: 'エリア' },
  { number: 3, label: 'スポット' },
  { number: 4, label: 'プレビュー' },
  { number: 5, label: '完了' },
]

interface StepIndicatorProps {
  /** 現在のステップ（1-5） */
  currentStep: number
}

/**
 * ステップインジケーターコンポーネント
 * 画面上部のヘッダーに表示され、プラン作成の進捗を可視化します
 *
 * @example
 * ```tsx
 * <StepIndicator currentStep={2} />
 * ```
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-background border-b">
      <div className="flex items-center justify-center h-14 px-4">
        {/* ステップインジケーター */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center shrink-0">
              {/* ステップサークル */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                    currentStep > step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : currentStep === step.number
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-[10px] font-medium">{step.number}</span>
                  )}
                </div>
                {/* ステップラベル */}
                <span
                  className={cn(
                    'mt-0.5 text-[10px] font-medium whitespace-nowrap',
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* 接続線 */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-4 transition-colors',
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
