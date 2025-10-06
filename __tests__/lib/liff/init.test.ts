/**
 * lib/liff/init.ts のテスト
 */

import { initializeLiff, isLiffInitialized, getLiffVersion } from '@/lib/liff/init'

// LIFF SDKのモック
jest.mock('@line/liff')

/* eslint-disable @typescript-eslint/no-require-imports */

describe('lib/liff/init', () => {
  const originalWindow = global.window

  beforeEach(() => {
    jest.clearAllMocks()
    // ブラウザ環境をシミュレート
    if (typeof global.window === 'undefined') {
      // @ts-expect-error - テスト用にwindowを追加
      global.window = {}
    }
  })

  afterEach(() => {
    // テスト後にwindowを元に戻す
    if (originalWindow === undefined) {
      // @ts-expect-error - テスト用にwindowを削除
      delete global.window
    }
  })

  describe('initializeLiff', () => {
    it('環境変数からLIFF IDを取得して初期化する', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = '1234567890-abcdefgh'

      const result = await initializeLiff()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('引数で渡されたLIFF IDで初期化する', async () => {
      const result = await initializeLiff({
        liffId: '9876543210-hgfedcba',
      })

      expect(result.success).toBe(true)
    })

    it('LIFF IDが未設定の場合はエラーを返す', async () => {
      delete process.env.NEXT_PUBLIC_LIFF_ID

      const result = await initializeLiff()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('LIFF ID is not defined')
    })

    it('withLoginOnExternalBrowserオプションを渡せる', async () => {
      const liff = require('@line/liff').default

      await initializeLiff({
        liffId: '1234567890-abcdefgh',
        withLoginOnExternalBrowser: false,
      })

      expect(liff.init).toHaveBeenCalledWith({
        liffId: '1234567890-abcdefgh',
        withLoginOnExternalBrowser: false,
      })
    })

    // Note: Jest+jsdom環境では window は常に存在するため、
    // ブラウザ環境でない場合のテストは実環境でのみ検証可能
    it.skip('ブラウザ環境でない場合はエラーを返す', async () => {
      // Jest環境ではwindowは常に存在するためスキップ
      const result = await initializeLiff({
        liffId: '1234567890-abcdefgh',
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('browser environment')
    })
  })

  describe('isLiffInitialized', () => {
    it('初期化済みの場合trueを返す', () => {
      const liff = require('@line/liff').default
      liff.isLoggedIn.mockReturnValue(true)

      expect(isLiffInitialized()).toBe(true)
    })

    it('未初期化の場合falseを返す', () => {
      const liff = require('@line/liff').default
      liff.isLoggedIn.mockReturnValue(false)

      expect(isLiffInitialized()).toBe(false)
    })

    // Note: Jest+jsdom環境では window は常に存在するため、
    // ブラウザ環境でない場合のテストは実環境でのみ検証可能
    it.skip('ブラウザ環境でない場合falseを返す', () => {
      // Jest環境ではwindowは常に存在するためスキップ
      expect(isLiffInitialized()).toBe(false)
    })
  })

  describe('getLiffVersion', () => {
    it('LIFFバージョンを返す', () => {
      const liff = require('@line/liff').default
      liff.getVersion.mockReturnValue('2.26.1')

      expect(getLiffVersion()).toBe('2.26.1')
    })

    it('エラー時は"unknown"を返す', () => {
      const liff = require('@line/liff').default
      liff.getVersion.mockImplementation(() => {
        throw new Error('Test error')
      })

      expect(getLiffVersion()).toBe('unknown')
    })
  })
})
