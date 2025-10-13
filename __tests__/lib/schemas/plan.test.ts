/**
 * プランバリデーションスキーマのテスト
 */

import {
  dateInputSchema,
  areaSelectionSchema,
  spotSelectionSchema,
  spotSchema,
  customSpotSchema,
  planSchema,
} from '@/lib/schemas/plan'

describe('dateInputSchema', () => {
  describe('正常系', () => {
    it('正常な日程でバリデーションが成功する', () => {
      const result = dateInputSchema.safeParse({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-03'),
      })

      expect(result.success).toBe(true)
    })

    it('同じ日付（日帰り）でバリデーションが成功する', () => {
      const result = dateInputSchema.safeParse({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-01'),
      })

      expect(result.success).toBe(true)
    })

    it('過去の日付でもバリデーションが成功する', () => {
      const result = dateInputSchema.safeParse({
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-01-03'),
      })

      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('開始日が未指定の場合エラー', () => {
      const result = dateInputSchema.safeParse({
        endDate: new Date('2025-01-03'),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.startDate).toContain(
          '開始日を選択してください'
        )
      }
    })

    it('終了日が未指定の場合エラー', () => {
      const result = dateInputSchema.safeParse({
        startDate: new Date('2025-01-01'),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.endDate).toContain(
          '終了日を選択してください'
        )
      }
    })

    it('終了日が開始日より前の場合エラー', () => {
      const result = dateInputSchema.safeParse({
        startDate: new Date('2025-01-03'),
        endDate: new Date('2025-01-01'),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.endDate).toContain(
          '終了日は開始日以降の日付を選択してください'
        )
      }
    })

    it('開始日が無効な値の場合エラー', () => {
      const result = dateInputSchema.safeParse({
        startDate: 'invalid-date',
        endDate: new Date('2025-01-03'),
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('areaSelectionSchema', () => {
  describe('正常系', () => {
    it('正常な地方・都道府県でバリデーションが成功する', () => {
      const result = areaSelectionSchema.safeParse({
        region: '関東',
        prefecture: '東京都',
      })

      expect(result.success).toBe(true)
    })

    it('北海道地方・北海道でバリデーションが成功する', () => {
      const result = areaSelectionSchema.safeParse({
        region: '北海道',
        prefecture: '北海道',
      })

      expect(result.success).toBe(true)
    })

    it('九州・沖縄地方・沖縄県でバリデーションが成功する', () => {
      const result = areaSelectionSchema.safeParse({
        region: '九州・沖縄',
        prefecture: '沖縄県',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('地方が未指定の場合エラー', () => {
      const result = areaSelectionSchema.safeParse({
        prefecture: '東京都',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.region).toContain(
          '地方を選択してください'
        )
      }
    })

    it('都道府県が未指定の場合エラー', () => {
      const result = areaSelectionSchema.safeParse({
        region: '関東',
        prefecture: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.prefecture).toContain(
          '都道府県を選択してください'
        )
      }
    })

    it('地方と都道府県が一致しない場合エラー', () => {
      const result = areaSelectionSchema.safeParse({
        region: '関東',
        prefecture: '大阪府', // 近畿地方
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.prefecture).toContain(
          '選択した地方に対応する都道府県を選択してください'
        )
      }
    })

    it('無効な地方名の場合エラー', () => {
      const result = areaSelectionSchema.safeParse({
        region: '無効な地方',
        prefecture: '東京都',
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('spotSchema', () => {
  describe('正常系', () => {
    it('正常なスポットデータでバリデーションが成功する', () => {
      const result = spotSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '東京タワー',
        latitude: 35.6586,
        longitude: 139.7454,
      })

      expect(result.success).toBe(true)
    })

    it('オプショナルフィールドがnullでもバリデーションが成功する', () => {
      const result = spotSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '東京タワー',
        latitude: 35.6586,
        longitude: 139.7454,
        google_place_id: null,
        address: null,
        photo_url: null,
        category: null,
        rating: null,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('IDがUUID形式でない場合エラー', () => {
      const result = spotSchema.safeParse({
        id: 'invalid-uuid',
        name: '東京タワー',
        latitude: 35.6586,
        longitude: 139.7454,
      })

      expect(result.success).toBe(false)
    })

    it('緯度が範囲外の場合エラー', () => {
      const result = spotSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '東京タワー',
        latitude: 91, // 90を超える
        longitude: 139.7454,
      })

      expect(result.success).toBe(false)
    })

    it('経度が範囲外の場合エラー', () => {
      const result = spotSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '東京タワー',
        latitude: 35.6586,
        longitude: 181, // 180を超える
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('customSpotSchema', () => {
  describe('正常系', () => {
    it('正常なカスタムスポットでバリデーションが成功する', () => {
      const result = customSpotSchema.safeParse({
        name: 'お気に入りのカフェ',
        lat: 35.6586,
        lng: 139.7454,
      })

      expect(result.success).toBe(true)
    })

    it('オプショナルフィールド付きでバリデーションが成功する', () => {
      const result = customSpotSchema.safeParse({
        name: 'お気に入りのカフェ',
        lat: 35.6586,
        lng: 139.7454,
        address: '東京都渋谷区',
        category: 'カフェ',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('名前が未指定の場合エラー', () => {
      const result = customSpotSchema.safeParse({
        lat: 35.6586,
        lng: 139.7454,
      })

      expect(result.success).toBe(false)
    })

    it('名前が空文字の場合エラー', () => {
      const result = customSpotSchema.safeParse({
        name: '',
        lat: 35.6586,
        lng: 139.7454,
      })

      expect(result.success).toBe(false)
    })

    it('名前が200文字を超える場合エラー', () => {
      const result = customSpotSchema.safeParse({
        name: 'あ'.repeat(201),
        lat: 35.6586,
        lng: 139.7454,
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('spotSelectionSchema', () => {
  const validSpot = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: '東京タワー',
    latitude: 35.6586,
    longitude: 139.7454,
  }

  const validCustomSpot = {
    name: 'お気に入りのカフェ',
    lat: 35.6586,
    lng: 139.7454,
  }

  describe('正常系', () => {
    it('選択スポットのみでバリデーションが成功する', () => {
      const result = spotSelectionSchema.safeParse({
        selectedSpots: [validSpot],
        customSpots: [],
      })

      expect(result.success).toBe(true)
    })

    it('カスタムスポットのみでバリデーションが成功する', () => {
      const result = spotSelectionSchema.safeParse({
        selectedSpots: [],
        customSpots: [validCustomSpot],
      })

      expect(result.success).toBe(true)
    })

    it('両方あってもバリデーションが成功する', () => {
      const result = spotSelectionSchema.safeParse({
        selectedSpots: [validSpot],
        customSpots: [validCustomSpot],
      })

      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('スポットが1つも選択されていない場合エラー', () => {
      const result = spotSelectionSchema.safeParse({
        selectedSpots: [],
        customSpots: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.selectedSpots).toContain(
          '少なくとも1つのスポットを選択してください'
        )
      }
    })
  })
})

describe('planSchema', () => {
  describe('正常系', () => {
    it('完全なプランデータでバリデーションが成功する', () => {
      const result = planSchema.safeParse({
        title: '北海道旅行',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        region: '北海道',
        prefecture: '北海道',
        selectedSpots: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: '札幌時計台',
            latitude: 43.0622,
            longitude: 141.3545,
          },
        ],
        customSpots: [],
      })

      expect(result.success).toBe(true)
    })

    it('タイトルが未指定の場合デフォルト値が設定される', () => {
      const result = planSchema.safeParse({
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        region: '北海道',
        prefecture: '北海道',
        selectedSpots: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: '札幌時計台',
            latitude: 43.0622,
            longitude: 141.3545,
          },
        ],
        customSpots: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('新しい旅行プラン')
      }
    })
  })

  describe('異常系', () => {
    it('タイトルが100文字を超える場合エラー', () => {
      const result = planSchema.safeParse({
        title: 'あ'.repeat(101),
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        region: '北海道',
        prefecture: '北海道',
        selectedSpots: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: '札幌時計台',
            latitude: 43.0622,
            longitude: 141.3545,
          },
        ],
        customSpots: [],
      })

      expect(result.success).toBe(false)
    })
  })
})
