/**
 * LIFF関連の型定義
 */

/**
 * LIFFユーザープロフィール
 */
export interface LiffUserProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

/**
 * LIFF初期化設定
 */
export interface LiffInitConfig {
  liffId: string
  withLoginOnExternalBrowser?: boolean
}

/**
 * LIFF初期化結果
 */
export interface LiffInitResult {
  success: boolean
  error?: Error
}

/**
 * LIFF環境情報
 */
export interface LiffEnvironment {
  isInClient: boolean // LINEアプリ内で動作しているか
  os: string // OS種別（ios, android, web）
  language: string // 言語設定
  version: string // LIFF SDKバージョン
}
