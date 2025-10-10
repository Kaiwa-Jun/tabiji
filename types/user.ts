/**
 * ユーザー関連の型定義
 */
import { Database } from './database'

// Supabase usersテーブルの型
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * LIFFから取得するユーザープロフィール情報
 */
export interface LiffUserProfile {
  /** LINE User ID */
  userId: string
  /** 表示名 */
  displayName: string
  /** プロフィール画像URL（オプション） */
  pictureUrl?: string
  /** ステータスメッセージ（オプション） */
  statusMessage?: string
}
