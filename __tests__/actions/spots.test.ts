/**
 * Server Actions (spots.ts) のテスト
 *
 * 注意: このテストは最小限のモックでSupabaseクライアントをモック化します
 */

import { saveSpot } from '@/actions/spots'
import type { PlaceResult } from '@/lib/maps/places'
import type { Tables } from '@/types/database'

// Supabaseクライアントをモック
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}))

describe('Server Actions: spots.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveSpot', () => {
    it('新規スポットを保存できる', async () => {
      // Arrange: テストデータを準備
      const placeResult: PlaceResult = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: '東京タワー',
        address: '東京都港区芝公園4-2-8',
        lat: 35.6585805,
        lng: 139.7454329,
        photoUrl: 'https://example.com/photo.jpg',
        rating: 4.5,
        types: ['tourist_attraction', 'point_of_interest'],
      }

      const mockSavedSpot: Tables<'spots'> = {
        id: 'spot-id-123',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: placeResult.photoUrl ?? null,
        rating: placeResult.rating ?? null,
        category: 'tourist_attraction',
        metadata: { types: placeResult.types },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSavedSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act: 関数を実行
      const result = await saveSpot(placeResult)

      // Assert: 結果を検証
      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data?.google_place_id).toBe(placeResult.placeId)
      expect(result.data?.name).toBe(placeResult.name)
      expect(result.data?.latitude).toBe(placeResult.lat)
      expect(result.data?.longitude).toBe(placeResult.lng)
      expect(result.data?.category).toBe('tourist_attraction')
    })

    it('既存スポット（重複）の場合は既存レコードを返す', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: '東京タワー',
        address: '東京都港区芝公園4-2-8',
        lat: 35.6585805,
        lng: 139.7454329,
      }

      const existingSpot: Tables<'spots'> = {
        id: 'existing-spot-id',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: null,
        rating: null,
        category: null,
        metadata: null,
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
      }

      // 既存スポット検索: 見つかる
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: existingSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data?.id).toBe('existing-spot-id')
      expect(result.data?.google_place_id).toBe(placeResult.placeId)
      // insertは呼ばれない（重複チェックで既存レコードを返すだけ）
      expect(mockFrom).toHaveBeenCalledTimes(1) // selectのみ
    })

    it('photoUrlがない場合でも保存できる', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test',
        name: 'テストスポット',
        address: 'テスト住所',
        lat: 35.0,
        lng: 139.0,
        // photoUrlなし
      }

      const mockSavedSpot: Tables<'spots'> = {
        id: 'spot-id-456',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: null,
        rating: null,
        category: null,
        metadata: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSavedSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBeNull()
      expect(result.data?.photo_url).toBeNull()
    })

    it('ratingがない場合でも保存できる', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test2',
        name: 'テストスポット2',
        address: 'テスト住所2',
        lat: 35.0,
        lng: 139.0,
        // ratingなし
      }

      const mockSavedSpot: Tables<'spots'> = {
        id: 'spot-id-789',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: null,
        rating: null,
        category: null,
        metadata: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSavedSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBeNull()
      expect(result.data?.rating).toBeNull()
    })

    it('typesがある場合はcategoryとmetadataに保存される', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test3',
        name: '美術館',
        address: 'テスト住所3',
        lat: 35.0,
        lng: 139.0,
        types: ['museum', 'tourist_attraction', 'point_of_interest'],
      }

      const mockSavedSpot: Tables<'spots'> = {
        id: 'spot-id-abc',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: null,
        rating: null,
        category: 'museum', // 最初のtypeがcategoryに
        metadata: { types: placeResult.types }, // 全てのtypesをmetadataに
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSavedSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBeNull()
      expect(result.data?.category).toBe('museum')
      expect(result.data?.metadata).toEqual({ types: placeResult.types })
    })

    it('typesがない場合でも保存できる', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test4',
        name: 'typesなしスポット',
        address: 'テスト住所4',
        lat: 35.0,
        lng: 139.0,
        // typesなし
      }

      const mockSavedSpot: Tables<'spots'> = {
        id: 'spot-id-def',
        google_place_id: placeResult.placeId,
        name: placeResult.name,
        address: placeResult.address,
        latitude: placeResult.lat,
        longitude: placeResult.lng,
        photo_url: null,
        rating: null,
        category: null, // typesがないのでcategoryもnull
        metadata: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSavedSpot,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBeNull()
      expect(result.data?.category).toBeNull()
      expect(result.data?.metadata).toBeNull()
    })

    it('空のplaceIdの場合はエラーを返す', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: '',
        name: 'テストスポット',
        address: 'テスト住所',
        lat: 35.0,
        lng: 139.0,
      }

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBe('Google Place IDが無効です')
      expect(result.data).toBeNull()
    })

    it('空のnameの場合はエラーを返す', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test5',
        name: '',
        address: 'テスト住所',
        lat: 35.0,
        lng: 139.0,
      }

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBe('スポット名が無効です')
      expect(result.data).toBeNull()
    })

    it('緯度が範囲外の場合はエラーを返す', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test6',
        name: 'テストスポット',
        address: 'テスト住所',
        lat: 91.0, // 範囲外（-90〜90）
        lng: 139.0,
      }

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBe('緯度・経度の値が無効です')
      expect(result.data).toBeNull()
    })

    it('経度が範囲外の場合はエラーを返す', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test7',
        name: 'テストスポット',
        address: 'テスト住所',
        lat: 35.0,
        lng: 181.0, // 範囲外（-180〜180）
      }

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).toBe('緯度・経度の値が無効です')
      expect(result.data).toBeNull()
    })

    it('データベースエラー時は適切にエラーハンドリングされる', async () => {
      // Arrange
      const placeResult: PlaceResult = {
        placeId: 'ChIJ_test8',
        name: 'エラーテスト',
        address: 'テスト住所',
        lat: 35.0,
        lng: 139.0,
      }

      // 既存スポット検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規スポット作成: エラー発生
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection error' },
            }),
          }),
        }),
      })

      // Act
      const result = await saveSpot(placeResult)

      // Assert
      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })
})
