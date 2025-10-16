/**
 * @jest-environment jsdom
 */

import { optimizeSpotOrder } from '@/lib/itinerary/optimizer'
import type { Spot } from '@/lib/itinerary/optimizer'

describe('optimizeSpotOrder', () => {
  // Google Maps APIのモック
  beforeAll(() => {
    const mockLatLng = jest.fn((lat: number, lng: number) => ({
      lat: () => lat,
      lng: () => lng,
      toJSON: () => ({ lat, lng }),
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).google = {
      maps: {
        LatLng: mockLatLng,
        geometry: {
          spherical: {
            // モックの距離計算: 簡易的にユークリッド距離の近似値を返す
            computeDistanceBetween: jest.fn((from, to) => {
              const latDiff = from.lat() - to.lat()
              const lngDiff = from.lng() - to.lng()
              // 地球上の1度あたり約111kmとして計算
              return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000
            }),
          },
        },
      },
    }
  })

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).google
  })

  describe('基本動作', () => {
    it('空配列の場合、空配列を返す', () => {
      const result = optimizeSpotOrder([])
      expect(result).toEqual([])
    })

    it('1つのスポットの場合、そのまま返す', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
      ]

      const result = optimizeSpotOrder(spots)

      expect(result).toEqual(spots)
      expect(result).toHaveLength(1)
    })

    it('2つのスポットの場合、適切に処理される', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: 'スポットB', lat: 35.6895, lng: 139.6917 },
      ]

      const result = optimizeSpotOrder(spots)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeDefined()
      expect(result[1]).toBeDefined()
    })
  })

  describe('最適化アルゴリズム', () => {
    it('最も西にあるスポットが最初に選択される', () => {
      const spots: Spot[] = [
        { id: '1', name: '東京タワー', lat: 35.6586, lng: 139.7454 }, // 経度: 139.7454
        { id: '2', name: '浅草寺', lat: 35.7148, lng: 139.7967 }, // 経度: 139.7967 (最も東)
        { id: '3', name: '皇居', lat: 35.6852, lng: 139.7528 }, // 経度: 139.7528
        { id: '4', name: '明治神宮', lat: 35.6764, lng: 139.6993 }, // 経度: 139.6993 (最も西)
      ]

      const result = optimizeSpotOrder(spots)

      // 最も西にある明治神宮が最初
      expect(result[0].id).toBe('4')
      expect(result[0].name).toBe('明治神宮')
    })

    it('複数スポットを最近傍法で最適化する', () => {
      // 配置: A(西) -> C(中央) -> B(東)
      const spots: Spot[] = [
        { id: 'A', name: 'スポットA', lat: 35.6812, lng: 139.6500 }, // 西
        { id: 'B', name: 'スポットB', lat: 35.6812, lng: 139.8000 }, // 東
        { id: 'C', name: 'スポットC', lat: 35.6812, lng: 139.7250 }, // 中央
      ]

      const result = optimizeSpotOrder(spots)

      // 期待される順序: A(西から開始) -> C(Aに最も近い) -> B(Cに最も近い)
      expect(result[0].id).toBe('A') // 最も西
      expect(result[1].id).toBe('C') // Aから最も近い
      expect(result[2].id).toBe('B') // Cから最も近い
    })

    it('より複雑なケース: 5つのスポットを最適化', () => {
      const spots: Spot[] = [
        { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
        { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
        { id: '4', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '5', name: '皇居', lat: 35.6852, lng: 139.7528 },
      ]

      const result = optimizeSpotOrder(spots)

      // すべてのスポットが含まれている
      expect(result).toHaveLength(5)

      // 重複がない
      const ids = result.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)

      // 最も西のスポットが最初（東京タワー: 139.7454）
      expect(result[0].id).toBe('2')
    })

    it('同じ経度の場合でも正しく処理される', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: 'スポット2', lat: 35.6895, lng: 139.7671 }, // 同じ経度
        { id: '3', name: 'スポット3', lat: 35.6700, lng: 139.7671 }, // 同じ経度
      ]

      const result = optimizeSpotOrder(spots)

      expect(result).toHaveLength(3)
      // 少なくとも処理が完了している
      expect(result[0]).toBeDefined()
    })
  })

  describe('元の配列を変更しない', () => {
    it('入力配列は変更されない', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: 'スポットB', lat: 35.6895, lng: 139.6917 },
        { id: '3', name: 'スポットC', lat: 35.6700, lng: 139.7500 },
      ]

      const originalOrder = spots.map((s) => s.id)
      optimizeSpotOrder(spots)

      // 元の配列の順序が変わっていないことを確認
      expect(spots.map((s) => s.id)).toEqual(originalOrder)
    })
  })

  describe('エッジケース', () => {
    it('非常に近い距離のスポット群を処理できる', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: 'スポット2', lat: 35.6813, lng: 139.7672 }, // わずかに離れた場所
        { id: '3', name: 'スポット3', lat: 35.6814, lng: 139.7673 },
      ]

      const result = optimizeSpotOrder(spots)

      expect(result).toHaveLength(3)
      expect(result[0]).toBeDefined()
    })

    it('非常に離れた距離のスポット群を処理できる', () => {
      const spots: Spot[] = [
        { id: '1', name: '東京', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: '大阪', lat: 34.6937, lng: 135.5023 },
        { id: '3', name: '福岡', lat: 33.5904, lng: 130.4017 },
      ]

      const result = optimizeSpotOrder(spots)

      expect(result).toHaveLength(3)
      // 西から東の順: 福岡 -> 大阪 -> 東京
      expect(result[0].id).toBe('3') // 福岡（最も西）
    })
  })
})
