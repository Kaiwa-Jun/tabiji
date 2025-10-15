import { renderHook, act } from '@testing-library/react'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import type { PlaceResult } from '@/lib/maps/places'

describe('SearchModalContext - removeSpot', () => {
  const mockSpot1: PlaceResult = {
    placeId: 'spot-1',
    name: 'スポット1',
    address: '東京都千代田区',
    lat: 35.6812,
    lng: 139.7671,
    rating: 4.5,
  }

  const mockSpot2: PlaceResult = {
    placeId: 'spot-2',
    name: 'スポット2',
    address: '東京都新宿区',
    lat: 35.6895,
    lng: 139.6917,
    rating: 4.2,
  }

  const mockSpot3: PlaceResult = {
    placeId: 'spot-3',
    name: 'スポット3',
    address: '東京都渋谷区',
    lat: 35.6586,
    lng: 139.7016,
    rating: 4.8,
  }

  it('removeSpotで指定したスポットが削除される', () => {
    const { result } = renderHook(() => useSearchModal(), {
      wrapper: SearchModalProvider,
    })

    // スポットを追加
    act(() => {
      result.current.selectSpot(mockSpot1)
    })
    act(() => {
      result.current.selectSpot(mockSpot2)
    })
    act(() => {
      result.current.selectSpot(mockSpot3)
    })

    expect(result.current.selectedSpots).toHaveLength(3)

    // スポット2を削除
    act(() => {
      result.current.removeSpot(mockSpot2)
    })

    expect(result.current.selectedSpots).toHaveLength(2)
    expect(result.current.selectedSpots).toEqual([mockSpot1, mockSpot3])
  })

  it('removeSpotで最初のスポットが削除される', () => {
    const { result } = renderHook(() => useSearchModal(), {
      wrapper: SearchModalProvider,
    })

    act(() => {
      result.current.selectSpot(mockSpot1)
    })
    act(() => {
      result.current.selectSpot(mockSpot2)
    })

    // 最初のスポットを削除
    act(() => {
      result.current.removeSpot(mockSpot1)
    })

    expect(result.current.selectedSpots).toHaveLength(1)
    expect(result.current.selectedSpots[0]).toEqual(mockSpot2)
  })

  it('removeSpotで最後のスポットが削除される', () => {
    const { result } = renderHook(() => useSearchModal(), {
      wrapper: SearchModalProvider,
    })

    act(() => {
      result.current.selectSpot(mockSpot1)
    })
    act(() => {
      result.current.selectSpot(mockSpot2)
    })

    // 最後のスポットを削除
    act(() => {
      result.current.removeSpot(mockSpot2)
    })

    expect(result.current.selectedSpots).toHaveLength(1)
    expect(result.current.selectedSpots[0]).toEqual(mockSpot1)
  })

  it('存在しないスポットを削除しても配列は変化しない', () => {
    const { result } = renderHook(() => useSearchModal(), {
      wrapper: SearchModalProvider,
    })

    act(() => {
      result.current.selectSpot(mockSpot1)
    })

    const nonExistentSpot: PlaceResult = {
      placeId: 'non-existent',
      name: '存在しないスポット',
      address: 'どこか',
      lat: 0,
      lng: 0,
    }

    act(() => {
      result.current.removeSpot(nonExistentSpot)
    })

    expect(result.current.selectedSpots).toHaveLength(1)
    expect(result.current.selectedSpots[0]).toEqual(mockSpot1)
  })

  it('すべてのスポットを削除すると空配列になる', () => {
    const { result } = renderHook(() => useSearchModal(), {
      wrapper: SearchModalProvider,
    })

    act(() => {
      result.current.selectSpot(mockSpot1)
    })
    act(() => {
      result.current.selectSpot(mockSpot2)
    })

    act(() => {
      result.current.removeSpot(mockSpot1)
    })
    act(() => {
      result.current.removeSpot(mockSpot2)
    })

    expect(result.current.selectedSpots).toHaveLength(0)
  })
})
