'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { SpotCard } from './spot-card'
import type { PlaceResult } from '@/lib/maps/places'
import { MapPin, ChevronUp, GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectedSpotsSheetProps {
  spots: PlaceResult[]
  onRemove: (spot: PlaceResult) => void
  onSpotChange?: (index: number) => void
  onSheetStateChange?: (state: SheetState) => void
}

export interface SelectedSpotsSheetRef {
  scrollToSpot: (index: number) => void
}

export type SheetState = 'minimized' | 'expanded'

/**
 * スライドアップシート型の選択済みスポット表示
 * 2段階の表示状態を持つ（最小化・展開）
 */
export const SelectedSpotsSheet = forwardRef<SelectedSpotsSheetRef, SelectedSpotsSheetProps>(
  function SelectedSpotsSheet({ spots, onRemove, onSpotChange, onSheetStateChange }, ref) {
    const [sheetState, setSheetState] = useState<SheetState>('minimized')

    // シート状態が変更されたら通知
    useEffect(() => {
      onSheetStateChange?.(sheetState)
    }, [sheetState, onSheetStateChange])
    const [dragStartY, setDragStartY] = useState<number | null>(null)
    const [currentY, setCurrentY] = useState<number | null>(null)
    const sheetRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // 外部から呼び出せるスクロール関数を公開
    useImperativeHandle(ref, () => ({
      scrollToSpot: (index: number) => {
        const container = scrollContainerRef.current
        if (!container) return

        // カード幅とギャップ
        const cardWidth = 200
        const gap = 12
        const containerWidth = container.clientWidth
        const spacerWidth = containerWidth / 2 - cardWidth / 2

        // 指定されたインデックスのカードの位置を計算
        const targetScrollLeft = spacerWidth + index * (cardWidth + gap)

        // スクロール
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        })
      },
    }))

  // ドラッグ開始
  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY)
    setCurrentY(clientY)
  }

  // ドラッグ中
  const handleDragMove = (clientY: number) => {
    if (dragStartY === null) return
    setCurrentY(clientY)
  }

  // ドラッグ終了
  const handleDragEnd = () => {
    if (dragStartY === null || currentY === null) {
      setDragStartY(null)
      setCurrentY(null)
      return
    }

    const deltaY = currentY - dragStartY
    const threshold = 50 // 50px以上の移動で状態変更

    if (deltaY < -threshold) {
      // 上にドラッグ → 展開
      if (sheetState === 'minimized') setSheetState('expanded')
    } else if (deltaY > threshold) {
      // 下にドラッグ → 折りたたみ
      if (sheetState === 'expanded') setSheetState('minimized')
    }

    setDragStartY(null)
    setCurrentY(null)
  }

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartY !== null) {
        handleDragMove(e.clientY)
      }
    }

    const handleMouseUp = () => {
      if (dragStartY !== null) {
        handleDragEnd()
      }
    }

    if (dragStartY !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStartY, currentY])

  // ヘッダークリックで展開/折りたたみ
  const handleHeaderClick = () => {
    if (sheetState === 'minimized') setSheetState('expanded')
    else setSheetState('minimized')
  }

  // スクロールイベント: 中央のスポットを検知
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || spots.length === 0) return

    let scrollTimeout: NodeJS.Timeout | null = null

    const handleScroll = () => {
      // スクロールアニメーション中の複数回の発火を防ぐため、
      // スクロールが停止してから一定時間後に処理を実行
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      scrollTimeout = setTimeout(() => {
        // スクロール位置（中央の位置）
        const scrollLeft = container.scrollLeft
        const containerWidth = container.clientWidth
        const centerPosition = scrollLeft + containerWidth / 2

        // 各カードの位置を計算して、中央に最も近いカードを見つける
        const cardWidth = 200 // カード幅
        const gap = 12 // gap-3 = 0.75rem = 12px
        const spacerWidth = containerWidth / 2 - cardWidth / 2

        // 中央のカードインデックスを計算
        const cardIndex = Math.round(
          (centerPosition - spacerWidth - cardWidth / 2) / (cardWidth + gap)
        )

        // 有効な範囲内のインデックスに制限
        const clampedIndex = Math.max(0, Math.min(cardIndex, spots.length - 1))

        // コールバックを呼び出し
        onSpotChange?.(clampedIndex)
      }, 150) // 150ms待機してスクロール完了を検知
    }

    // スクロールイベントリスナーを追加
    container.addEventListener('scroll', handleScroll)

    // 初期表示時も呼び出し
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [spots.length, onSpotChange])

  // 状態に応じた高さクラス
  const heightClass = {
    minimized: 'h-16',
    expanded: 'h-56',
  }[sheetState]

  return (
    <div
      ref={sheetRef}
      className={cn(
        'absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl bg-white shadow-2xl transition-all duration-300 ease-out',
        heightClass
      )}
    >
      {/* ドラッグハンドル + ヘッダー */}
      <div
        className="cursor-pointer border-b"
        onClick={handleHeaderClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* ドラッグインジケーター */}
        <div className="flex justify-center pt-2 pb-1">
          <GripHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* ヘッダー情報 */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium">選択済みスポット</h3>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {spots.length}件
            </span>
          </div>
          <ChevronUp
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-300',
              sheetState === 'minimized' && 'rotate-180'
            )}
          />
        </div>
      </div>

      {/* コンテンツエリア */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-x-auto overflow-y-hidden py-3 snap-x snap-mandatory scroll-smooth"
      >
        {spots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <MapPin className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              まだスポットが選択されていません
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              検索バーから行きたい場所を探してみましょう
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            {/* 左側のスペーサー */}
            <div className="w-[calc(50vw-100px)] flex-shrink-0" />

            {spots.map((spot) => (
              <div key={spot.placeId} className="w-[200px] flex-shrink-0 snap-center">
                <SpotCard spot={spot} onRemove={onRemove} />
              </div>
            ))}

            {/* 右側のスペーサー */}
            <div className="w-[calc(50vw-100px)] flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
})
