/**
 * Directions APIラッパーのテスト
 */

import {
  getDirections,
  getMultipleRoutes,
  calculateTotalDuration,
  formatDuration,
} from '@/lib/maps/directions'
import { initGoogleMaps } from '@/lib/maps/loader'

// Google Maps APIをモック
jest.mock('@/lib/maps/loader')

describe('Directions API Wrapper', () => {
  let mockService: {
    route: jest.Mock
  }

  beforeEach(() => {
    // DirectionsServiceのモックを作成
    mockService = {
      route: jest.fn(),
    }

    // initGoogleMapsのモック
    ;(initGoogleMaps as jest.Mock).mockResolvedValue({
      maps: {
        DirectionsService: jest.fn(() => mockService),
        DirectionsStatus: {
          OK: 'OK',
          NOT_FOUND: 'NOT_FOUND',
          ZERO_RESULTS: 'ZERO_RESULTS',
          ERROR: 'ERROR',
        },
        TravelMode: {
          WALKING: 'WALKING',
          DRIVING: 'DRIVING',
          TRANSIT: 'TRANSIT',
          BICYCLING: 'BICYCLING',
        },
        LatLng: jest.fn((lat, lng) => ({ lat, lng })),
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getDirections', () => {
    it('2地点間のルート情報を取得できる', async () => {
      const mockResult = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1200 },
                duration: { value: 900 },
                start_address: '東京都港区芝公園4-2-8',
                end_address: '東京都港区芝公園3-4-1',
              },
            ],
            overview_polyline: 'encodedPolylineString',
          },
        ],
      }

      mockService.route.mockImplementation((request, callback) => {
        callback(mockResult, 'OK')
      })

      const result = await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 }
      )

      expect(result).toEqual({
        distance: 1200,
        duration: 900,
        startAddress: '東京都港区芝公園4-2-8',
        endAddress: '東京都港区芝公園3-4-1',
        polyline: 'encodedPolylineString',
      })
    })

    it('デフォルトでは徒歩モードを使用する', async () => {
      const mockResult = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1200 },
                duration: { value: 900 },
                start_address: '出発地',
                end_address: '目的地',
              },
            ],
            overview_polyline: '',
          },
        ],
      }

      mockService.route.mockImplementation((request, callback) => {
        expect(request.travelMode).toBe('WALKING')
        callback(mockResult, 'OK')
      })

      await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 }
      )

      expect(mockService.route).toHaveBeenCalled()
    })

    it('移動手段を指定できる', async () => {
      const mockResult = {
        routes: [
          {
            legs: [
              {
                distance: { value: 5000 },
                duration: { value: 600 },
                start_address: '出発地',
                end_address: '目的地',
              },
            ],
            overview_polyline: '',
          },
        ],
      }

      mockService.route.mockImplementation((request, callback) => {
        callback(mockResult, 'OK')
      })

      const google = await initGoogleMaps()
      await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 },
        google.maps.TravelMode.DRIVING
      )

      expect(mockService.route).toHaveBeenCalledWith(
        expect.objectContaining({
          travelMode: 'DRIVING',
        }),
        expect.any(Function)
      )
    })

    it('ルートが見つからない場合はnullを返す', async () => {
      mockService.route.mockImplementation((request, callback) => {
        callback(null, 'NOT_FOUND')
      })

      const result = await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 }
      )

      expect(result).toBeNull()
    })

    it('APIエラー時はnullを返す', async () => {
      mockService.route.mockImplementation((request, callback) => {
        callback(null, 'ERROR')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 }
      )

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('日本語と日本地域を指定してAPIを呼び出す', async () => {
      const mockResult = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1000 },
                duration: { value: 600 },
                start_address: '出発地',
                end_address: '目的地',
              },
            ],
            overview_polyline: '',
          },
        ],
      }

      mockService.route.mockImplementation((request, callback) => {
        callback(mockResult, 'OK')
      })

      await getDirections(
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 }
      )

      expect(mockService.route).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'ja',
          region: 'jp',
        }),
        expect.any(Function)
      )
    })
  })

  describe('getMultipleRoutes', () => {
    it('複数地点の経路を順番に取得できる', async () => {
      const mockResult1 = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1000 },
                duration: { value: 600 },
                start_address: '地点1',
                end_address: '地点2',
              },
            ],
            overview_polyline: 'poly1',
          },
        ],
      }

      const mockResult2 = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1500 },
                duration: { value: 900 },
                start_address: '地点2',
                end_address: '地点3',
              },
            ],
            overview_polyline: 'poly2',
          },
        ],
      }

      let callCount = 0
      mockService.route.mockImplementation((request, callback) => {
        callCount++
        if (callCount === 1) {
          callback(mockResult1, 'OK')
        } else {
          callback(mockResult2, 'OK')
        }
      })

      const locations = [
        { lat: 35.6586, lng: 139.7454 }, // 地点1
        { lat: 35.6585, lng: 139.7471 }, // 地点2
        { lat: 35.6812, lng: 139.7671 }, // 地点3
      ]

      const routes = await getMultipleRoutes(locations)

      expect(routes).toHaveLength(2)
      expect(routes[0]).toEqual({
        distance: 1000,
        duration: 600,
        startAddress: '地点1',
        endAddress: '地点2',
        polyline: 'poly1',
      })
      expect(routes[1]).toEqual({
        distance: 1500,
        duration: 900,
        startAddress: '地点2',
        endAddress: '地点3',
        polyline: 'poly2',
      })
      expect(mockService.route).toHaveBeenCalledTimes(2)
    })

    it('1つの地点のみの場合は空配列を返す', async () => {
      const locations = [{ lat: 35.6586, lng: 139.7454 }]

      const routes = await getMultipleRoutes(locations)

      expect(routes).toEqual([])
      expect(mockService.route).not.toHaveBeenCalled()
    })

    it('一部のルートが見つからない場合はスキップする', async () => {
      let callCount = 0
      mockService.route.mockImplementation((request, callback) => {
        callCount++
        if (callCount === 1) {
          // 1つ目のルートは成功
          callback(
            {
              routes: [
                {
                  legs: [
                    {
                      distance: { value: 1000 },
                      duration: { value: 600 },
                      start_address: '地点1',
                      end_address: '地点2',
                    },
                  ],
                  overview_polyline: 'poly1',
                },
              ],
            },
            'OK'
          )
        } else {
          // 2つ目のルートは見つからない
          callback(null, 'NOT_FOUND')
        }
      })

      const locations = [
        { lat: 35.6586, lng: 139.7454 },
        { lat: 35.6585, lng: 139.7471 },
        { lat: 35.6812, lng: 139.7671 },
      ]

      const routes = await getMultipleRoutes(locations)

      expect(routes).toHaveLength(1)
      expect(mockService.route).toHaveBeenCalledTimes(2)
    })
  })

  describe('calculateTotalDuration', () => {
    it('ルート配列の合計移動時間を計算できる', () => {
      const routes = [
        {
          distance: 1000,
          duration: 600,
          startAddress: '地点1',
          endAddress: '地点2',
          polyline: 'poly1',
        },
        {
          distance: 1500,
          duration: 900,
          startAddress: '地点2',
          endAddress: '地点3',
          polyline: 'poly2',
        },
        {
          distance: 800,
          duration: 480,
          startAddress: '地点3',
          endAddress: '地点4',
          polyline: 'poly3',
        },
      ]

      const total = calculateTotalDuration(routes)

      expect(total).toBe(1980) // 600 + 900 + 480
    })

    it('空配列の場合は0を返す', () => {
      const total = calculateTotalDuration([])

      expect(total).toBe(0)
    })
  })

  describe('formatDuration', () => {
    it('秒を「◯時間◯分」形式に変換できる（時間あり）', () => {
      const formatted = formatDuration(7380) // 2時間3分

      expect(formatted).toBe('2時間3分')
    })

    it('秒を「◯分」形式に変換できる（時間なし）', () => {
      const formatted = formatDuration(900) // 15分

      expect(formatted).toBe('15分')
    })

    it('1時間ちょうどの場合', () => {
      const formatted = formatDuration(3600)

      expect(formatted).toBe('1時間0分')
    })

    it('0秒の場合', () => {
      const formatted = formatDuration(0)

      expect(formatted).toBe('0分')
    })

    it('30秒などの端数は切り捨てる', () => {
      const formatted = formatDuration(690) // 11分30秒

      expect(formatted).toBe('11分')
    })

    it('3時間45分のような長時間も正しく表示', () => {
      const formatted = formatDuration(13500) // 3時間45分

      expect(formatted).toBe('3時間45分')
    })
  })
})
