/**
 * @jest-environment jsdom
 */

import {
  panToLocation,
  fitBounds,
  calculateDistance,
  calculateDistanceHaversine,
  getMapCenter,
  getMapZoom,
  calculateCenter,
} from '@/lib/maps/utils'

describe('Maps Utils', () => {
  // Google Maps APIのモック
  beforeAll(() => {
    const mockLatLng = jest.fn((lat: number, lng: number) => ({
      lat: () => lat,
      lng: () => lng,
      toJSON: () => ({ lat, lng }),
    }))

    const mockLatLngBounds = jest.fn(() => {
      const bounds = {
        extend: jest.fn(),
        contains: jest.fn(),
      }
      return bounds
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).google = {
      maps: {
        LatLng: mockLatLng,
        LatLngBounds: mockLatLngBounds,
        geometry: {
          spherical: {
            computeDistanceBetween: jest.fn(() => 2900), // 東京駅-東京タワー間の距離（約2.9km）
          },
        },
      },
    }
  })

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).google
  })

  describe('panToLocation', () => {
    it('地図を指定座標に移動する', () => {
      const mockMap = {
        panTo: jest.fn(),
        setZoom: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      panToLocation(mockMap, 35.6812, 139.7671)

      expect(mockMap.panTo).toHaveBeenCalledWith({
        lat: 35.6812,
        lng: 139.7671,
      })
      expect(mockMap.setZoom).not.toHaveBeenCalled()
    })

    it('ズームレベルを指定した場合、ズームも変更される', () => {
      const mockMap = {
        panTo: jest.fn(),
        setZoom: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      panToLocation(mockMap, 35.6812, 139.7671, 15)

      expect(mockMap.panTo).toHaveBeenCalledWith({
        lat: 35.6812,
        lng: 139.7671,
      })
      expect(mockMap.setZoom).toHaveBeenCalledWith(15)
    })

    it('zoom=0の場合もズームが設定される', () => {
      const mockMap = {
        panTo: jest.fn(),
        setZoom: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      panToLocation(mockMap, 35.6812, 139.7671, 0)

      expect(mockMap.setZoom).toHaveBeenCalledWith(0)
    })
  })

  describe('fitBounds', () => {
    it('空の配列の場合、エラーをthrowする', () => {
      const mockMap = {
        fitBounds: jest.fn(),
        panTo: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      expect(() => fitBounds(mockMap, [])).toThrow(
        '[fitBounds] No locations provided'
      )
      expect(mockMap.fitBounds).not.toHaveBeenCalled()
      expect(mockMap.panTo).not.toHaveBeenCalled()
    })

    it('1つの地点の場合、その地点にパンする', () => {
      const mockMap = {
        fitBounds: jest.fn(),
        panTo: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const locations = [{ lat: 35.6812, lng: 139.7671 }]

      fitBounds(mockMap, locations)

      expect(mockMap.panTo).toHaveBeenCalledWith({
        lat: 35.6812,
        lng: 139.7671,
      })
      expect(mockMap.fitBounds).not.toHaveBeenCalled()
    })

    it('複数地点の場合、全てを含む境界に合わせる', () => {
      const mockBounds = {
        extend: jest.fn(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global as any).google.maps.LatLngBounds = jest.fn(() => mockBounds)

      const mockMap = {
        fitBounds: jest.fn(),
        panTo: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const locations = [
        { lat: 35.6812, lng: 139.7671 }, // 東京駅
        { lat: 35.6586, lng: 139.7454 }, // 東京タワー
      ]

      fitBounds(mockMap, locations)

      expect(mockBounds.extend).toHaveBeenCalledTimes(2)
      expect(mockMap.fitBounds).toHaveBeenCalledWith(mockBounds, 50)
      expect(mockMap.panTo).not.toHaveBeenCalled()
    })

    it('カスタムパディングを指定できる', () => {
      const mockBounds = {
        extend: jest.fn(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global as any).google.maps.LatLngBounds = jest.fn(() => mockBounds)

      const mockMap = {
        fitBounds: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const locations = [
        { lat: 35.6812, lng: 139.7671 },
        { lat: 35.6586, lng: 139.7454 },
      ]

      fitBounds(mockMap, locations, 100)

      expect(mockMap.fitBounds).toHaveBeenCalledWith(mockBounds, 100)
    })
  })

  describe('calculateDistance', () => {
    it('2点間の距離を計算する', () => {
      const from = { lat: 35.6812, lng: 139.7671 } // 東京駅
      const to = { lat: 35.6586, lng: 139.7454 } // 東京タワー

      const distance = calculateDistance(from, to)

      expect(distance).toBe(2900)
      expect(
        google.maps.geometry.spherical.computeDistanceBetween
      ).toHaveBeenCalled()
    })

    it('同じ座標間の距離は0になる', () => {
      ;(
        google.maps.geometry.spherical.computeDistanceBetween as jest.Mock
      ).mockReturnValueOnce(0)

      const location = { lat: 35.6812, lng: 139.7671 }
      const distance = calculateDistance(location, location)

      expect(distance).toBe(0)
    })
  })

  describe('getMapCenter', () => {
    it('地図の中心座標を取得する', () => {
      const mockCenter = {
        lat: () => 35.6812,
        lng: () => 139.7671,
      }

      const mockMap = {
        getCenter: jest.fn(() => mockCenter),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const center = getMapCenter(mockMap)

      expect(center).toEqual({ lat: 35.6812, lng: 139.7671 })
      expect(mockMap.getCenter).toHaveBeenCalled()
    })

    it('中心座標が取得できない場合はエラーをthrowする', () => {
      const mockMap = {
        getCenter: jest.fn(() => null),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      expect(() => getMapCenter(mockMap)).toThrow('Failed to get map center')
    })
  })

  describe('getMapZoom', () => {
    it('地図のズームレベルを取得する', () => {
      const mockMap = {
        getZoom: jest.fn(() => 15),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const zoom = getMapZoom(mockMap)

      expect(zoom).toBe(15)
      expect(mockMap.getZoom).toHaveBeenCalled()
    })

    it('ズームレベルが取得できない場合はエラーをthrowする', () => {
      const mockMap = {
        getZoom: jest.fn(() => undefined),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      expect(() => getMapZoom(mockMap)).toThrow('Failed to get map zoom')
    })
  })

  describe('calculateCenter', () => {
    it('複数地点の中心座標を計算する', () => {
      const locations = [
        { lat: 35.6812, lng: 139.7671 }, // 東京駅
        { lat: 35.6586, lng: 139.7454 }, // 東京タワー
        { lat: 35.7101, lng: 139.8107 }, // スカイツリー
      ]

      const center = calculateCenter(locations)

      expect(center.lat).toBeCloseTo(35.6833, 4)
      expect(center.lng).toBeCloseTo(139.7744, 4)
    })

    it('1つの地点の場合、その座標を返す', () => {
      const locations = [{ lat: 35.6812, lng: 139.7671 }]

      const center = calculateCenter(locations)

      expect(center).toEqual({ lat: 35.6812, lng: 139.7671 })
    })

    it('空の配列の場合、原点座標を返す', () => {
      const center = calculateCenter([])

      expect(center).toEqual({ lat: 0, lng: 0 })
    })

    it('2つの地点の中点を正しく計算する', () => {
      const locations = [
        { lat: 35.0, lng: 139.0 },
        { lat: 36.0, lng: 140.0 },
      ]

      const center = calculateCenter(locations)

      expect(center).toEqual({ lat: 35.5, lng: 139.5 })
    })
  })

  describe('calculateDistanceHaversine', () => {
    it('2点間の距離を計算する（Google Maps API非依存）', () => {
      const from = { lat: 35.6812, lng: 139.7671 } // 東京駅
      const to = { lat: 35.6586, lng: 139.7454 } // 東京タワー

      const distance = calculateDistanceHaversine(from, to)

      // Haversine公式による実際の距離は約3187m
      expect(distance).toBeCloseTo(3187, 0)
    })

    it('同じ座標間の距離は0になる', () => {
      const location = { lat: 35.6812, lng: 139.7671 }
      const distance = calculateDistanceHaversine(location, location)

      expect(distance).toBe(0)
    })

    it('北半球の長距離を計算できる', () => {
      const from = { lat: 35.6812, lng: 139.7671 } // 東京
      const to = { lat: 34.6937, lng: 135.5023 } // 大阪

      const distance = calculateDistanceHaversine(from, to)

      // 実際の距離は約400km（400000m）
      expect(distance).toBeCloseTo(400000, -4)
    })

    it('非常に近い距離を計算できる', () => {
      const from = { lat: 35.6812, lng: 139.7671 }
      const to = { lat: 35.6813, lng: 139.7672 }

      const distance = calculateDistanceHaversine(from, to)

      // 約14m（0.0001度の差）
      expect(distance).toBeCloseTo(14, 0)
    })

    it('赤道付近の距離を計算できる', () => {
      const from = { lat: 0.0, lng: 0.0 }
      const to = { lat: 0.0, lng: 1.0 }

      const distance = calculateDistanceHaversine(from, to)

      // 赤道上の1度は約111km
      expect(distance).toBeCloseTo(111000, -3)
    })
  })
})
