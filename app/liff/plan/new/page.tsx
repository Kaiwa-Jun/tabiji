/**
 * プラン作成ページ
 * 新しい旅行プランを作成
 */

import { PlanFormProvider } from '@/contexts/plan-form-context'
import { PlanCreationSteps } from '@/components/plan/plan-creation-steps'

/**
 * プラン作成ページ（Context Provider付き）
 */
export default function NewPlanPage() {
  return (
    <PlanFormProvider>
      <PlanCreationSteps />
    </PlanFormProvider>
  )
}
