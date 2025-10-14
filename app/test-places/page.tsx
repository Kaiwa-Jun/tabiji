'use client'

import { useState } from 'react'
import { searchPlacesByArea, getPlaceDetails, type PlaceResult } from '@/lib/maps/places'
import { calculateCenter } from '@/lib/maps/utils'

/**
 * Places API動作確認用デバッグページ
 * /test-places でアクセス可能
 */
export default function TestPlacesPage() {
  const [area, setArea] = useState('東京都')
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // エリア検索
  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    setSearchResults([])
    setSelectedPlace(null)

    try {
      console.log(`[TestPlaces] エリア検索開始: ${area}`)
      const results = await searchPlacesByArea(area, { limit: 10 })
      console.log(`[TestPlaces] 検索結果: ${results.length}件`, results)

      setSearchResults(results)

      // 中心座標を計算
      if (results.length > 0) {
        const center = calculateCenter(results)
        console.log(`[TestPlaces] 中心座標:`, center)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '検索に失敗しました'
      console.error('[TestPlaces] エラー:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // スポット詳細取得
  const handleGetDetails = async (placeId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`[TestPlaces] スポット詳細取得開始: ${placeId}`)
      const detail = await getPlaceDetails(placeId)
      console.log(`[TestPlaces] スポット詳細:`, detail)

      setSelectedPlace(detail)
    } catch (err) {
      const message = err instanceof Error ? err.message : '詳細取得に失敗しました'
      console.error('[TestPlaces] エラー:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Places API 動作確認</h1>
          <p className="mt-2 text-gray-600">
            Google Places APIラッパーの動作をテストします
          </p>
          <p className="mt-1 text-sm text-gray-500">
            ブラウザのコンソールを開いて、ログを確認してください
          </p>
        </div>

        {/* エリア検索フォーム */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            1. エリアからスポットを検索
          </h2>

          <div className="flex gap-4">
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="都道府県名を入力（例: 東京都）"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !area}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? '検索中...' : '検索'}
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setArea('東京都')}
              className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            >
              東京都
            </button>
            <button
              onClick={() => setArea('京都府')}
              className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            >
              京都府
            </button>
            <button
              onClick={() => setArea('北海道')}
              className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            >
              北海道
            </button>
            <button
              onClick={() => setArea('沖縄県')}
              className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            >
              沖縄県
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        {/* 検索結果 */}
        {searchResults.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              2. 検索結果（{searchResults.length}件）
            </h2>

            <div className="space-y-3">
              {searchResults.map((place) => (
                <div
                  key={place.placeId}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  {/* 写真 */}
                  {place.photoUrl ? (
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="h-20 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-200 text-gray-400">
                      📷
                    </div>
                  )}

                  {/* 情報 */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{place.address}</p>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
                      {place.rating && <span>⭐ {place.rating}</span>}
                    </div>
                  </div>

                  {/* 詳細取得ボタン */}
                  <button
                    onClick={() => handleGetDetails(place.placeId)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    詳細取得
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 選択したスポットの詳細 */}
        {selectedPlace && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              3. スポット詳細（getPlaceDetails結果）
            </h2>

            <div className="space-y-4">
              {selectedPlace.photoUrl && (
                <img
                  src={selectedPlace.photoUrl}
                  alt={selectedPlace.name}
                  className="h-64 w-full rounded-lg object-cover"
                />
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPlace.name}</h3>
                {selectedPlace.rating && (
                  <p className="mt-1 text-lg text-yellow-600">⭐ {selectedPlace.rating}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">住所:</span>
                  <p className="text-gray-600">{selectedPlace.address}</p>
                </div>

                <div>
                  <span className="font-semibold">座標:</span>
                  <p className="text-gray-600">
                    緯度 {selectedPlace.lat}, 経度 {selectedPlace.lng}
                  </p>
                </div>

                <div>
                  <span className="font-semibold">Google Places ID:</span>
                  <p className="font-mono text-xs text-gray-600">{selectedPlace.placeId}</p>
                </div>

                {selectedPlace.types && (
                  <div>
                    <span className="font-semibold">タイプ:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedPlace.types.map((type) => (
                        <span
                          key={type}
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* コンソールログの説明 */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">💡 コンソールログについて</h3>
          <p className="mt-2 text-sm text-blue-800">
            ブラウザの開発者ツール（F12）でコンソールを開くと、以下のログが確認できます:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• <code className="rounded bg-blue-100 px-1">[TestPlaces]</code> このページのログ</li>
            <li>• <code className="rounded bg-blue-100 px-1">[searchPlacesByArea]</code> エリア検索のログ</li>
            <li>• <code className="rounded bg-blue-100 px-1">[getPlaceDetails]</code> スポット詳細取得のログ</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
