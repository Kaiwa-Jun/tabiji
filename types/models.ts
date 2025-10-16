/**
 * データベース型のエイリアス定義
 *
 * database.tsから生成された型をより使いやすい形で提供します。
 * このファイルは手動で編集可能です。
 */

import type { Database } from './database'
import type { PlaceResult } from '@/lib/maps/places'
import type { RouteInfo } from '@/lib/maps/directions'
import type { TimeSlot, OptimizedSpot } from '@/lib/itinerary'

// ========================================
// Row型（データ取得時）
// ========================================

/**
 * ユーザー情報
 */
export type User = Database['public']['Tables']['users']['Row']

/**
 * ユーザー設定
 */
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

/**
 * LINEグループ情報
 */
export type LineGroup = Database['public']['Tables']['line_groups']['Row']

/**
 * 旅行プラン
 */
export type TravelPlan = Database['public']['Tables']['travel_plans']['Row']

/**
 * プランの日程
 */
export type PlanDay = Database['public']['Tables']['plan_days']['Row']

/**
 * プランのスポット
 */
export type PlanSpot = Database['public']['Tables']['plan_spots']['Row']

/**
 * プランのメンバー
 */
export type PlanMember = Database['public']['Tables']['plan_members']['Row']

/**
 * プランの共有設定
 */
export type PlanShare = Database['public']['Tables']['plan_shares']['Row']

/**
 * スポット（マスタデータ）
 */
export type Spot = Database['public']['Tables']['spots']['Row']

// ========================================
// Insert型（新規作成時）
// ========================================

/**
 * ユーザー作成時の型
 */
export type UserInsert = Database['public']['Tables']['users']['Insert']

/**
 * ユーザー設定作成時の型
 */
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']

/**
 * LINEグループ作成時の型
 */
export type LineGroupInsert = Database['public']['Tables']['line_groups']['Insert']

/**
 * 旅行プラン作成時の型
 */
export type TravelPlanInsert = Database['public']['Tables']['travel_plans']['Insert']

/**
 * プラン日程作成時の型
 */
export type PlanDayInsert = Database['public']['Tables']['plan_days']['Insert']

/**
 * プランスポット作成時の型
 */
export type PlanSpotInsert = Database['public']['Tables']['plan_spots']['Insert']

/**
 * プランメンバー作成時の型
 */
export type PlanMemberInsert = Database['public']['Tables']['plan_members']['Insert']

/**
 * プラン共有設定作成時の型
 */
export type PlanShareInsert = Database['public']['Tables']['plan_shares']['Insert']

/**
 * スポット作成時の型
 */
export type SpotInsert = Database['public']['Tables']['spots']['Insert']

// ========================================
// Update型（更新時）
// ========================================

/**
 * ユーザー更新時の型
 */
export type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * ユーザー設定更新時の型
 */
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

/**
 * LINEグループ更新時の型
 */
export type LineGroupUpdate = Database['public']['Tables']['line_groups']['Update']

/**
 * 旅行プラン更新時の型
 */
export type TravelPlanUpdate = Database['public']['Tables']['travel_plans']['Update']

/**
 * プラン日程更新時の型
 */
export type PlanDayUpdate = Database['public']['Tables']['plan_days']['Update']

/**
 * プランスポット更新時の型
 */
export type PlanSpotUpdate = Database['public']['Tables']['plan_spots']['Update']

/**
 * プランメンバー更新時の型
 */
export type PlanMemberUpdate = Database['public']['Tables']['plan_members']['Update']

/**
 * プラン共有設定更新時の型
 */
export type PlanShareUpdate = Database['public']['Tables']['plan_shares']['Update']

/**
 * スポット更新時の型
 */
export type SpotUpdate = Database['public']['Tables']['spots']['Update']

// ========================================
// プラン作成フロー用の型定義
// ========================================

/**
 * カスタムスポット（ユーザーが手動で追加するスポット）
 */
export interface CustomSpot {
  /** スポット名 */
  name: string
  /** 緯度 */
  lat: number
  /** 経度 */
  lng: number
  /** 住所（オプション） */
  address?: string
  /** カテゴリ（オプション） */
  category?: string
}

/**
 * プラン作成フォームのデータ
 * Context + LocalStorageで管理される状態
 */
export interface PlanFormData {
  // ステップ1: 日程
  /** 開始日 */
  startDate: Date | null
  /** 終了日 */
  endDate: Date | null

  // ステップ2: エリア
  /** 地方（例: 関東） */
  region: string | null
  /** 都道府県（例: 東京都） */
  prefecture: string | null

  // ステップ3: スポット
  /** 選択されたスポット（マスタから） */
  selectedSpots: Spot[]
  /** カスタムスポット（手動追加） */
  customSpots: CustomSpot[]

  // プレビューモード関連
  /** プレビューモード中かどうか */
  isPreviewMode: boolean
  /** 選択されたスポット数（SearchModalContextから同期） */
  selectedSpotsCount: number
  /** 最適化されたスポット順序 */
  optimizedSpots: PlaceResult[]
  /** スポット間のルート情報 */
  routeInfo: RouteInfo[]
  /** 各スポットの訪問時刻情報 */
  timeSlots: Map<string, TimeSlot> | null
  /** 日ごとに配分されたスポット */
  dayPlan: Map<number, OptimizedSpot[]> | null

  // メタ情報
  /** 現在のステップ（1-5） */
  currentStep: number
  /** プラン作成完了フラグ */
  isComplete: boolean
}
