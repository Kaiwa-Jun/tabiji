/**
 * LIFF モック（ローカル開発用）
 * 実際のLIFF機能は動作しないが、UIの確認は可能
 */

import type { LiffUserProfile, LiffEnvironment } from './types'

export const mockLiffClient = {
  async getProfile(): Promise<LiffUserProfile> {
    return {
      userId: 'U1234567890abcdef',
      displayName: 'テストユーザー',
      pictureUrl: 'https://via.placeholder.com/150',
      statusMessage: 'モックデータです',
    }
  },

  getEnvironment(): LiffEnvironment {
    return {
      isInClient: false,
      os: 'web',
      language: 'ja',
      version: '2.26.1',
    }
  },

  async sendMessages(text: string): Promise<void> {
    console.log('モック: メッセージ送信', text)
    alert(`モック: "${text}" を送信しました`)
  },

  closeWindow(): void {
    console.log('モック: ウィンドウを閉じる')
    alert('モック: ウィンドウを閉じる')
  },

  logout(): void {
    console.log('モック: ログアウト')
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  },

  isLoggedIn(): boolean {
    return true
  },

  isInClient(): boolean {
    return false
  },

  getAccessToken(): string | null {
    return 'mock-access-token-1234567890'
  },

  getDecodedIDToken(): Record<string, unknown> | null {
    return {
      iss: 'https://access.line.me',
      sub: 'U1234567890abcdef',
      name: 'テストユーザー',
    }
  },
}
