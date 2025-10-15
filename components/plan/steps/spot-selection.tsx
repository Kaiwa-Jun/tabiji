'use client'

import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'
import { SelectedSpotsSheet } from '@/components/plan/selected-spots-sheet'

/**
 * ステップ3: スポット選択コンポーネント（内部実装）
 * useSearchModalフックを使用するため、Provider内部に配置
 */
function SpotSelectionContent() {
  const { openModal, selectedSpots, removeSpot } = useSearchModal()

  return (
    <div className="relative h-full w-full">
      {/* Google Map - 日本全体を初期表示 */}
      <GoogleMapWrapper
        lat={JAPAN_CENTER.lat}
        lng={JAPAN_CENTER.lng}
        zoom={JAPAN_ZOOM}
        height="100%"
        width="100%"
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
