import { render, screen, fireEvent } from '@testing-library/react'
import { SpotList } from '@/components/plan/spot-list'
import type { PlaceResult } from '@/lib/maps/places'

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('SpotList', () => {
  const mockSpots: PlaceResult[] = [
    {
      placeId: 'spot-1',
      name: 'スポット1',
      address: '東京都千代田区',
      lat: 35.6812,
      lng: 139.7671,
      photoUrl: 'https://example.com/photo1.jpg',
      rating: 4.5,
    },
    {
      placeId: 'spot-2',
      name: 'スポット2',
      address: '東京都新宿区',
      lat: 35.6895,
      lng: 139.6917,
      photoUrl: 'https://example.com/photo2.jpg',
      rating: 4.2,
    },
    {
      placeId: 'spot-3',
      name: 'スポット3',
      address: '東京都渋谷区',
      lat: 35.6586,
      lng: 139.7016,
      photoUrl: 'https://example.com/photo3.jpg',
      rating: 4.8,
    },
  ]

  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnRemove.mockClear()
  })

  describe('空状態', () => {
    it('スポットが0件の場合、空状態メッセージが表示される', () => {
      render(<SpotList spots={[]} onRemove={mockOnRemove} />)

      expect(screen.getByText('まだスポットが選択されていません')).toBeInTheDocument()
      expect(
        screen.getByText('検索バーから行きたい場所を探してみましょう')
      ).toBeInTheDocument()
    })
  })

  describe('スポット表示', () => {
    it('ヘッダーに選択済み件数が表示される', () => {
      render(<SpotList spots={mockSpots} onRemove={mockOnRemove} />)

      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
      expect(screen.getByText('3件')).toBeInTheDocument()
    })

    it('すべてのスポットが表示される', () => {
      render(<SpotList spots={mockSpots} onRemove={mockOnRemove} />)

      expect(screen.getByText('スポット1')).toBeInTheDocument()
      expect(screen.getByText('スポット2')).toBeInTheDocument()
      expect(screen.getByText('スポット3')).toBeInTheDocument()
    })

    it('各スポットの削除ボタンが機能する', () => {
      render(<SpotList spots={mockSpots} onRemove={mockOnRemove} />)

      const removeButton = screen.getByRole('button', { name: 'スポット1を削除' })
      fireEvent.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledTimes(1)
      expect(mockOnRemove).toHaveBeenCalledWith(mockSpots[0])
    })
  })

  describe('件数表示', () => {
    it('1件の場合、正しく表示される', () => {
      render(<SpotList spots={[mockSpots[0]]} onRemove={mockOnRemove} />)

      expect(screen.getByText('1件')).toBeInTheDocument()
    })

    it('複数件の場合、正しく表示される', () => {
      render(<SpotList spots={mockSpots} onRemove={mockOnRemove} />)

      expect(screen.getByText('3件')).toBeInTheDocument()
    })
  })
})
