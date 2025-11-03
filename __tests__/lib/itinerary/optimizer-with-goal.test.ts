import { optimizeSpotOrderWithGoal } from '@/lib/itinerary/optimizer-with-goal'
import type { Spot } from '@/lib/itinerary/types'

describe('optimizeSpotOrderWithGoal', () => {
  const startPoint: Spot = {
    id: 'start',
    name: '東京駅',
    lat: 35.6812,
    lng: 139.7671,
  }

  const endPoint: Spot = {
    id: 'end',
    name: '東京駅',
    lat: 35.6812,
    lng: 139.7671,
  }

  describe('基本的な動作', () => {
    it('3箇所のスポットを正しく最適化する', () => {
      const spots: Spot[] = [
        { id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '2', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
        { id: '3', name: '上野動物園', lat: 35.7156, lng: 139.7731 },
      ]

      const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)

      // 結果検証
      expect(result.optimizedSpots).toHaveLength(3)
      expect(result.totalDistance).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThan(0)

      // すべてのスポットが含まれていることを確認
      const spotIds = result.optimizedSpots.map((s) => s.id)
      expect(spotIds).toContain('1')
      expect(spotIds).toContain('2')
      expect(spotIds).toContain('3')
    })

    it('5箇所のスポットを正しく最適化する', () => {
      const spots: Spot[] = [
        { id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '2', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
        { id: '3', name: '上野動物園', lat: 35.7156, lng: 139.7731 },
        { id: '4', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
        { id: '5', name: '皇居', lat: 35.6852, lng: 139.7528 },
      ]

      const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)

      expect(result.optimizedSpots).toHaveLength(5)
      expect(result.totalDistance).toBeGreaterThan(0)

      // すべてのスポットが含まれていることを確認
      const spotIds = result.optimizedSpots.map((s) => s.id)
      expect(spotIds).toHaveLength(5)
      expect(new Set(spotIds).size).toBe(5) // 重複なし
    })
  })

  describe('エッジケース', () => {
    it('スポットが0個の場合', () => {
      const result = optimizeSpotOrderWithGoal([], startPoint, endPoint)

      expect(result.optimizedSpots).toHaveLength(0)
      expect(result.totalDistance).toBe(0)
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('スポットが1個の場合', () => {
      const spots: Spot[] = [{ id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 }]

      const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)

      expect(result.optimizedSpots).toHaveLength(1)
      expect(result.optimizedSpots[0].id).toBe('1')
      expect(result.totalDistance).toBeGreaterThan(0)
    })

    it('スタートとゴールが異なる場合', () => {
      const spots: Spot[] = [
        { id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '2', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
      ]

      const differentEndPoint: Spot = {
        id: 'end',
        name: '新宿駅',
        lat: 35.6896,
        lng: 139.7006,
      }

      const result = optimizeSpotOrderWithGoal(spots, startPoint, differentEndPoint)

      expect(result.optimizedSpots).toHaveLength(2)
      expect(result.totalDistance).toBeGreaterThan(0)
    })
  })

  describe('ゴール重みの影響', () => {
    const spots: Spot[] = [
      { id: '1', name: 'A', lat: 35.6, lng: 139.7 },
      { id: '2', name: 'B', lat: 35.7, lng: 139.8 },
      { id: '3', name: 'C', lat: 35.8, lng: 139.9 },
    ]

    const testStartPoint: Spot = {
      id: 'start',
      name: 'スタート',
      lat: 35.5,
      lng: 139.6,
    }

    const testEndPoint: Spot = {
      id: 'end',
      name: 'ゴール',
      lat: 35.9,
      lng: 140.0,
    }

    it('ゴール重み0.0（通常の最近傍法）で最適化する', () => {
      const result = optimizeSpotOrderWithGoal(spots, testStartPoint, testEndPoint, {
        goalWeight: 0.0,
      })

      expect(result.optimizedSpots).toHaveLength(3)
      expect(result.totalDistance).toBeGreaterThan(0)
    })

    it('ゴール重み0.3（デフォルト）で最適化する', () => {
      const result = optimizeSpotOrderWithGoal(spots, testStartPoint, testEndPoint, {
        goalWeight: 0.3,
      })

      expect(result.optimizedSpots).toHaveLength(3)
      expect(result.totalDistance).toBeGreaterThan(0)
    })

    it('ゴール重み0.5（ゴール重視）で最適化する', () => {
      const result = optimizeSpotOrderWithGoal(spots, testStartPoint, testEndPoint, {
        goalWeight: 0.5,
      })

      expect(result.optimizedSpots).toHaveLength(3)
      expect(result.totalDistance).toBeGreaterThan(0)
    })

    it('ゴール重み1.0（最大）で最適化する', () => {
      const result = optimizeSpotOrderWithGoal(spots, testStartPoint, testEndPoint, {
        goalWeight: 1.0,
      })

      expect(result.optimizedSpots).toHaveLength(3)
      expect(result.totalDistance).toBeGreaterThan(0)
    })
  })

  describe('デバッグモード', () => {
    it('デバッグログを出力する', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const spots: Spot[] = [
        { id: '1', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '2', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
      ]

      optimizeSpotOrderWithGoal(spots, startPoint, endPoint, { debug: true })

      // デバッグログが出力されていることを確認
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('実行時間', () => {
    it('10箇所のスポットを10ms以内に最適化する', () => {
      const spots: Spot[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6 + Math.random() * 0.2,
        lng: 139.7 + Math.random() * 0.2,
      }))

      const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)

      expect(result.executionTime).toBeLessThan(10)
    })

    it('20箇所のスポットを50ms以内に最適化する', () => {
      const spots: Spot[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6 + Math.random() * 0.2,
        lng: 139.7 + Math.random() * 0.2,
      }))

      const result = optimizeSpotOrderWithGoal(spots, startPoint, endPoint)

      expect(result.executionTime).toBeLessThan(50)
    })
  })
})
