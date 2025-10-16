import { allocateSpotsByDay, generateDayPlan } from '@/lib/itinerary/spot-allocator'
import type { Spot } from '@/lib/itinerary/spot-allocator'

describe('allocateSpotsByDay', () => {
  describe('基本動作', () => {
    it('空配列の場合、空配列を返す', () => {
      const result = allocateSpotsByDay([], 3)
      expect(result).toEqual([])
    })

    it('日数が0の場合、空配列を返す', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
      ]

      const result = allocateSpotsByDay(spots, 0)
      expect(result).toEqual([])
    })

    it('1つのスポットを1日に配分', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
      ]

      const result = allocateSpotsByDay(spots, 1)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        name: 'スポットA',
        lat: 35.6812,
        lng: 139.7671,
        dayNumber: 1,
        orderIndex: 1,
      })
    })
  })

  describe('均等配分', () => {
    it('6つのスポットを2日間に均等配分（3/3）', () => {
      const spots: Spot[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 2)

      // 1日目: 3スポット
      const day1 = result.filter((s) => s.dayNumber === 1)
      expect(day1).toHaveLength(3)
      expect(day1[0].orderIndex).toBe(1)
      expect(day1[1].orderIndex).toBe(2)
      expect(day1[2].orderIndex).toBe(3)

      // 2日目: 3スポット
      const day2 = result.filter((s) => s.dayNumber === 2)
      expect(day2).toHaveLength(3)
      expect(day2[0].orderIndex).toBe(1)
      expect(day2[1].orderIndex).toBe(2)
      expect(day2[2].orderIndex).toBe(3)
    })

    it('9つのスポットを3日間に均等配分（3/3/3）', () => {
      const spots: Spot[] = Array.from({ length: 9 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 3)

      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)
      const day3 = result.filter((s) => s.dayNumber === 3)

      expect(day1).toHaveLength(3)
      expect(day2).toHaveLength(3)
      expect(day3).toHaveLength(3)
    })
  })

  describe('余りのスポット配分', () => {
    it('7つのスポットを3日間に配分（3/2/2）', () => {
      const spots: Spot[] = Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 3)

      // 7 ÷ 3 = 2余り1 → 1日目に1つ追加
      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)
      const day3 = result.filter((s) => s.dayNumber === 3)

      expect(day1).toHaveLength(3) // 2 + 1
      expect(day2).toHaveLength(2) // 2
      expect(day3).toHaveLength(2) // 2
    })

    it('10つのスポットを3日間に配分（4/3/3）', () => {
      const spots: Spot[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 3)

      // 10 ÷ 3 = 3余り1 → 1日目に1つ追加
      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)
      const day3 = result.filter((s) => s.dayNumber === 3)

      expect(day1).toHaveLength(4) // 3 + 1
      expect(day2).toHaveLength(3) // 3
      expect(day3).toHaveLength(3) // 3
    })

    it('8つのスポットを3日間に配分（3/3/2）', () => {
      const spots: Spot[] = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 3)

      // 8 ÷ 3 = 2余り2 → 1日目と2日目に1つずつ追加
      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)
      const day3 = result.filter((s) => s.dayNumber === 3)

      expect(day1).toHaveLength(3) // 2 + 1
      expect(day2).toHaveLength(3) // 2 + 1
      expect(day3).toHaveLength(2) // 2
    })
  })

  describe('orderIndexの正確性', () => {
    it('各日のorderIndexは1から始まる', () => {
      const spots: Spot[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 2)

      // 1日目
      const day1 = result.filter((s) => s.dayNumber === 1)
      expect(day1[0].orderIndex).toBe(1)
      expect(day1[1].orderIndex).toBe(2)
      expect(day1[2].orderIndex).toBe(3)

      // 2日目（orderIndexは各日ごとにリセット）
      const day2 = result.filter((s) => s.dayNumber === 2)
      expect(day2[0].orderIndex).toBe(1)
      expect(day2[1].orderIndex).toBe(2)
      expect(day2[2].orderIndex).toBe(3)
    })

    it('スポットの順序が保持される', () => {
      const spots: Spot[] = [
        { id: 'A', name: 'スポットA', lat: 35.6812, lng: 139.7671 },
        { id: 'B', name: 'スポットB', lat: 35.6895, lng: 139.6917 },
        { id: 'C', name: 'スポットC', lat: 35.6700, lng: 139.7500 },
        { id: 'D', name: 'スポットD', lat: 35.6850, lng: 139.7400 },
      ]

      const result = allocateSpotsByDay(spots, 2)

      // 入力順序が保持されている
      expect(result[0].id).toBe('A')
      expect(result[1].id).toBe('B')
      expect(result[2].id).toBe('C')
      expect(result[3].id).toBe('D')
    })
  })

  describe('エッジケース', () => {
    it('スポット数より日数が多い場合', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: 'スポット2', lat: 35.6895, lng: 139.6917 },
      ]

      const result = allocateSpotsByDay(spots, 5)

      // 2スポットを5日間に配分
      // 各日0スポット、最初の2日に1スポットずつ
      expect(result).toHaveLength(2)

      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)

      expect(day1).toHaveLength(1)
      expect(day2).toHaveLength(1)
    })

    it('スポット数が日数の倍数でない場合', () => {
      const spots: Spot[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = allocateSpotsByDay(spots, 2)

      // 5 ÷ 2 = 2余り1 → 1日目: 3, 2日目: 2
      const day1 = result.filter((s) => s.dayNumber === 1)
      const day2 = result.filter((s) => s.dayNumber === 2)

      expect(day1).toHaveLength(3)
      expect(day2).toHaveLength(2)
    })
  })
})

