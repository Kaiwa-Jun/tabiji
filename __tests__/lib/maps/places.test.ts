/**
 * Places APIラッパーのテスト
 */

import { searchPlacesByArea, getPlaceDetails } from '@/lib/maps/places'
import { initGoogleMaps } from '@/lib/maps/loader'

// Google Maps APIをモック
jest.mock('@/lib/maps/loader')

describe('Places API Wrapper', () => {
  let mockService: {
    textSearch: jest.Mock
    getDetails: jest.Mock
  }

  beforeEach(() => {
    // PlacesServiceのモックを作成
    mockService = {
      textSearch: jest.fn(),
      getDetails: jest.fn(),
    }

    // initGoogleMapsのモック
    ;(initGoogleMaps as jest.Mock).mockResolvedValue({
      maps: {
        places: {
          PlacesService: jest.fn(() => mockService),
          PlacesServiceStatus: {
            OK: 'OK',
            ZERO_RESULTS: 'ZERO_RESULTS',
            NOT_FOUND: 'NOT_FOUND',
            ERROR: 'ERROR',
          },
        },
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPlacesByArea', () => {
    it('エリア名から観光スポットを検索できる', async () => {
      // モックデータ
      const mockResults = [
        {
          place_id: 'place1',
          name: '東京タワー',
          formatted_address: '東京都港区芝公園4-2-8',
          geometry: {
            location: {
              lat: () => 35.6586,
              lng: () => 139.7454,
            },
          },
          photos: [
            {
              getUrl: () => 'https://example.com/photo1.jpg',
            },
          ],
          rating: 4.5,
          types: ['tourist_attraction'],
        },
        {
          place_id: 'place2',
          name: '浅草寺',
          formatted_address: '東京都台東区浅草2-3-1',
          geometry: {
            location: {
              lat: () => 35.7148,
              lng: () => 139.7967,
            },
          },
          rating: 4.3,
          types: ['tourist_attraction', 'place_of_worship'],
        },
      ]

      // textSearchが成功するようにモック
      mockService.textSearch.mockImplementation((request, callback) => {
        callback(mockResults, 'OK')
      })

      // テスト実行
      const results = await searchPlacesByArea('東京都')

      // 検証
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        placeId: 'place1',
        name: '東京タワー',
        address: '東京都港区芝公園4-2-8',
        lat: 35.6586,
        lng: 139.7454,
        photoUrl: 'https://example.com/photo1.jpg',
        rating: 4.5,
        types: ['tourist_attraction'],
      })
    })

    it('オプションでスポットタイプを指定できる', async () => {
      mockService.textSearch.mockImplementation((request, callback) => {
        callback([], 'OK')
      })

      await searchPlacesByArea('京都府', { type: 'museum', limit: 10 })

      expect(mockService.textSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '京都府 観光地',
          type: 'museum',
        }),
        expect.any(Function)
      )
    })

    it('検索結果が0件の場合は空配列を返す', async () => {
      mockService.textSearch.mockImplementation((request, callback) => {
        callback(null, 'ZERO_RESULTS')
      })

      const results = await searchPlacesByArea('存在しないエリア')

      expect(results).toEqual([])
    })

    it('APIエラー時は例外をスローする', async () => {
      mockService.textSearch.mockImplementation((request, callback) => {
        callback(null, 'ERROR')
      })

      await expect(searchPlacesByArea('東京都')).rejects.toThrow('Places search failed: ERROR')
    })

    it('limit指定で取得件数を制限できる', async () => {
      const mockResults = Array.from({ length: 30 }, (_, i) => ({
        place_id: `place${i}`,
        name: `スポット${i}`,
        formatted_address: `住所${i}`,
        geometry: {
          location: {
            lat: () => 35.0 + i * 0.01,
            lng: () => 139.0 + i * 0.01,
          },
        },
      }))

      mockService.textSearch.mockImplementation((request, callback) => {
        callback(mockResults, 'OK')
      })

      const results = await searchPlacesByArea('東京都', { limit: 10 })

      expect(results).toHaveLength(10)
    })
  })

  describe('getPlaceDetails', () => {
    it('Google Places IDからスポット詳細を取得できる', async () => {
      const mockPlace = {
        place_id: 'place1',
        name: '東京タワー',
        formatted_address: '東京都港区芝公園4-2-8',
        geometry: {
          location: {
            lat: () => 35.6586,
            lng: () => 139.7454,
          },
        },
        photos: [
          {
            getUrl: () => 'https://example.com/photo1.jpg',
          },
        ],
        rating: 4.5,
        types: ['tourist_attraction'],
      }

      mockService.getDetails.mockImplementation((request, callback) => {
        callback(mockPlace, 'OK')
      })

      const result = await getPlaceDetails('place1')

      expect(result).toEqual({
        placeId: 'place1',
        name: '東京タワー',
        address: '東京都港区芝公園4-2-8',
        lat: 35.6586,
        lng: 139.7454,
        photoUrl: 'https://example.com/photo1.jpg',
        rating: 4.5,
        types: ['tourist_attraction'],
      })
    })

    it('スポットが見つからない場合はnullを返す', async () => {
      mockService.getDetails.mockImplementation((request, callback) => {
        callback(null, 'NOT_FOUND')
      })

      const result = await getPlaceDetails('invalid_place_id')

      expect(result).toBeNull()
    })

    it('APIエラー時は例外をスローする', async () => {
      mockService.getDetails.mockImplementation((request, callback) => {
        callback(null, 'ERROR')
      })

      await expect(getPlaceDetails('place1')).rejects.toThrow(
        'Place details fetch failed: ERROR'
      )
    })

    it('必須フィールドを正しく指定してAPIを呼び出す', async () => {
      mockService.getDetails.mockImplementation((request, callback) => {
        callback(null, 'NOT_FOUND')
      })

      await getPlaceDetails('place1')

      expect(mockService.getDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          placeId: 'place1',
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'photos',
            'rating',
            'types',
            'place_id',
          ],
          language: 'ja',
        }),
        expect.any(Function)
      )
    })
  })
})
