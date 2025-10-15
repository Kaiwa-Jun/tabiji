'use client'

import { useRef, useEffect, useCallback } from 'react'
import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'
import { SelectedSpotsSheet } from '@/components/plan/selected-spots-sheet'
import {
  addSpotMarkers,
  clearMarkers,
} from '@/components/map/spot-marker'

/**
 * ステップ3: スポット選択コンポーネント（内部実装）
 * useSearchModalフックを使用するため、Provider内部に配置
 */
function SpotSelectionContent() {
  const { openModal, selectedSpots, removeSpot } = useSearchModal()
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const detailCardsRef = useRef<HTMLElement[]>([])

  // マップ初期化完了時のコールバック
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

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
        // マーカークリック時の処理（将来的な拡張用）
        console.log('Marker clicked:', spot.name)
      }
    )

    markersRef.current = markers
    detailCardsRef.current = detailCards

    // 新しいスポットが追加された場合、最後に追加されたスポットにフォーカス
    if (selectedSpots.length > previousSpotsCount) {
      const latestSpot = selectedSpots[selectedSpots.length - 1]

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

      {/* スライドアップシート：選択済みスポット表示 */}
      <SelectedSpotsSheet spots={selectedSpots} onRemove={removeSpot} />
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
