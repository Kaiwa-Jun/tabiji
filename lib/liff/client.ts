/**
 * LIFFクライアントラッパー
 * LIFF SDKの主要機能を型安全にラップ
 */

import liff from '@line/liff'
import type { LiffUserProfile, LiffEnvironment } from './types'

/**
 * LIFFクライアントクラス（Singletonパターン）
 */
class LiffClient {
  private static instance: LiffClient | null = null

  private constructor() {
    // privateコンストラクタでSingleton化
  }

  /**
   * LiffClientのインスタンスを取得（Singletonパターン）
   */
  public static getInstance(): LiffClient {
    if (!LiffClient.instance) {
      LiffClient.instance = new LiffClient()
    }
    return LiffClient.instance
  }

  /**
   * ユーザープロフィールを取得
   * @returns ユーザープロフィール
   */
  public async getProfile(): Promise<LiffUserProfile> {
    try {
      const profile = await liff.getProfile()
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      }
    } catch (error) {
      console.error('Failed to get LIFF profile:', error)
      throw error
    }
  }

  /**
   * LIFF環境情報を取得
   * @returns LIFF環境情報
   */
  public getEnvironment(): LiffEnvironment {
    try {
      return {
        isInClient: liff.isInClient(),
        os: liff.getOS() || 'unknown',
        language: liff.getLanguage(),
        version: liff.getVersion(),
      }
    } catch (error) {
      console.error('Failed to get LIFF environment:', error)
      throw error
    }
  }

  /**
   * LINEトークへメッセージを送信
   * @param text - 送信するメッセージ
   */
  public async sendMessages(text: string): Promise<void> {
    try {
      if (!liff.isInClient()) {
        console.warn('sendMessages is only available in LINE client')
        return
      }

      await liff.sendMessages([
        {
          type: 'text',
          text,
        },
      ])
    } catch (error) {
      console.error('Failed to send messages:', error)
      throw error
    }
  }

  /**
   * LIFFアプリを閉じる（LINEアプリ内のみ有効）
   */
  public closeWindow(): void {
    try {
      if (liff.isInClient()) {
        liff.closeWindow()
      } else {
        console.warn('closeWindow is only available in LINE client')
      }
    } catch (error) {
      console.error('Failed to close window:', error)
      throw error
    }
  }

  /**
   * LIFFアプリからログアウト
   */
  public logout(): void {
    try {
      liff.logout()
      // ログアウト後、トップページへリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to logout:', error)
      throw error
    }
  }

  /**
   * ログイン状態を確認
   * @returns ログイン済みの場合true
   */
  public isLoggedIn(): boolean {
    try {
      return liff.isLoggedIn()
    } catch {
      return false
    }
  }

  /**
   * LINEアプリ内で動作しているか確認
   * @returns LINEアプリ内の場合true
   */
  public isInClient(): boolean {
    try {
      return liff.isInClient()
    } catch {
      return false
    }
  }

  /**
   * アクセストークンを取得
   * @returns アクセストークン
   */
  public getAccessToken(): string | null {
    try {
      return liff.getAccessToken()
    } catch {
      return null
    }
  }

  /**
   * IDトークンを取得（JWTペイロードをデコード）
   * @returns IDトークンのペイロード
   */
  public getDecodedIDToken(): Record<string, unknown> | null {
    try {
      const token = liff.getDecodedIDToken()
      return token as Record<string, unknown> | null
    } catch {
      return null
    }
  }
}

/**
 * LiffClientのシングルトンインスタンスをエクスポート
 */
export const liffClient = LiffClient.getInstance()
