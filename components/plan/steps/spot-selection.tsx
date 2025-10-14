'use client'

import { useState, useEffect } from 'react'
import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { MapPin } from 'lucide-react'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * ステップ3: スポット選択コンポーネント（内部実装）
 * useSearchModalフックを使用するため、Provider内部に配置
 */
function SpotSelectionContent() {
  const { openModal, selectedSpot } = useSearchModal()
  const [selectedSpots, setSelectedSpots] = useState<PlaceResult[]>([])

  // スポットが選択されたら配列に追加
  useEffect(() => {
    if (selectedSpot && !selectedSpots.some((s) => s.placeId === selectedSpot.placeId)) {
      setSelectedSpots((prev) => [...prev, selectedSpot])
    }
  }, [selectedSpot, selectedSpots])

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

      {/* 選択済みスポット数表示（マップ下部に重ねて表示） */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              選択済みスポット:{' '}
              <span className="font-bold">{selectedSpots.length}</span>件
            </p>
          </div>
          {selectedSpots.length > 0 && (
            <div className="mt-2 text-xs text-blue-700">
              最後に追加: {selectedSpots[selectedSpots.length - 1].name}
            </div>
          )}
        </div>
      </div>
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
