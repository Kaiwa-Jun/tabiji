import {
  addSpotMarkers,
  clearMarkers,
} from '@/components/map/spot-marker'
import type { PlaceResult } from '@/lib/maps/places'

// マップのモックメソッド
const mockPanTo = jest.fn()
const mockGetZoom = jest.fn(() => 16)
const mockGetProjection = jest.fn(() => ({
  fromLatLngToPoint: jest.fn(() => ({ x: 100, y: 100 })),
  fromPointToLatLng: jest.fn(() => ({ lat: () => 35.6812, lng: () => 139.7671 })),
}))

const mockMap = {
  panTo: mockPanTo,
  getZoom: mockGetZoom,
  getProjection: mockGetProjection,
} as unknown as google.maps.Map

// 作成されたマーカーインスタンスを保存する配列
const createdMarkers: Array<{
  map: google.maps.Map | null
  content: HTMLElement | null
}> = []

// Google Maps APIグローバルオブジェクトのモック（Advanced Markers API対応）
global.google = {
  maps: {
    LatLng: jest.fn((lat: number, lng: number) => ({ lat, lng })),
    Point: jest.fn((x: number, y: number) => ({ x, y })),
    marker: {
      AdvancedMarkerElement: jest.fn((options: { content?: HTMLElement }) => {
        const markerInstance = {
          map: null as google.maps.Map | null,
          content: options.content || null,
        }
        createdMarkers.push(markerInstance)
        return markerInstance
      }),
    },
  },
} as unknown as typeof google

