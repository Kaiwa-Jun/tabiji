import { generatePlanWithEndpoints } from '@/lib/itinerary/plan-generator-with-endpoints'
import type { PlaceResult } from '@/lib/maps/places'
import type { TripEndpoints } from '@/types/models'
import type { RouteInfo } from '@/lib/maps/directions'

// Directions APIをモック
jest.mock('@/lib/maps/directions', () => ({
  getMultipleRoutes: jest.fn((locations: { lat: number; lng: number }[]) => {
    // モック: 各区間に簡易的なルート情報を生成
    const routes: RouteInfo[] = []
    for (let i = 0; i < locations.length - 1; i++) {
      routes.push({
        distance: 5.0, // 5km（固定値）
        duration: 600, // 10分（固定値、秒単位）
        polyline: 'mock_polyline',
        startAddress: `地点${i}`,
        endAddress: `地点${i + 1}`,
      })
    }
    return Promise.resolve(routes)
  }),
}))

describe('generatePlanWithEndpoints', () => {
  // テスト用のスポット
  const createSpot = (id: string, name: string, lat: number, lng: number): PlaceResult => ({
    placeId: id,
    name,
    lat,
    lng,
    address: `住所${id}`,
    types: ['tourist_attraction'],
  })

  describe('基本的な動作', () => {
    it('2泊3日のプランを正しく生成する', async () => {
      // スポット: 6箇所
      const selectedSpots: PlaceResult[] = [
        createSpot('1', '清水寺', 35.0, 135.7),
        createSpot('2', '金閣寺', 35.1, 135.8),
        createSpot('3', '伏見稲荷', 35.2, 135.9),
        createSpot('4', '嵐山', 35.3, 136.0),
        createSpot('5', '二条城', 35.4, 136.1),
        createSpot('6', '銀閣寺', 35.5, 136.2),
      ]

      // エンドポイント
      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: createSpot('end', '京都駅', 34.9, 135.6),
        accommodations: [
          createSpot('hotel1', 'ホテルA', 35.15, 135.85),
          createSpot('hotel2', 'ホテルB', 35.35, 136.05),
        ],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        3,
        endpoints
      )

      // 検証
      expect(plan.dayItineraries).toHaveLength(3)
      expect(plan.totalDistance).toBeGreaterThan(0)

      // 1日目: 京都駅スタート → ホテルAゴール
      expect(plan.dayItineraries[0].dayNumber).toBe(1)
      expect(plan.dayItineraries[0].startPoint.name).toBe('京都駅')
      expect(plan.dayItineraries[0].endPoint.name).toBe('ホテルA')
      expect(plan.dayItineraries[0].spots.length).toBeGreaterThan(0)

      // 2日目: ホテルAスタート → ホテルBゴール
      expect(plan.dayItineraries[1].dayNumber).toBe(2)
      expect(plan.dayItineraries[1].startPoint.name).toBe('ホテルA')
      expect(plan.dayItineraries[1].endPoint.name).toBe('ホテルB')
      expect(plan.dayItineraries[1].spots.length).toBeGreaterThan(0)

      // 3日目: ホテルBスタート → 京都駅ゴール
      expect(plan.dayItineraries[2].dayNumber).toBe(3)
      expect(plan.dayItineraries[2].startPoint.name).toBe('ホテルB')
      expect(plan.dayItineraries[2].endPoint.name).toBe('京都駅')
      expect(plan.dayItineraries[2].spots.length).toBeGreaterThan(0)

      // すべての日にルート情報があることを確認
      expect(plan.dayItineraries[0].routeInfo).toBeDefined()
      expect(plan.dayItineraries[0].routeInfo?.length).toBeGreaterThan(0)
      expect(plan.dayItineraries[1].routeInfo).toBeDefined()
      expect(plan.dayItineraries[1].routeInfo?.length).toBeGreaterThan(0)
      expect(plan.dayItineraries[2].routeInfo).toBeDefined()
      expect(plan.dayItineraries[2].routeInfo?.length).toBeGreaterThan(0)

      // すべての日に時刻情報があることを確認
      expect(plan.dayItineraries[0].timeSlots).toBeDefined()
      expect(plan.dayItineraries[1].timeSlots).toBeDefined()
      expect(plan.dayItineraries[2].timeSlots).toBeDefined()
    })

    it('1泊2日のプランを正しく生成する', async () => {
      const selectedSpots: PlaceResult[] = [
        createSpot('1', '清水寺', 35.0, 135.7),
        createSpot('2', '金閣寺', 35.1, 135.8),
      ]

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: createSpot('end', '京都駅', 34.9, 135.6),
        accommodations: [createSpot('hotel1', 'ホテルA', 35.05, 135.75)],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        2,
        endpoints
      )

      expect(plan.dayItineraries).toHaveLength(2)

      // 1日目: 京都駅 → ホテルA
      expect(plan.dayItineraries[0].startPoint.name).toBe('京都駅')
      expect(plan.dayItineraries[0].endPoint.name).toBe('ホテルA')

      // 2日目: ホテルA → 京都駅
      expect(plan.dayItineraries[1].startPoint.name).toBe('ホテルA')
      expect(plan.dayItineraries[1].endPoint.name).toBe('京都駅')
    })
  })

  describe('スポット配分', () => {
    it('スポットを日ごとに均等に配分する', async () => {
      // 6スポット → 2日間 = 各日3スポット
      const selectedSpots: PlaceResult[] = Array.from({ length: 6 }, (_, i) =>
        createSpot(`${i + 1}`, `スポット${i + 1}`, 35.0 + i * 0.1, 135.7 + i * 0.1)
      )

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '駅', 34.9, 135.6),
        tripEnd: createSpot('end', '駅', 34.9, 135.6),
        accommodations: [createSpot('hotel1', 'ホテル', 35.3, 135.9)],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        2,
        endpoints
      )

      expect(plan.dayItineraries[0].spots).toHaveLength(3)
      expect(plan.dayItineraries[1].spots).toHaveLength(3)
    })

    it('スポット数が割り切れない場合、前半の日に多く配分する', async () => {
      // 5スポット → 2日間 = 1日目3スポット、2日目2スポット
      const selectedSpots: PlaceResult[] = Array.from({ length: 5 }, (_, i) =>
        createSpot(`${i + 1}`, `スポット${i + 1}`, 35.0 + i * 0.1, 135.7 + i * 0.1)
      )

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '駅', 34.9, 135.6),
        tripEnd: createSpot('end', '駅', 34.9, 135.6),
        accommodations: [createSpot('hotel1', 'ホテル', 35.3, 135.9)],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        2,
        endpoints
      )

      expect(plan.dayItineraries[0].spots).toHaveLength(3)
      expect(plan.dayItineraries[1].spots).toHaveLength(2)
    })
  })

  describe('エッジケース', () => {
    it('スポットが0個の日がある場合（移動のみ）', async () => {
      // 1スポット → 3日間 = 1日目に1スポット、2-3日目は移動のみ
      const selectedSpots: PlaceResult[] = [createSpot('1', 'スポット1', 35.0, 135.7)]

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: createSpot('end', '京都駅', 34.9, 135.6),
        accommodations: [
          createSpot('hotel1', 'ホテルA', 35.05, 135.75),
          createSpot('hotel2', 'ホテルB', 35.1, 135.8),
        ],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        3,
        endpoints
      )

      expect(plan.dayItineraries).toHaveLength(3)
      expect(plan.dayItineraries[0].spots).toHaveLength(1)
      expect(plan.dayItineraries[1].spots).toHaveLength(0) // 移動のみ
      expect(plan.dayItineraries[2].spots).toHaveLength(0) // 移動のみ

      // 移動のみの日でもルートが生成されることを確認
      expect(plan.dayItineraries[1].optimizedRoute).toHaveLength(2) // スタート→ゴール
      expect(plan.dayItineraries[2].optimizedRoute).toHaveLength(2)
    })

    it('スタートとゴールが異なる場合', async () => {
      const selectedSpots: PlaceResult[] = [
        createSpot('1', '清水寺', 35.0, 135.7),
        createSpot('2', '金閣寺', 35.1, 135.8),
      ]

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: createSpot('end', '大阪駅', 34.7, 135.5), // 異なるゴール
        accommodations: [createSpot('hotel1', 'ホテルA', 35.05, 135.75)],
      }

      const plan = await generatePlanWithEndpoints(
        selectedSpots,
        new Date('2025-04-01'),
        2,
        endpoints
      )

      // 1日目: 京都駅 → ホテルA
      expect(plan.dayItineraries[0].startPoint.name).toBe('京都駅')
      expect(plan.dayItineraries[0].endPoint.name).toBe('ホテルA')

      // 2日目: ホテルA → 大阪駅
      expect(plan.dayItineraries[1].startPoint.name).toBe('ホテルA')
      expect(plan.dayItineraries[1].endPoint.name).toBe('大阪駅')
    })
  })

  describe('エラーケース', () => {
    it('1日目のスタート地点が未設定の場合エラー', async () => {
      const selectedSpots: PlaceResult[] = [createSpot('1', 'スポット1', 35.0, 135.7)]

      const endpoints: TripEndpoints = {
        tripStart: null, // 未設定
        tripEnd: createSpot('end', '京都駅', 34.9, 135.6),
        accommodations: [],
      }

      await expect(
        generatePlanWithEndpoints(selectedSpots, new Date('2025-04-01'), 1, endpoints)
      ).rejects.toThrow('1日目のスタート地点が設定されていません')
    })

    it('最終日のゴール地点が未設定の場合エラー', async () => {
      const selectedSpots: PlaceResult[] = [createSpot('1', 'スポット1', 35.0, 135.7)]

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: null, // 未設定
        accommodations: [],
      }

      await expect(
        generatePlanWithEndpoints(selectedSpots, new Date('2025-04-01'), 1, endpoints)
      ).rejects.toThrow('最終日のゴール地点が設定されていません')
    })

    it('宿泊先が不足している場合エラー', async () => {
      const selectedSpots: PlaceResult[] = [createSpot('1', 'スポット1', 35.0, 135.7)]

      const endpoints: TripEndpoints = {
        tripStart: createSpot('start', '京都駅', 34.9, 135.6),
        tripEnd: createSpot('end', '京都駅', 34.9, 135.6),
        accommodations: [], // 2泊なので2箇所必要だが0箇所
      }

      await expect(
        generatePlanWithEndpoints(selectedSpots, new Date('2025-04-01'), 3, endpoints)
      ).rejects.toThrow()
    })
  })
})
