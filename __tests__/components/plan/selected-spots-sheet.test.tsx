import { render, screen, fireEvent } from '@testing-library/react'
import { SelectedSpotsSheet } from '@/components/plan/selected-spots-sheet'
import type { PlaceResult } from '@/lib/maps/places'

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('SelectedSpotsSheet', () => {
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
      render(<SelectedSpotsSheet spots={[]} onRemove={mockOnRemove} />)

      expect(screen.getByText('まだスポットが選択されていません')).toBeInTheDocument()
      expect(
        screen.getByText('検索バーから行きたい場所を探してみましょう')
      ).toBeInTheDocument()
    })
  })

  describe('ヘッダー表示', () => {
    it('ヘッダーに選択済み件数が表示される', () => {
      render(<SelectedSpotsSheet spots={mockSpots} onRemove={mockOnRemove} />)

      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
      expect(screen.getByText('3件')).toBeInTheDocument()
    })

    it('ヘッダーをクリックすると状態が変化する', () => {
      const { container } = render(
        <SelectedSpotsSheet spots={mockSpots} onRemove={mockOnRemove} />
      )

      const header = screen.getByText('選択済みスポット').closest('div')
      expect(header).toBeInTheDocument()

      // 最初は最小化状態（h-16）
      const sheet = container.querySelector('.absolute')
      expect(sheet).toHaveClass('h-16')

      // クリックで展開状態に（h-56）
      if (header) {
        fireEvent.click(header)
        expect(sheet).toHaveClass('h-56')

        // もう一度クリックで最小化に戻る
        fireEvent.click(header)
        expect(sheet).toHaveClass('h-16')
      }
    })
  })

  describe('スポット表示', () => {
    it('すべてのスポットが表示される', () => {
      render(<SelectedSpotsSheet spots={mockSpots} onRemove={mockOnRemove} />)

      expect(screen.getByText('スポット1')).toBeInTheDocument()
      expect(screen.getByText('スポット2')).toBeInTheDocument()
      expect(screen.getByText('スポット3')).toBeInTheDocument()
    })

    it('各スポットの削除ボタンが機能する', () => {
      render(<SelectedSpotsSheet spots={mockSpots} onRemove={mockOnRemove} />)

      const removeButton = screen.getByRole('button', { name: 'スポット1を削除' })
      fireEvent.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledTimes(1)
      expect(mockOnRemove).toHaveBeenCalledWith(mockSpots[0])
    })
  })

  describe('レスポンシブ表示', () => {
    it('1件の場合、正しく表示される', () => {
      render(<SelectedSpotsSheet spots={[mockSpots[0]]} onRemove={mockOnRemove} />)

      expect(screen.getByText('1件')).toBeInTheDocument()
      expect(screen.getByText('スポット1')).toBeInTheDocument()
    })
  })
})
