/**
 * プラン作成フォームのZodバリデーションスキーマ
 * 各ステップごとに段階的なバリデーションを提供
 */

import { z } from 'zod'
import { REGIONS, isPrefectureInRegion } from '@/lib/constants/areas'

// ========================================
// ステップ1: 日程入力
// ========================================

/**
 * 日程入力ステップのバリデーションスキーマ
 *
 * - 開始日・終了日は必須
 * - 終了日は開始日以降である必要がある
 * - 過去の日付も許可（思い出の記録用）
 */
export const dateInputSchema = z
  .object({
    startDate: z.date({
      message: '開始日を選択してください',
    }),
    endDate: z.date({
      message: '終了日を選択してください',
    }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: '終了日は開始日以降の日付を選択してください',
    path: ['endDate'],
  })

// ========================================
// ステップ2: エリア選択
// ========================================

/**
 * エリア選択ステップのバリデーションスキーマ
 *
 * - 地方は定義された地方リストから選択
 * - 都道府県は必須
 * - 選択された都道府県が地方に属するかチェック
 */
export const areaSelectionSchema = z
  .object({
    region: z.enum(REGIONS, {
      message: '地方を選択してください',
    }),
    prefecture: z.string().min(1, '都道府県を選択してください'),
  })
  .refine(
    (data) => {
      // 地方と都道府県の整合性チェック
      return isPrefectureInRegion(data.prefecture, data.region)
    },
    {
      message: '選択した地方に対応する都道府県を選択してください',
      path: ['prefecture'],
    }
  )

// ========================================
// ステップ3: スポット選択
// ========================================

/**
 * スポット情報のスキーマ（Google Maps APIまたはDB）
 */
export const spotSchema = z.object({
  /** スポットID（UUID） */
  id: z.string().uuid('無効なスポットIDです'),
  /** Google Place ID（オプション） */
  google_place_id: z.string().optional().nullable(),
  /** スポット名 */
  name: z.string().min(1, 'スポット名は必須です'),
  /** 住所 */
  address: z.string().optional().nullable(),
  /** 緯度 */
  latitude: z.number().min(-90, '緯度は-90以上である必要があります').max(90, '緯度は90以下である必要があります'),
  /** 経度 */
  longitude: z
    .number()
    .min(-180, '経度は-180以上である必要があります')
    .max(180, '経度は180以下である必要があります'),
  /** 写真URL */
  photo_url: z.string().url('無効なURLです').optional().nullable(),
  /** カテゴリ */
  category: z.string().optional().nullable(),
  /** 評価 */
  rating: z.number().min(0).max(5).optional().nullable(),
  /** メタデータ */
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  /** 作成日時 */
  created_at: z.string().optional(),
  /** 更新日時 */
  updated_at: z.string().optional(),
})

/**
 * カスタムスポット（ユーザー手動入力）のスキーマ
 */
export const customSpotSchema = z.object({
  /** スポット名（必須） */
  name: z.string().min(1, 'スポット名を入力してください').max(200, 'スポット名は200文字以内で入力してください'),
  /** 緯度 */
  lat: z.number().min(-90, '緯度は-90以上である必要があります').max(90, '緯度は90以下である必要があります'),
  /** 経度 */
  lng: z
    .number()
    .min(-180, '経度は-180以上である必要があります')
    .max(180, '経度は180以下である必要があります'),
  /** 住所（オプション） */
  address: z.string().max(500, '住所は500文字以内で入力してください').optional(),
  /** カテゴリ（オプション） */
  category: z.string().max(50, 'カテゴリは50文字以内で入力してください').optional(),
})

/**
 * スポット選択ステップのバリデーションスキーマ
 *
 * - 選択スポットまたはカスタムスポットが最低1つ必要
 * - 両方空の場合はエラー
 */
export const spotSelectionSchema = z
  .object({
    /** 選択されたスポット（DB/Google Maps） */
    selectedSpots: z.array(spotSchema).default([]),
    /** カスタムスポット（手動入力） */
    customSpots: z.array(customSpotSchema).default([]),
  })
  .refine((data) => data.selectedSpots.length > 0 || data.customSpots.length > 0, {
    message: '少なくとも1つのスポットを選択してください',
    path: ['selectedSpots'],
  })

// ========================================
// 全体のプランスキーマ
// ========================================

/**
 * プラン全体のバリデーションスキーマ
 * 最終的な保存時に使用
 */
export const planSchema = z.object({
  /** プランタイトル */
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください')
    .default('新しい旅行プラン'),

  /** 開始日 */
  startDate: dateInputSchema.shape.startDate,

  /** 終了日 */
  endDate: dateInputSchema.shape.endDate,

  /** 地方 */
  region: areaSelectionSchema.shape.region,

  /** 都道府県 */
  prefecture: areaSelectionSchema.shape.prefecture,

  /** 選択されたスポット */
  selectedSpots: spotSelectionSchema.shape.selectedSpots,

  /** カスタムスポット */
  customSpots: spotSelectionSchema.shape.customSpots,
})

// ========================================
// 型エクスポート（Zodスキーマから生成）
// ========================================

/** 日程入力フォームの型 */
export type DateInputFormData = z.infer<typeof dateInputSchema>

/** エリア選択フォームの型 */
export type AreaSelectionFormData = z.infer<typeof areaSelectionSchema>

/** スポット選択フォームの型 */
export type SpotSelectionFormData = z.infer<typeof spotSelectionSchema>

/** プラン全体のフォームデータ型 */
export type PlanSchemaData = z.infer<typeof planSchema>

/** スポット型 */
export type SpotFormData = z.infer<typeof spotSchema>

/** カスタムスポット型 */
export type CustomSpotFormData = z.infer<typeof customSpotSchema>
