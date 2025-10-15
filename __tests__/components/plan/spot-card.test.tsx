import { render, screen, fireEvent } from '@testing-library/react'
import { SpotCard } from '@/components/plan/spot-card'
import type { PlaceResult } from '@/lib/maps/places'

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('SpotCard', () => {
  const mockSpot: PlaceResult = {
    placeId: 'test-place-id',
    name: 'テストスポット',
    address: '東京都千代田区',
    lat: 35.6812,
    lng: 139.7671,
    photoUrl: 'https://example.com/photo.jpg',
    rating: 4.5,
    types: ['tourist_attraction'],
  }

  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnRemove.mockClear()
  })

  it('スポット情報が正しく表示される', () => {
    render(<SpotCard spot={mockSpot} onRemove={mockOnRemove} />)

    expect(screen.getByText('テストスポット')).toBeInTheDocument()
    expect(screen.getByText('東京都千代田区')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('画像URLがある場合、画像が表示される', () => {
    render(<SpotCard spot={mockSpot} onRemove={mockOnRemove} />)

    const image = screen.getByAltText('テストスポット')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('画像URLがない場合、MapPinアイコンが表示される', () => {
    const spotWithoutPhoto = { ...mockSpot, photoUrl: undefined }
    const { container } = render(<SpotCard spot={spotWithoutPhoto} onRemove={mockOnRemove} />)

    // lucide-reactのMapPinアイコンを確認
    const mapPinIcon = container.querySelector('svg')
    expect(mapPinIcon).toBeInTheDocument()
  })

  it('評価がない場合、評価が表示されない', () => {
    const spotWithoutRating = { ...mockSpot, rating: undefined }
    render(<SpotCard spot={spotWithoutRating} onRemove={mockOnRemove} />)

    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })

  it('削除ボタンをクリックするとonRemoveが呼ばれる', () => {
    render(<SpotCard spot={mockSpot} onRemove={mockOnRemove} />)

    const removeButton = screen.getByRole('button', { name: 'テストスポットを削除' })
    fireEvent.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalledTimes(1)
    expect(mockOnRemove).toHaveBeenCalledWith(mockSpot)
  })
})
