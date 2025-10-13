'use client'

import { MapPin, Search } from 'lucide-react'

/**
 * マップUIプレースホルダーコンポーネント
 * Google Maps実装前の仮UIとして青基調のマップエリアを表示
 *
 * @example
 * ```tsx
 * <MapPlaceholder />
 * ```
 */
export function MapPlaceholder() {
  return (
    <div className="relative h-full w-full">
      {/* マップエリア */}
      <div className="relative h-full w-full overflow-hidden border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        {/* 地図グリッド風の背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* 中央のマップアイコン */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 shadow-lg">
              <MapPin className="h-10 w-10 text-white" />
            </div>
            <p className="text-lg font-semibold text-blue-900">マップUI（準備中）</p>
            <p className="mt-2 text-sm text-blue-700">
              Google Maps連携は別issueで実装予定
            </p>
          </div>
        </div>

        {/* 擬似的なマップコントロール */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50"
            disabled
          >
            <span className="text-lg font-bold text-gray-600">+</span>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50"
            disabled
          >
            <span className="text-lg font-bold text-gray-600">−</span>
          </button>
        </div>

        {/* 擬似的な位置情報ボタン */}
        <div className="absolute bottom-4 right-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50"
            disabled
          >
            <MapPin className="h-5 w-5 text-blue-500" />
          </button>
        </div>

        {/* 検索バー（マップ上に重ねて表示） */}
        <div className="absolute left-4 right-4 top-4">
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
        <div className="absolute bottom-4 left-4 right-4">
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
    </div>
  )
}
