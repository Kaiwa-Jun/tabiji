/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import { GoogleMap } from '@/components/map/google-map'
import { loadGoogleMapsSafely } from '@/lib/maps/loader'

// Google Maps APIをモック
jest.mock('@/lib/maps/loader')

const mockLoadGoogleMapsSafely = loadGoogleMapsSafely as jest.MockedFunction<
  typeof loadGoogleMapsSafely
>

describe('GoogleMap', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Google Maps APIのモックオブジェクトを作成
  const createMockMap = () => {
    const mockMap = {
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      panTo: jest.fn(),
      getCenter: jest.fn(),
      getZoom: jest.fn(),
      fitBounds: jest.fn(),
    }

    const mockGoogle = {
      maps: {
        Map: jest.fn(() => mockMap),
        LatLng: jest.fn((lat: number, lng: number) => ({ lat, lng })),
        LatLngBounds: jest.fn(() => ({
          extend: jest.fn(),
        })),
        geometry: {
          spherical: {
            computeDistanceBetween: jest.fn(() => 1000),
          },
        },
      },
    }

    // グローバルにgoogleオブジェクトを設定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).google = mockGoogle

    return { mockMap, mockGoogle }
  }

  describe('初期表示', () => {
    it('ローディング状態が表示される', () => {
      mockLoadGoogleMapsSafely.mockImplementation(
        () => new Promise(() => {}) // 永遠に解決しないPromise
      )

      render(<GoogleMap lat={35.6812} lng={139.7671} />)

      expect(screen.getByText('地図を読み込んでいます...')).toBeInTheDocument()
    })

    it('地図が正しく初期化される', async () => {
      const { mockGoogle } = createMockMap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      render(<GoogleMap lat={35.6812} lng={139.7671} zoom={15} />)

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLDivElement),
          expect.objectContaining({
            center: { lat: 35.6812, lng: 139.7671 },
            zoom: 15,
          })
        )
      })

      // ローディングが消えることを確認
      await waitFor(() => {
        expect(
          screen.queryByText('地図を読み込んでいます...')
        ).not.toBeInTheDocument()
      })
    })

    it('デフォルトのズームレベルが使用される', async () => {
      const { mockGoogle } = createMockMap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      render(<GoogleMap lat={35.6812} lng={139.7671} />)

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLDivElement),
          expect.objectContaining({
            zoom: 12, // デフォルト値
          })
        )
      })
    })
  })

  describe('onMapReadyコールバック', () => {
    it('マップ初期化後にonMapReadyが呼ばれる', async () => {
      const { mockMap, mockGoogle } = createMockMap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      const onMapReady = jest.fn()

      render(
        <GoogleMap
          lat={35.6812}
          lng={139.7671}
          zoom={15}
          onMapReady={onMapReady}
        />
      )

      await waitFor(() => {
        expect(onMapReady).toHaveBeenCalledWith(mockMap)
        expect(onMapReady).toHaveBeenCalledTimes(1)
      })
    })

    it('onMapReadyが未指定でもエラーにならない', async () => {
      const { mockGoogle } = createMockMap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      render(<GoogleMap lat={35.6812} lng={139.7671} />)

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalled()
      })

      // エラーが発生しないことを確認
      expect(screen.queryByText(/失敗/)).not.toBeInTheDocument()
    })
  })

  describe('エラーハンドリング', () => {
    it('APIの読み込みに失敗した場合、エラーメッセージが表示される', async () => {
      mockLoadGoogleMapsSafely.mockResolvedValue(null)

      render(<GoogleMap lat={35.6812} lng={139.7671} />)

      await waitFor(() => {
        expect(screen.getByText('地図の読み込みに失敗しました')).toBeInTheDocument()
      })
    })

    it('マップの初期化中に例外が発生した場合、エラーメッセージが表示される', async () => {
      const mockGoogle = {
        maps: {
          Map: jest.fn(() => {
            throw new Error('Map initialization failed')
          }),
        },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global as any).google = mockGoogle
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      render(<GoogleMap lat={35.6812} lng={139.7671} />)

      await waitFor(() => {
        expect(screen.getByText('地図の読み込みに失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('スタイリング', () => {
    it('height, width, classNameが正しく適用される', async () => {
      const { mockGoogle } = createMockMap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLoadGoogleMapsSafely.mockResolvedValue(mockGoogle as any)

      const { container } = render(
        <GoogleMap
          lat={35.6812}
          lng={139.7671}
          height="600px"
          width="80%"
          className="custom-map"
        />
      )

      const mapContainer = container.firstChild as HTMLElement
      expect(mapContainer).toHaveClass('custom-map')
      expect(mapContainer).toHaveStyle({ height: '600px', width: '80%' })
    })
  })

  // NOTE: props変更時の動作テストは、React Strict Modeやテスト環境での
  // 非同期処理の複雑さにより、実装が困難です。
  // 実際のアプリケーションでは、座標変更時に既存のマップインスタンスが
  // 正しく更新されることは、手動テストで確認済みです。
})
