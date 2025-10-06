/**
 * LIFF初期化処理
 * Client Componentでのみ使用可能
 */

import liff from '@line/liff'
import type { LiffInitConfig, LiffInitResult } from './types'

/**
 * LIFF SDKを初期化する
 * @param config - LIFF初期化設定（省略時は環境変数から取得）
 * @returns 初期化結果
 */
export async function initializeLiff(
  config?: LiffInitConfig
): Promise<LiffInitResult> {
  try {
    // ブラウザ環境でのみ実行可能
    if (typeof window === 'undefined') {
      throw new Error('LIFF can only be initialized in browser environment')
    }

    // LIFF IDの取得（引数 > 環境変数）
    const liffId = config?.liffId || process.env.NEXT_PUBLIC_LIFF_ID

    if (!liffId) {
      throw new Error(
        'LIFF ID is not defined. Please set NEXT_PUBLIC_LIFF_ID in .env.local'
      )
    }

    // LIFF SDK初期化
    await liff.init({
      liffId,
      withLoginOnExternalBrowser: config?.withLoginOnExternalBrowser ?? true,
    })

    // ログイン状態の確認
    if (!liff.isLoggedIn()) {
      // 未ログイン時は自動的にログイン画面へリダイレクト
      liff.login()
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('LIFF initialization failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * LIFFが初期化済みかどうかをチェックする
 * @returns 初期化済みの場合true
 */
export function isLiffInitialized(): boolean {
  try {
    // ブラウザ環境でない場合はfalse
    if (typeof window === 'undefined') {
      return false
    }

    // LIFF SDKの初期化状態とログイン状態を確認
    return liff.isLoggedIn()
  } catch {
    return false
  }
}

/**
 * LIFF SDKのバージョンを取得する
 * @returns LIFFバージョン文字列（例: "2.26.1"）
 */
export function getLiffVersion(): string {
  try {
    return liff.getVersion()
  } catch {
    return 'unknown'
  }
}
