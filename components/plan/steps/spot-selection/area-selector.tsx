'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS, getPrefecturesByRegion, type Region } from '@/lib/constants/areas'
import { useSearchModal } from '@/contexts/search-modal-context'
import { MapPin } from 'lucide-react'

/**
 * エリアセレクタコンポーネント
 * 地方と都道府県の2段階選択（モバイル向けにコンパクト表示）
 */
export function AreaSelector() {
  const {
    selectedRegion,
    selectedPrefecture,
    setSelectedRegion,
    setSelectedPrefecture,
  } = useSearchModal()

  // 地方選択時の処理
  const handleRegionChange = (value: string) => {
    if (value === 'all') {
      setSelectedRegion(null)
      setSelectedPrefecture(null)
    } else {
      setSelectedRegion(value as Region)
      setSelectedPrefecture(null) // 地方変更時は都道府県をリセット
    }
  }

  // 都道府県選択時の処理
  const handlePrefectureChange = (value: string) => {
    if (value === 'all') {
      setSelectedPrefecture(null)
    } else {
      setSelectedPrefecture(value)
    }
  }

  // 選択された地方の都道府県リスト
  const availablePrefectures = selectedRegion
    ? getPrefecturesByRegion(selectedRegion)
    : []

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />

      {/* 地方選択 */}
      <Select
        value={selectedRegion || 'all'}
        onValueChange={handleRegionChange}
      >
        <SelectTrigger className="h-9 flex-1 text-sm">
          <SelectValue placeholder="地方" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {REGIONS.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 都道府県選択（地方選択後に有効化） */}
      <Select
        value={selectedPrefecture || 'all'}
        onValueChange={handlePrefectureChange}
        disabled={!selectedRegion}
      >
        <SelectTrigger className="h-9 flex-1 text-sm">
          <SelectValue placeholder="都道府県" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {availablePrefectures.map((prefecture) => (
            <SelectItem key={prefecture} value={prefecture}>
              {prefecture}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