describe('spot-marker', () => {
  const mockSpots: PlaceResult[] = [
    {
      placeId: '1',
      name: 'スポット1',
      address: '東京都',
      lat: 35.6812,
      lng: 139.7671,
    },
    {
      placeId: '2',
      name: 'スポット2',
      address: '大阪府',
      lat: 34.6937,
      lng: 135.5023,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    createdMarkers.length = 0 // マーカー配列をクリア
    mockPanTo.mockClear()
    mockGetZoom.mockClear()
    mockGetProjection.mockClear()
  })

  describe('addSpotMarkers', () => {
    it('スポット数と同じ数のマーカーを作成する', () => {
      const { markers, detailCards } = addSpotMarkers(mockMap, mockSpots)
      expect(markers).toHaveLength(2)
      expect(detailCards).toHaveLength(2)
      expect(google.maps.marker.AdvancedMarkerElement).toHaveBeenCalledTimes(2)
    })

    it('マーカーに正しい位置情報を設定する', () => {
      addSpotMarkers(mockMap, mockSpots)

      // 1つ目のマーカー
      expect(google.maps.marker.AdvancedMarkerElement).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          position: { lat: 35.6812, lng: 139.7671 },
          title: 'スポット1',
          map: mockMap,
          content: expect.any(HTMLElement),
        })
      )

      // 2つ目のマーカー
      expect(google.maps.marker.AdvancedMarkerElement).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          position: { lat: 34.6937, lng: 135.5023 },
          title: 'スポット2',
          map: mockMap,
          content: expect.any(HTMLElement),
        })
      )
    })

    it('カスタムHTML要素がマーカーのcontentとして設定される', () => {
      addSpotMarkers(mockMap, mockSpots)

      // 各マーカーにcontentが設定されているか確認
      expect(createdMarkers[0].content).toBeTruthy()
      expect(createdMarkers[0].content).toBeInstanceOf(HTMLElement)
      expect(createdMarkers[1].content).toBeTruthy()
      expect(createdMarkers[1].content).toBeInstanceOf(HTMLElement)
    })

    it('カスタムHTML要素にスポット情報が含まれる', () => {
      addSpotMarkers(mockMap, mockSpots)

      // 1つ目のマーカーのcontent
      const content1 = createdMarkers[0].content as HTMLElement
      const textContent1 = content1.textContent || ''
      expect(textContent1).toContain('スポット1')
      expect(textContent1).toContain('東京都')

      // 2つ目のマーカーのcontent
      const content2 = createdMarkers[1].content as HTMLElement
      const textContent2 = content2.textContent || ''
      expect(textContent2).toContain('スポット2')
      expect(textContent2).toContain('大阪府')
    })

    it('クリックコールバックが提供されている場合、イベントリスナーが設定される', () => {
      const onMarkerClick = jest.fn()
      const addEventListener = jest.fn()

      // document.createElementをモック
      const originalCreateElement = document.createElement.bind(document)
      document.createElement = jest.fn((tagName: string) => {
        const element = originalCreateElement(tagName)
        element.addEventListener = addEventListener
        return element
      })

      addSpotMarkers(mockMap, mockSpots, onMarkerClick)

      // イベントリスナーが追加されたか確認
      expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function))

      // 元に戻す
      document.createElement = originalCreateElement
    })

    it('空の配列が渡された場合、空の配列を返す', () => {
      const { markers, detailCards } = addSpotMarkers(mockMap, [])

      expect(markers).toHaveLength(0)
      expect(detailCards).toHaveLength(0)
      expect(google.maps.marker.AdvancedMarkerElement).not.toHaveBeenCalled()
    })

    it('ピンアイコンが初期表示される', () => {
      addSpotMarkers(mockMap, mockSpots)

      const content = createdMarkers[0].content as HTMLElement
      // SVGアイコンが含まれているか確認
      expect(content.innerHTML).toContain('<svg')
      expect(content.innerHTML).toContain('M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z')
    })

    it('詳細カードが初期状態では非表示', () => {
      addSpotMarkers(mockMap, mockSpots)

      const content = createdMarkers[0].content as HTMLElement
      const detailCard = content.querySelector('[class*="bottom-full"]') as HTMLElement

      expect(detailCard).toBeTruthy()
      expect(detailCard.style.display).toBe('none')
    })

    it('ピンをクリックするとonMarkerClickコールバックが呼ばれる', () => {
      const onMarkerClick = jest.fn()
      addSpotMarkers(mockMap, mockSpots, onMarkerClick)

      const content = createdMarkers[0].content as HTMLElement

      // クリックイベントをトリガー
      content.click()

      // コールバックが呼ばれたことを確認
      expect(onMarkerClick).toHaveBeenCalledTimes(1)
      expect(onMarkerClick).toHaveBeenCalledWith(mockSpots[0])
    })

    it('詳細カード要素の配列を返す', () => {
      const { detailCards } = addSpotMarkers(mockMap, mockSpots)

      expect(detailCards).toHaveLength(2)
      expect(detailCards[0]).toBeInstanceOf(HTMLElement)
      expect(detailCards[1]).toBeInstanceOf(HTMLElement)

      // 詳細カードが初期状態で非表示であることを確認
      expect(detailCards[0].style.display).toBe('none')
      expect(detailCards[1].style.display).toBe('none')
    })

    it('返された詳細カード要素を直接操作して表示できる', () => {
      const { detailCards } = addSpotMarkers(mockMap, mockSpots)

      // 最後の詳細カードを表示
      detailCards[detailCards.length - 1].style.display = 'block'

      expect(detailCards[0].style.display).toBe('none')
      expect(detailCards[1].style.display).toBe('block')
    })

    it('コールバックなしでもピンクリックが動作する', () => {
      addSpotMarkers(mockMap, mockSpots)

      const content = createdMarkers[0].content as HTMLElement

      // コールバックなしでもクリックがエラーにならないことを確認
      expect(() => content.click()).not.toThrow()
    })
  })

  describe('clearMarkers', () => {
    it('すべてのマーカーを地図から削除する', () => {
      const mockMarkers = [
        { map: mockMap },
        { map: mockMap },
        { map: mockMap },
      ] as unknown as google.maps.marker.AdvancedMarkerElement[]

      clearMarkers(mockMarkers)

      // Advanced Markersはmapプロパティをnullに設定して削除
      mockMarkers.forEach((marker) => {
        expect(marker.map).toBeNull()
      })
    })

    it('空の配列が渡された場合、エラーなく処理される', () => {
      expect(() => clearMarkers([])).not.toThrow()
    })
  })
})
