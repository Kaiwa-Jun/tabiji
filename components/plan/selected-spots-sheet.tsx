'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { SpotCard } from './spot-card'
import type { PlaceResult } from '@/lib/maps/places'
import { MapPin, ChevronUp, GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { debugLog } from '@/lib/debug-logger'

interface SpotWithDay {
  spot: PlaceResult
  dayNumber?: number // プレビューモード時の日数（1日目、2日目...）
}

interface SelectedSpotsSheetProps {
  spots: PlaceResult[]
  onRemove: (spot: PlaceResult) => void
  onSpotChange?: (index: number) => void
  onSheetStateChange?: (state: SheetState) => void
  isPreviewMode?: boolean
  // プレビューモード時に日ごとの情報を渡す（オプション）
  spotsWithDays?: SpotWithDay[]
}

export interface SelectedSpotsSheetRef {
  scrollToSpot: (index: number) => void
  setSheetState: (state: SheetState) => void
}

export type SheetState = 'minimized' | 'expanded'

/**
 * スライドアップシート型の選択済みスポット表示
 * 2段階の表示状態を持つ（最小化・展開）
 */
export const SelectedSpotsSheet = forwardRef<SelectedSpotsSheetRef, SelectedSpotsSheetProps>(
  function SelectedSpotsSheet(
    { spots, onRemove, onSpotChange, onSheetStateChange, isPreviewMode = false, spotsWithDays },
    ref
  ) {
    const [sheetState, setSheetState] = useState<SheetState>('minimized')

    // シート状態が変更されたら通知
    useEffect(() => {
      onSheetStateChange?.(sheetState)
    }, [sheetState, onSheetStateChange])
    const [dragStartY, setDragStartY] = useState<number | null>(null)
    const [currentY, setCurrentY] = useState<number | null>(null)
    const sheetRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // 外部から呼び出せる関数を公開
    useImperativeHandle(ref, () => ({
      scrollToSpot: (index: number) => {
        const container = scrollContainerRef.current
        if (!container) return

        // カード幅とギャップ
        const cardWidth = 200
        const gap = 12
        const containerWidth = container.clientWidth
        const spacerWidth = containerWidth / 2 - cardWidth / 2

        // プレビューモード時で日付ラベルが表示される場合の幅を考慮
        // 指定されたインデックスまでのすべての日付ラベルの幅を累積計算
        let dayLabelOffset = 0
        if (isPreviewMode && spotsWithDays) {
          for (let i = 0; i < index && i < spotsWithDays.length; i++) {
            const currentItem = spotsWithDays[i]
            const prevItem = i > 0 ? spotsWithDays[i - 1] : null
            const showDayLabel = currentItem.dayNumber && currentItem.dayNumber !== prevItem?.dayNumber
            
            // 日付ラベルの幅（約70px）+ ギャップ（12px）
            if (showDayLabel) {
              dayLabelOffset += 70 + gap
            }
          }
        }

        // 指定されたインデックスのカードの位置を計算（日付ラベルのオフセットを含む）
        const targetScrollLeft = spacerWidth + index * (cardWidth + gap) + dayLabelOffset

        // スクロール
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        })
      },
      setSheetState: (state: SheetState) => {
        setSheetState(state)
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

  // プレビューモード時はspotsWithDaysを使用、それ以外はspotsを使用
  const displaySpots = isPreviewMode && spotsWithDays ? spotsWithDays : spots.map(spot => ({ spot }))
  const totalSpotsCount = displaySpots.length

  // スクロールイベント: 中央のスポットを検知
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || totalSpotsCount === 0) return

    // 初期表示時にログ出力（表示される度に出力されるので、条件を追加）
    if (isPreviewMode && spotsWithDays) {
      debugLog('displaySpots vs spotsWithDays 比較', {
        tag: 'プラン候補表示',
        data: {
          displaySpotsCount: displaySpots.length,
          spotsWithDaysCount: spotsWithDays.length,
          displaySpots: displaySpots.map((item, idx) => ({
            index: idx,
            name: item.spot.name,
            placeId: item.spot.placeId,
            dayNumber: item.dayNumber,
          })),
          spotsWithDays: spotsWithDays.map((item, idx) => ({
            index: idx,
            name: item.spot.name,
            placeId: item.spot.placeId,
            dayNumber: item.dayNumber,
          })),
          // 順序の比較
          orderMatch: displaySpots.every((item, idx) => {
            const corresponding = spotsWithDays[idx]
            return corresponding && item.spot.placeId === corresponding.spot.placeId
          }),
        },
      })
    }

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
        const dayLabelWidth = 70 // 日付ラベルの幅（約70px）
        const spacerWidth = containerWidth / 2 - cardWidth / 2

        // プレビューモード時は日付ラベルの幅を考慮して各カードの実際の位置を計算
        let minDistance = Infinity
        let closestIndex = 0

        for (let i = 0; i < displaySpots.length; i++) {
          // このカードより前にある日付ラベルの幅を累積計算
          let dayLabelOffset = 0
          if (isPreviewMode && spotsWithDays) {
            for (let j = 0; j < i; j++) {
              const currentItem = displaySpots[j]
              const prevItem = j > 0 ? displaySpots[j - 1] : null
              const showDayLabel = currentItem.dayNumber && currentItem.dayNumber !== prevItem?.dayNumber
              
              if (showDayLabel) {
                dayLabelOffset += dayLabelWidth + gap
              }
            }
          }

          // このカードの左端の位置を計算
          const cardLeft = spacerWidth + i * (cardWidth + gap) + dayLabelOffset
          // このカードの中心位置
          const cardCenter = cardLeft + cardWidth / 2

          // 中央位置との距離を計算
          const distance = Math.abs(centerPosition - cardCenter)
          if (distance < minDistance) {
            minDistance = distance
            closestIndex = i
          }
        }

        // 有効な範囲内のインデックスに制限
        const clampedIndex = Math.max(0, Math.min(closestIndex, totalSpotsCount - 1))

        debugLog('中央のスポット検知', {
          tag: 'プラン候補スクロール',
          data: {
            scrollLeft,
            containerWidth,
            centerPosition,
            closestIndex,
            clampedIndex,
            minDistance,
            spotName: displaySpots[clampedIndex]?.spot.name,
            spotPlaceId: displaySpots[clampedIndex]?.spot.placeId,
            dayNumber: displaySpots[clampedIndex]?.dayNumber,
            // 各カードの位置情報をデバッグ用に出力
            cardPositions: displaySpots.slice(0, Math.min(8, displaySpots.length)).map((item, idx) => {
              let dayLabelOffset = 0
              if (isPreviewMode && spotsWithDays) {
                for (let j = 0; j < idx; j++) {
                  const currentItem = displaySpots[j]
                  const prevItem = j > 0 ? displaySpots[j - 1] : null
                  const showDayLabel = currentItem.dayNumber && currentItem.dayNumber !== prevItem?.dayNumber
                  if (showDayLabel) {
                    dayLabelOffset += dayLabelWidth + gap
                  }
                }
              }
              const cardLeft = spacerWidth + idx * (cardWidth + gap) + dayLabelOffset
              const cardCenter = cardLeft + cardWidth / 2
              return {
                index: idx,
                name: item.spot.name,
                cardLeft,
                cardCenter,
                distance: Math.abs(centerPosition - cardCenter),
              }
            }),
          },
        })

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
  }, [totalSpotsCount, onSpotChange])

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
            <h3 className="font-medium">{isPreviewMode ? 'プラン候補' : '選択済みスポット'}</h3>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {totalSpotsCount}件
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
        {totalSpotsCount === 0 ? (
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

            {displaySpots.map((item, index) => {
              const { spot, dayNumber } = item
              const prevItem = index > 0 ? displaySpots[index - 1] : null
              const showDayLabel = isPreviewMode && dayNumber && dayNumber !== prevItem?.dayNumber

              return (
                <div key={spot.placeId} className="flex items-center gap-2 flex-shrink-0">
                  {/* 日付ラベル（前の日と異なる場合のみ表示） */}
                  {showDayLabel && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="px-2 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-700 whitespace-nowrap border border-gray-200">
                        {dayNumber}日目
                      </div>
                    </div>
                  )}
                  <div className="w-[200px] flex-shrink-0 snap-center">
                    <SpotCard spot={spot} onRemove={onRemove} />
                  </div>
                </div>
              )
            })}

            {/* 右側のスペーサー */}
            <div className="w-[calc(50vw-100px)] flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
})
