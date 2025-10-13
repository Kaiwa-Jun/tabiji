'use client'

import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { MapPin, Search } from 'lucide-react'

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * マップUIを画面いっぱいに表示
 */
export function SpotSelectionStep() {
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

      {/* 検索バー（マップ上に重ねて表示） */}
      <div className="absolute left-4 right-4 top-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="スポットを検索..."
            className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>
      </div>

      {/* 選択済みスポット数表示（マップ下部に重ねて表示） */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              選択済みスポット: <span className="font-bold">0</span>件
            </p>
          </div>
          <p className="mt-1 text-xs text-blue-700">
            マップをタップしてスポットを追加できます（実装予定）
          </p>
        </div>
      </div>
    </div>
  )
}
