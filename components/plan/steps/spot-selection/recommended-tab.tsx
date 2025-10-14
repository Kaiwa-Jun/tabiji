'use client'

import { Sparkles } from 'lucide-react'

/**
 * おすすめタブコンポーネント
 * 人気の観光スポットを表示
 */
export function RecommendedTab() {
  // TODO: おすすめスポットのロジック実装（Places API連携後）
  const recommendations = [
    { id: '1', name: '東京タワー', area: '東京都' },
    { id: '2', name: '清水寺', area: '京都府' },
    { id: '3', name: '厳島神社', area: '広島県' },
  ]

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <Sparkles className="h-4 w-4" />
        <span>人気の観光スポット</span>
      </div>

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {recommendations.map((spot) => (
          <button
            key={spot.id}
            className="w-full p-4 text-left hover:bg-gray-50"
          >
            <h3 className="font-medium">{spot.name}</h3>
            <p className="text-sm text-gray-500">{spot.area}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
