'use client'

import { useState, useRef, useEffect } from 'react'
import { SpotCard } from './spot-card'
import type { PlaceResult } from '@/lib/maps/places'
import { MapPin, ChevronUp, GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectedSpotsSheetProps {
  spots: PlaceResult[]
  onRemove: (spot: PlaceResult) => void
}

type SheetState = 'minimized' | 'expanded'

/**
 * スライドアップシート型の選択済みスポット表示
 * 2段階の表示状態を持つ（最小化・展開）
 */
export function SelectedSpotsSheet({ spots, onRemove }: SelectedSpotsSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('minimized')
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [currentY, setCurrentY] = useState<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

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
      <div className="h-full overflow-x-auto overflow-y-hidden px-4 py-3">
        {spots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
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
            {spots.map((spot) => (
              <div key={spot.placeId} className="w-[200px] flex-shrink-0">
                <SpotCard spot={spot} onRemove={onRemove} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
