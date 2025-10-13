/**
 * プラン関連の型定義
 *
 * Zodスキーマから生成された型と、既存のモデル型を統合的に管理します。
 */

import type { z } from 'zod'
import type {
  dateInputSchema,
  areaSelectionSchema,
  spotSelectionSchema,
  planSchema,
  spotSchema,
  customSpotSchema,
} from '@/lib/schemas/plan'

// ========================================
// Zodスキーマから生成される型
// ========================================

/**
 * 日程入力フォームのデータ型
 * ステップ1で使用
 */
export type DateInputFormData = z.infer<typeof dateInputSchema>

/**
 * エリア選択フォームのデータ型
 * ステップ2で使用
 */
export type AreaSelectionFormData = z.infer<typeof areaSelectionSchema>

/**
 * スポット選択フォームのデータ型
 * ステップ3で使用
 */
export type SpotSelectionFormData = z.infer<typeof spotSelectionSchema>

/**
 * プラン全体のフォームデータ型
 * 最終的な保存時に使用
 */
export type PlanSchemaData = z.infer<typeof planSchema>

/**
 * スポット型（Zodスキーマから生成）
 */
export type SpotFormData = z.infer<typeof spotSchema>

/**
 * カスタムスポット型（Zodスキーマから生成）
 */
export type CustomSpotFormData = z.infer<typeof customSpotSchema>

// ========================================
// 既存のモデル型を再エクスポート
// ========================================

/**
 * プラン作成フォーム全体の状態管理用型
 * Context + LocalStorageで使用
 *
 * @remarks
 * この型はcontexts/plan-form-context.tsxで使用されています
 */
export type { PlanFormData } from './models'

/**
 * カスタムスポット型
 * 既存のmodels.tsから
 */
export type { CustomSpot } from './models'

/**
 * スポット型（データベース）
 * 既存のmodels.tsから
 */
export type { Spot } from './models'

// ========================================
// データベース型の再エクスポート
// ========================================

/**
 * 旅行プラン（Row型）
 */
export type { TravelPlan } from './models'

/**
 * プランの日程（Row型）
 */
export type { PlanDay } from './models'

/**
 * プランのスポット（Row型）
 */
export type { PlanSpot } from './models'

/**
 * プランメンバー（Row型）
 */
export type { PlanMember } from './models'

/**
 * プラン共有設定（Row型）
 */
export type { PlanShare } from './models'

// ========================================
// Insert/Update型の再エクスポート
// ========================================

/**
 * 旅行プラン作成時の型
 */
export type { TravelPlanInsert } from './models'

/**
 * プラン日程作成時の型
 */
export type { PlanDayInsert } from './models'

/**
 * プランスポット作成時の型
 */
export type { PlanSpotInsert } from './models'

/**
 * プランメンバー作成時の型
 */
export type { PlanMemberInsert } from './models'

/**
 * プラン共有設定作成時の型
 */
export type { PlanShareInsert } from './models'

// ========================================
// バリデーション結果型
// ========================================

/**
 * バリデーション成功時の型
 */
export interface ValidationSuccess<T> {
  success: true
  data: T
  errors?: never
}

/**
 * バリデーション失敗時の型
 */
export interface ValidationError {
  success: false
  data?: never
  errors: Record<string, string[]>
}

/**
 * バリデーション結果の型
 * safeParse()の結果をラップして返す際に使用
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError
