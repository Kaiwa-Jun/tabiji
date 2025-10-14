'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type { PlanFormData } from '@/types/models'

/**
 * プランフォームContextの型定義
 */
interface PlanFormContextType {
  /** フォームデータ */
  formData: PlanFormData
  /** フォームデータを部分更新する関数 */
  updateFormData: (data: Partial<PlanFormData>) => void
  /** 次のステップに進む関数 */
  nextStep: () => void
  /** 前のステップに戻る関数 */
  prevStep: () => void
  /** フォームをリセットする関数 */
  resetForm: () => void
}

/**
 * プランフォームContext
 */
const PlanFormContext = createContext<PlanFormContextType | undefined>(undefined)

/**
 * プランフォームプロバイダーのProps
 */
interface PlanFormProviderProps {
  children: ReactNode
}

/**
 * LocalStorageのキー定義
 */
const STORAGE_KEY = 'planFormData'

/**
 * 初期フォームデータ
 */
const initialFormData: PlanFormData = {
  startDate: null,
  endDate: null,
  region: null,
  prefecture: null,
  selectedSpots: [],
  customSpots: [],
  currentStep: 1,
  isComplete: false,
}

/**
 * LocalStorageに保存する際のデータ型
 * Date型は文字列として保存される
 */
interface StoredPlanFormData extends Omit<PlanFormData, 'startDate' | 'endDate'> {
  startDate: string | null
  endDate: string | null
}

/**
 * プランフォームプロバイダー
 * プラン作成フローの状態を管理し、LocalStorageに自動保存する
 *
 * @example
 * ```tsx
 * <PlanFormProvider>
 *   <PlanCreationSteps />
 * </PlanFormProvider>
 * ```
 */
export function PlanFormProvider({ children }: PlanFormProviderProps) {
  const [formData, setFormData] = useState<PlanFormData>(initialFormData)
  const [isHydrated, setIsHydrated] = useState(false)

  /**
   * 初回マウント時にLocalStorageからデータを復元
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: StoredPlanFormData = JSON.parse(saved)

        // Date型の復元（ISO文字列 → Dateオブジェクト）
        const restored: PlanFormData = {
          ...parsed,
          startDate: parsed.startDate ? new Date(parsed.startDate) : null,
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        }

        setFormData(restored)
        console.log('[PlanFormContext] Restored from localStorage:', {
          currentStep: restored.currentStep,
          hasStartDate: !!restored.startDate,
          hasEndDate: !!restored.endDate,
        })
      }
    } catch (error) {
      console.error('[PlanFormContext] Failed to restore from localStorage:', error)
      // 復元失敗時は初期値を使用
    } finally {
      setIsHydrated(true)
    }
  }, [])

  /**
   * フォームデータが変更されたらLocalStorageに保存
   * 初回のハイドレーション時はスキップ
   * 初期値と完全一致する場合もスキップ（リセット後の不要な保存を防ぐ）
   */
  useEffect(() => {
    if (!isHydrated) return

    // 初期値と完全一致する場合はLocalStorageから削除
    if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
      try {
        localStorage.removeItem(STORAGE_KEY)
        console.log('[PlanFormContext] Removed from localStorage (initial state)')
      } catch (error) {
        console.error('[PlanFormContext] Failed to remove from localStorage:', error)
      }
      return
    }

    try {
      // Date型の変換（Dateオブジェクト → ISO文字列）
      const toStore: StoredPlanFormData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
      console.log('[PlanFormContext] Saved to localStorage')
    } catch (error) {
      console.error('[PlanFormContext] Failed to save to localStorage:', error)
      // 保存失敗時もユーザー体験を損なわないため、エラーは握りつぶす
    }
  }, [formData, isHydrated])

  /**
   * フォームデータを部分更新
   */
  const updateFormData = (data: Partial<PlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  /**
   * 次のステップに進む
   * 最大ステップ数は4
   */
  const nextStep = () => {
    setFormData((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4),
    }))
  }

  /**
   * 前のステップに戻る
   * 最小ステップ数は1
   */
  const prevStep = () => {
    setFormData((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }))
  }

  /**
   * フォームをリセット
   * LocalStorageからもデータを削除
   */
  const resetForm = () => {
    setFormData(initialFormData)
    // useEffectで初期値と判定され、自動的にLocalStorageから削除される
  }

  // Context値をメモ化して不要な再レンダリングを防ぐ
  const value: PlanFormContextType = useMemo(
    () => ({
      formData,
      updateFormData,
      nextStep,
      prevStep,
      resetForm,
    }),
    [formData]
  )

  return <PlanFormContext.Provider value={value}>{children}</PlanFormContext.Provider>
}

/**
 * プランフォームContextを使用するためのカスタムフック
 *
 * @throws PlanFormProviderの外で使用された場合にエラー
 * @returns プランフォームの状態と操作関数
 *
 * @example
 * ```tsx
 * function Step1() {
 *   const { formData, updateFormData, nextStep } = usePlanForm()
 *
 *   const handleDateChange = (startDate: Date, endDate: Date) => {
 *     updateFormData({ startDate, endDate })
 *     nextStep()
 *   }
 *
 *   return (
 *     <div>
 *       <DatePicker
 *         startDate={formData.startDate}
 *         endDate={formData.endDate}
 *         onChange={handleDateChange}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function usePlanForm() {
  const context = useContext(PlanFormContext)

  if (context === undefined) {
    throw new Error('usePlanForm must be used within PlanFormProvider')
  }

  return context
}
