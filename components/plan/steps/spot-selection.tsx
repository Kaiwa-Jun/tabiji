'use client'

import { MapPlaceholder } from '@/components/map/map-placeholder'

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * マップUIを画面いっぱいに表示
 */
export function SpotSelectionStep() {
  return (
    <div className="h-full w-full">
      {/* マップUI */}
      <MapPlaceholder />
    </div>
  )
}
