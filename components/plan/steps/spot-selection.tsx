'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'
import {
  SelectedSpotsSheet,
  type SelectedSpotsSheetRef,
  type SheetState,
} from '@/components/plan/selected-spots-sheet'
import {
  addSpotMarkers,
  clearMarkers,
  panToMarkerWithOffset,
} from '@/components/map/spot-marker'

/**
 * ステップ3: スポット選択コンポーネント（内部実装）
 * useSearchModalフックを使用するため、Provider内部に配置
 */
function SpotSelectionContent() {
  const { openModal, selectedSpots, removeSpot, isOpen: isModalOpen } = useSearchModal()
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const detailCardsRef = useRef<HTMLElement[]>([])
  const sheetRef = useRef<SelectedSpotsSheetRef>(null)
  const [sheetState, setSheetState] = useState<SheetState>('minimized')

  // マップ初期化完了時のコールバック
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  // スポットカードのスクロール時に対応するピンを中央に表示
  const handleSpotChange = useCallback(
    (index: number) => {
      if (!mapRef.current || !selectedSpots[index]) return

      const spot = selectedSpots[index]

      // 1. 詳細カードを即座に表示（マップ移動前）
      if (detailCardsRef.current[index]) {
        // 他のすべての詳細カードを閉じる
        detailCardsRef.current.forEach((card) => {
          card.style.display = 'none'
        })
        // このカードを表示
        detailCardsRef.current[index].style.display = 'block'
      }

      // 2. マップを対応するスポットの位置にスムーズに移動（詳細カード表示後）
      // シート状態に応じてオフセット値を変更
      // expanded（展開）: 50px（シートが高いため、オフセットを小さくしてピンを上に表示）
      // minimized（最小化）: 100px（通常のオフセット）
      const offset = sheetState === 'expanded' ? 50 : 100
      panToMarkerWithOffset(mapRef.current, spot.lat, spot.lng, offset)
    },
    [selectedSpots, sheetState]
  )

  // 選択されたスポットをカスタムデザインのマーカーとして表示
  useEffect(() => {
    if (!mapRef.current) return

    const previousSpotsCount = markersRef.current.length

    // 既存のマーカーをクリア
    clearMarkers(markersRef.current)

    // 新しいマーカーを追加（カスタムHTML要素を使用）
    const { markers, detailCards } = addSpotMarkers(
      mapRef.current,
      selectedSpots,
      (spot) => {
        // マーカークリック時: 対応するスポットカードを中央にスクロール
        const spotIndex = selectedSpots.findIndex((s) => s.placeId === spot.placeId)
        if (spotIndex !== -1) {
          sheetRef.current?.scrollToSpot(spotIndex)
        }
      }
    )

    markersRef.current = markers
    detailCardsRef.current = detailCards

    // 新しいスポットが追加された場合、最後に追加されたスポットにフォーカス
    if (selectedSpots.length > previousSpotsCount) {
      const latestSpot = selectedSpots[selectedSpots.length - 1]
      const latestIndex = selectedSpots.length - 1

      // ズームレベルを設定（詳細が見えるレベル）
      mapRef.current.setZoom(16)

      // マップを新しいスポットの位置にスムーズに移動
      // panTo()を使用することでアニメーション付きの移動になる
      mapRef.current.panTo({ lat: latestSpot.lat, lng: latestSpot.lng })

      // 最後に追加されたスポットの詳細カードを自動的に表示
      if (detailCards.length > 0) {
        const lastDetailCard = detailCards[detailCards.length - 1]
        lastDetailCard.style.display = 'block'
      }

      // 選択済みスポットシートを最後のスポット（一番右）にスクロール
      // setTimeoutで少し遅延させることで、モーダルが閉じてシートが表示された後にスクロール
      setTimeout(() => {
        sheetRef.current?.scrollToSpot(latestIndex)
      }, 100)
    }

    // クリーンアップ
    return () => {
      clearMarkers(markersRef.current)
      markersRef.current = []
      detailCardsRef.current = []
    }
  }, [selectedSpots])

  return (
    <div className="relative h-full w-full">
      {/* Google Map - 日本全体を初期表示 */}
      <GoogleMapWrapper
        lat={JAPAN_CENTER.lat}
        lng={JAPAN_CENTER.lng}
        zoom={JAPAN_ZOOM}
        height="100%"
        width="100%"
        onMapReady={handleMapReady}
      />

      {/* 検索バートリガー */}
      <SearchBarTrigger onClick={openModal} />

      {/* 検索モーダル */}
      <SearchModal />

      {/* スライドアップシート：選択済みスポット表示（モーダルが閉じている時のみ表示） */}
      {!isModalOpen && (
        <SelectedSpotsSheet
          ref={sheetRef}
          spots={selectedSpots}
          onRemove={removeSpot}
          onSpotChange={handleSpotChange}
          onSheetStateChange={setSheetState}
        />
      )}
    </div>
  )
}

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * マップUIを画面いっぱいに表示
 */
export function SpotSelectionStep() {
  return (
    <SearchModalProvider>
      <SpotSelectionContent />
    </SearchModalProvider>
  )
}