describe('generateDayPlan', () => {
  describe('基本動作', () => {
    it('空配列の場合、空のMapを返す', () => {
      const result = generateDayPlan([], 3)

      expect(result.size).toBe(0)
    })

    it('スポットを日ごとにグループ化したMapを返す', () => {
      const spots: Spot[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = generateDayPlan(spots, 2)

      expect(result.size).toBe(2)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)

      const day1Spots = result.get(1)
      const day2Spots = result.get(2)

      expect(day1Spots).toHaveLength(3)
      expect(day2Spots).toHaveLength(3)
    })

    it('各日のスポットにdayNumberとorderIndexが設定されている', () => {
      const spots: Spot[] = Array.from({ length: 4 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = generateDayPlan(spots, 2)

      const day1Spots = result.get(1)!
      expect(day1Spots[0].dayNumber).toBe(1)
      expect(day1Spots[0].orderIndex).toBe(1)
      expect(day1Spots[1].dayNumber).toBe(1)
      expect(day1Spots[1].orderIndex).toBe(2)

      const day2Spots = result.get(2)!
      expect(day2Spots[0].dayNumber).toBe(2)
      expect(day2Spots[0].orderIndex).toBe(1)
      expect(day2Spots[1].dayNumber).toBe(2)
      expect(day2Spots[1].orderIndex).toBe(2)
    })
  })

  describe('実践的なユースケース', () => {
    it('2泊3日の旅行プラン（9スポット）', () => {
      const spots: Spot[] = [
        { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
        { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
        { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
        { id: '4', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
        { id: '5', name: '皇居', lat: 35.6852, lng: 139.7528 },
        { id: '6', name: '明治神宮', lat: 35.6764, lng: 139.6993 },
        { id: '7', name: '新宿御苑', lat: 35.6852, lng: 139.7100 },
        { id: '8', name: '上野動物園', lat: 35.7154, lng: 139.7731 },
        { id: '9', name: 'お台場', lat: 35.6270, lng: 139.7703 },
      ]

      const result = generateDayPlan(spots, 3)

      expect(result.size).toBe(3)

      // 各日3スポットずつ
      expect(result.get(1)).toHaveLength(3)
      expect(result.get(2)).toHaveLength(3)
      expect(result.get(3)).toHaveLength(3)

      // 全スポットが含まれている
      const allSpots = [
        ...(result.get(1) || []),
        ...(result.get(2) || []),
        ...(result.get(3) || []),
      ]
      expect(allSpots).toHaveLength(9)
    })

    it('1泊2日の旅行プラン（5スポット）', () => {
      const spots: Spot[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = generateDayPlan(spots, 2)

      expect(result.size).toBe(2)

      // 5 ÷ 2 = 2余り1 → 1日目: 3, 2日目: 2
      expect(result.get(1)).toHaveLength(3)
      expect(result.get(2)).toHaveLength(2)
    })
  })

  describe('Mapの構造検証', () => {
    it('Map<number, OptimizedSpot[]>の型で返される', () => {
      const spots: Spot[] = [
        { id: '1', name: 'スポット1', lat: 35.6812, lng: 139.7671 },
      ]

      const result = generateDayPlan(spots, 1)

      expect(result).toBeInstanceOf(Map)
      expect(typeof result.get(1)).toBe('object')
      expect(Array.isArray(result.get(1))).toBe(true)
    })

    it('Mapのキーは日番号（1始まり）', () => {
      const spots: Spot[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        name: `スポット${i + 1}`,
        lat: 35.6812,
        lng: 139.7671,
      }))

      const result = generateDayPlan(spots, 3)

      // キーが1, 2, 3であることを確認
      const keys = Array.from(result.keys())
      expect(keys).toEqual([1, 2, 3])
    })
  })
})
