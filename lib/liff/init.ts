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
  console.log('[LIFF Init] =================================')
  console.log('[LIFF Init] LIFF SDK初期化処理を開始します')

  try {
    // ブラウザ環境でのみ実行可能
    if (typeof window === 'undefined') {
      const error = new Error('LIFF can only be initialized in browser environment')
      console.error('[LIFF Init] エラー: サーバーサイドでの実行は不可', error)
      throw error
    }
    console.log('[LIFF Init] ✓ ブラウザ環境を確認')

    // LIFF IDの取得（引数 > 環境変数）
    const liffId = config?.liffId || process.env.NEXT_PUBLIC_LIFF_ID
    console.log('[LIFF Init] LIFF ID取得:', liffId ? `${liffId.substring(0, 15)}...` : '(未設定)')

    if (!liffId) {
      const error = new Error(
        'LIFF ID is not defined. Please set NEXT_PUBLIC_LIFF_ID in .env.local'
      )
      console.error('[LIFF Init] エラー: LIFF IDが設定されていません')
      console.error('[LIFF Init] 環境変数 NEXT_PUBLIC_LIFF_ID を .env.local に設定してください')
      throw error
    }
    console.log('[LIFF Init] ✓ LIFF ID確認完了')

    // LIFF SDK初期化
    const initConfig = {
      liffId,
      withLoginOnExternalBrowser: config?.withLoginOnExternalBrowser ?? true,
    }
    console.log('[LIFF Init] liff.init()を呼び出します:', initConfig)

    await liff.init(initConfig)
    console.log('[LIFF Init] ✓ liff.init()成功')

    // LIFF SDKの状態を確認
    console.log('[LIFF Init] LIFF SDK状態:')
    console.log('[LIFF Init] - isInClient():', liff.isInClient())
    console.log('[LIFF Init] - getOS():', liff.getOS())
    console.log('[LIFF Init] - getVersion():', liff.getVersion())
    console.log('[LIFF Init] - isLoggedIn():', liff.isLoggedIn())

    // ログイン状態の確認
    if (!liff.isLoggedIn()) {
      console.log('[LIFF Init] 未ログイン状態を検出')
      console.log('[LIFF Init] liff.login()でLINEログイン画面へリダイレクトします')
      // 未ログイン時は自動的にログイン画面へリダイレクト
      liff.login()
      return { success: false }
    }

    console.log('[LIFF Init] ✓ ログイン済み')
    console.log('[LIFF Init] 🎉 LIFF初期化完了!')
    console.log('[LIFF Init] =================================')
    return { success: true }
  } catch (error) {
    console.error('[LIFF Init] =================================')
    console.error('[LIFF Init] ❌ 初期化エラーが発生しました')
    console.error('[LIFF Init] エラー詳細:', error)

    if (error instanceof Error) {
      console.error('[LIFF Init] - メッセージ:', error.message)
      console.error('[LIFF Init] - スタックトレース:', error.stack)
    }

    console.error('[LIFF Init] =================================')

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
