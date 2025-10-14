'use client'

import { useState } from 'react'
import { usePlanForm } from '@/contexts/plan-form-context'
import { REGIONS, getPrefectureByName, getPrefecturesByRegionName } from '@/lib/constants/areas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GoogleMap } from '@/components/map/google-map'
import { MapPin } from 'lucide-react'

/**
 * ステップ2: エリア選択コンポーネント
 * 旅行先の地方と都道府県を選択し、地図にズームするステップ
 */
export function AreaSelectionStep() {
  const { formData, updateFormData } = usePlanForm()

  // 地図の中心座標とズームレベル（日本の中心を初期値）
  const [mapCenter, setMapCenter] = useState({ lat: 36.2048, lng: 138.2529 })
  const [mapZoom, setMapZoom] = useState(5)

  /**
   * 地方選択時の処理
   * - 地方を更新
   * - 都道府県をリセット
   */
  const handleRegionChange = (regionName: string) => {
    updateFormData({ region: regionName, prefecture: null })
  }

  /**
   * 都道府県選択時の処理
   * - 都道府県を更新
   * - 地図を該当エリアにズーム
   */
  const handlePrefectureChange = (prefectureName: string) => {
    updateFormData({ prefecture: prefectureName })

    // 都道府県の座標データを取得して地図をズーム
    const prefecture = getPrefectureByName(prefectureName)
    if (prefecture) {
      setMapCenter({ lat: prefecture.lat, lng: prefecture.lng })
      setMapZoom(prefecture.zoom)
    }
  }

  // 選択された地方の都道府県リスト（座標付き）
  const availablePrefectures =
    formData.region && REGIONS.includes(formData.region as (typeof REGIONS)[number])
      ? getPrefecturesByRegionName(formData.region as (typeof REGIONS)[number])
      : []

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">🗾 エリアを選択</h2>
        <p className="mt-1 text-sm text-gray-600">旅行先の地方と都道府県を選択してください</p>
      </div>

      {/* エリア選択カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5" />
            訪問するエリア
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 地方選択 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              地方 <span className="text-red-500">*</span>
            </label>
            <Select value={formData.region ?? ''} onValueChange={handleRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="地方を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 都道府県選択（地方選択後に有効化） */}
          {formData.region && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <Select value={formData.prefecture ?? ''} onValueChange={handlePrefectureChange}>
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrefectures.map((prefecture) => (
                    <SelectItem key={prefecture.code} value={prefecture.name}>
                      {prefecture.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 地図プレビューカード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">エリアプレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            zoom={mapZoom}
            className="h-[300px] w-full rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  )
}
