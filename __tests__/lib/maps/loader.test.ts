/**
 * lib/maps/loader.ts のテスト
 */

import {
  initGoogleMaps,
  isGoogleMapsLoaded,
  loadGoogleMapsSafely,
  resetGoogleMapsLoader,
} from '@/lib/maps/loader'

// @googlemaps/js-api-loader のモック
jest.mock('@googlemaps/js-api-loader')

/* eslint-disable @typescript-eslint/no-require-imports */

describe('lib/maps/loader', () => {
  const mockGoogleMaps = {
    maps: {
      Map: jest.fn(),
      LatLng: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    resetGoogleMapsLoader()

    // 環境変数をセット
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'

    // 新しい関数型APIのモック設定
    const { setOptions, importLibrary } = require('@googlemaps/js-api-loader')
    setOptions.mockImplementation(() => {
      // setOptions は戻り値なし
    })
    importLibrary.mockResolvedValue({})

    // globalのgoogleオブジェクトをセット（importLibrary後に利用可能）
    // @ts-expect-error - テスト用にgoogleオブジェクトを追加
    global.google = mockGoogleMaps
  })

  afterEach(() => {
    resetGoogleMapsLoader()
  })

  describe('initGoogleMaps', () => {
    it('環境変数からAPIキーを取得してGoogle Maps APIを初期化する', async () => {
      const result = await initGoogleMaps()

      expect(result).toBe(mockGoogleMaps)

      const { setOptions, importLibrary } = require('@googlemaps/js-api-loader')
      expect(setOptions).toHaveBeenCalledWith({
        key: 'test-api-key',
        v: 'weekly',
        language: 'ja',
        region: 'JP',
      })
      expect(importLibrary).toHaveBeenCalledWith('maps')
      expect(importLibrary).toHaveBeenCalledWith('places')
      expect(importLibrary).toHaveBeenCalledWith('geometry')
      expect(importLibrary).toHaveBeenCalledWith('marker')
      expect(importLibrary).toHaveBeenCalledWith('routes')
    })

    it('複数回呼び出しても同じPromiseを返す（重複読み込み防止）', async () => {
      // 最初の呼び出し（awaitせずにPromiseを取得）
      const promise1 = initGoogleMaps()
      // 2回目の呼び出し（awaitせずにPromiseを取得）
      const promise2 = initGoogleMaps()

      // 同じPromiseインスタンスが返されることを確認
      expect(promise1).toBe(promise2)

      // 両方のPromiseを解決
      const result1 = await promise1
      const result2 = await promise2

      // 結果も同じオブジェクトであることを確認
      expect(result1).toBe(result2)
      expect(result1).toBe(mockGoogleMaps)

      const { setOptions, importLibrary } = require('@googlemaps/js-api-loader')
      // setOptionsは1回のみ呼ばれる（重複読み込み防止）
      expect(setOptions).toHaveBeenCalledTimes(1)
      // importLibraryは5つのライブラリ（maps, places, geometry, marker, routes）で各1回のみ
      expect(importLibrary).toHaveBeenCalledTimes(5)
    })

    it('APIキーが未設定の場合はエラーを投げる', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      expect(() => initGoogleMaps()).toThrow('Google Maps API key is not defined')
    })

    it('読み込み中にエラーが発生した場合はPromiseがrejectされる', async () => {
      const { importLibrary } = require('@googlemaps/js-api-loader')
      importLibrary.mockRejectedValue(new Error('Network error'))

      await expect(initGoogleMaps()).rejects.toThrow('Network error')
    })
  })

  describe('isGoogleMapsLoaded', () => {
    it('Google Mapsが読み込み済みの場合trueを返す', () => {
      // @ts-expect-error - テスト用にgoogleオブジェクトを追加
      global.google = mockGoogleMaps

      expect(isGoogleMapsLoaded()).toBe(true)
    })

    it('Google Mapsが未読み込みの場合falseを返す', () => {
      // @ts-expect-error - テスト用にgoogleオブジェクトを削除
      delete global.google

      expect(isGoogleMapsLoaded()).toBe(false)
    })

    it('google.mapsが存在しない場合falseを返す', () => {
      // @ts-expect-error - テスト用にgoogleオブジェクトを不完全な状態にする
      global.google = {}

      expect(isGoogleMapsLoaded()).toBe(false)
    })
  })

  describe('loadGoogleMapsSafely', () => {
    it('正常時はGoogle Maps APIオブジェクトを返す', async () => {
      const result = await loadGoogleMapsSafely()

      expect(result).toBe(mockGoogleMaps)
    })

    it('エラー時はnullを返す（例外を投げない）', async () => {
      // エラーを発生させるためにリセット
      resetGoogleMapsLoader()

      const { importLibrary } = require('@googlemaps/js-api-loader')
      importLibrary.mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await loadGoogleMapsSafely()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Google Maps] Failed to load Google Maps:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('APIキー未設定時もnullを返す', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await loadGoogleMapsSafely()

      expect(result).toBeNull()

      consoleSpy.mockRestore()
    })
  })

  describe('resetGoogleMapsLoader', () => {
    it('ローダーの状態をリセットする', async () => {
      // 最初の読み込み
      await initGoogleMaps()

      const { setOptions } = require('@googlemaps/js-api-loader')
      expect(setOptions).toHaveBeenCalledTimes(1)

      // リセット
      resetGoogleMapsLoader()

      // 再度読み込み（新しい初期化が行われる）
      await initGoogleMaps()

      expect(setOptions).toHaveBeenCalledTimes(2)
    })
  })
})
