'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import { useSearchModal } from '@/contexts/search-modal-context'
import { usePlanForm } from '@/contexts/plan-form-context'
import { useRecommendedSpots } from '@/hooks/useRecommendedSpots'
import Image from 'next/image'

/**
 * おすすめタブコンポーネント
 * ハイブリッドアプローチ:
 * - エンドポイントあり: 出発地・宿泊施設・目的地から近い観光地
 * - エンドポイントなしで選択あり: 最後に選択したスポットと同じ都道府県の人気スポット
 * - どちらもなし: 日本の人気観光地
 */
export function RecommendedTab() {
  const { selectedSpots, selectSpot } = useSearchModal()
  const { formData } = usePlanForm()
  const { results, isLoading } = useRecommendedSpots(selectedSpots, formData.endpoints)

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="mb-3 h-12 w-12 animate-spin text-gray-300" />
        <p className="text-sm text-gray-500">おすすめスポットを読み込み中...</p>
      </div>
    )
  }

  // 結果なし状態
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">おすすめスポットが見つかりませんでした</p>
      </div>
    )
  }

  // ヘッダー表示用
  const getDisplayArea = () => {
    // エンドポイントがある場合
    if (formData.endpoints && (formData.endpoints.tripStart || formData.endpoints.accommodations.length > 0 || formData.endpoints.tripEnd)) {
      const names: string[] = []
      if (formData.endpoints.tripStart) names.push(formData.endpoints.tripStart.name)
      if (formData.endpoints.accommodations.length > 0) {
        formData.endpoints.accommodations.forEach((a) => names.push(a.name))
      }
      if (formData.endpoints.tripEnd && formData.endpoints.tripEnd !== formData.endpoints.tripStart) {
        names.push(formData.endpoints.tripEnd.name)
      }

      // 最初のエンドポイント名を表示
      if (names.length > 0) {
        return `${names[0]}周辺のおすすめスポット`
      }
    }

    // エンドポイントがない場合: 従来のロジック
    if (selectedSpots.length === 0) {
      return '日本の人気観光スポット'
    }
    const lastAddress = selectedSpots[selectedSpots.length - 1].address
    const addressWithoutPostal = lastAddress.replace(/〒?\d{3}-?\d{4}\s*/, '')
    const prefecture = addressWithoutPostal.match(/(北海道|.+?[都道府県])/)?.[1]
    return `${prefecture || '近くの'}人気スポット`
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <Sparkles className="h-4 w-4" />
        <span>{getDisplayArea()}</span>
      </div>

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {results.map((spot) => (
          <button
            key={spot.placeId}
            className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50"
            onClick={() => selectSpot(spot)}
          >
            {spot.photoUrl && (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                width={60}
                height={60}
                className="h-[60px] w-[60px] flex-shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{spot.name}</h3>
              {spot.rating && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  <span>⭐️ {spot.rating}</span>
                </div>
              )}
              {spot.address && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  {spot.address.replace(/〒?\d{3}-?\d{4}\s*/, '')}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
