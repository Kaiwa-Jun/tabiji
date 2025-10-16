'use client'

import { useState } from 'react'
import {
  calculateVisitTimes,
  estimateStayDuration,
  formatTime,
  adjustTime,
  recalculateAfterAdjustment,
} from '@/lib/itinerary'
import type { TimeSlot } from '@/lib/itinerary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// サンプルスポット（東京の観光地）with types
const SAMPLE_SPOTS = [
  { id: '1', name: '東京国立博物館', types: ['museum', 'tourist_attraction'] },
  { id: '2', name: '上野公園', types: ['park', 'tourist_attraction'] },
  { id: '3', name: '浅草寺', types: ['temple', 'tourist_attraction'] },
  { id: '4', name: 'スカイツリー', types: ['tourist_attraction', 'point_of_interest'] },
  { id: '5', name: 'すみだ水族館', types: ['aquarium', 'tourist_attraction'] },
  { id: '6', name: '明治神宮', types: ['shrine', 'tourist_attraction'] },
  { id: '7', name: '新宿御苑', types: ['park', 'tourist_attraction'] },
  { id: '8', name: '上野動物園', types: ['zoo', 'tourist_attraction'] },
]

export default function TestTimeCalculatorPage() {
  const [selectedSpots, setSelectedSpots] = useState<typeof SAMPLE_SPOTS>([])
  const [startTime, setStartTime] = useState('09:00')
  const [travelTimes, setTravelTimes] = useState<number[]>([])
  const [timeSlots, setTimeSlots] = useState<Map<string, TimeSlot> | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  // スポットの選択/解除
  const toggleSpot = (spot: (typeof SAMPLE_SPOTS)[0]) => {
    setSelectedSpots((prev) => {
      const exists = prev.find((s) => s.id === spot.id)
      if (exists) {
        return prev.filter((s) => s.id !== spot.id)
      } else {
        return [...prev, spot]
      }
    })
    // 選択が変わったらリセット
    setTimeSlots(null)
    setTravelTimes([])
  }

  // 移動時間を自動設定（デモ用: 10-20分のランダム）
  const generateTravelTimes = () => {
    if (selectedSpots.length < 2) return
    const times = Array.from({ length: selectedSpots.length - 1 }, () =>
      Math.floor(Math.random() * 600 + 600)
    ) // 10-20分（秒単位）
    setTravelTimes(times)
  }

  // 時刻計算を実行
  const handleCalculate = () => {
    if (selectedSpots.length === 0) return

    const startDateTime = new Date(`2025-04-01T${startTime}:00`)
    const startPerf = performance.now()

    const result = calculateVisitTimes(startDateTime, selectedSpots, travelTimes)

    const endPerf = performance.now()
    setTimeSlots(result)
    setExecutionTime(endPerf - startPerf)
  }

  // リセット
  const handleReset = () => {
    setSelectedSpots([])
    setStartTime('09:00')
    setTravelTimes([])
    setTimeSlots(null)
    setExecutionTime(null)
  }

  // 滞在時間の推定をプレビュー
  const getEstimatedDuration = (types?: string[]) => {
    return estimateStayDuration(types)
  }

  // 移動時間を分単位でフォーマット
  const formatTravelTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分`
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">⏰ 時刻計算ロジック - テスト画面</h1>
        <p className="text-muted-foreground">
          issue#44で実装した滞在時間推定・訪問時刻自動計算の動作確認
        </p>
      </div>

      {/* ステップ1: スポット選択 */}
      <Card>
        <CardHeader>
          <CardTitle>ステップ1: 訪問するスポットを選択</CardTitle>
          <CardDescription>
            スポットを選択すると、タイプに応じて滞在時間が自動推定されます（
            {selectedSpots.length}/{SAMPLE_SPOTS.length}選択中）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_SPOTS.map((spot) => {
              const isSelected = selectedSpots.find((s) => s.id === spot.id)
              const estimatedDuration = getEstimatedDuration(spot.types)

              return (
                <button
                  key={spot.id}
                  onClick={() => toggleSpot(spot)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{spot.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {spot.types.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {estimatedDuration}分
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ステップ2: 開始時刻と移動時間の設定 */}
      {selectedSpots.length >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ2: 開始時刻と移動時間を設定</CardTitle>
            <CardDescription>旅行の開始時刻とスポット間の移動時間を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium w-24">開始時刻:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedSpots.length >= 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-medium">スポット間の移動時間:</label>
                  <Button onClick={generateTravelTimes} variant="outline" size="sm">
                    🎲 ランダム生成
                  </Button>
                </div>

                {travelTimes.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    「ランダム生成」ボタンで移動時間を自動設定できます
                  </div>
                )}

                {travelTimes.length > 0 && (
                  <div className="space-y-2">
                    {travelTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="w-16 justify-center">
                          {index + 1}→{index + 2}
                        </Badge>
                        <span className="text-muted-foreground">移動時間:</span>
                        <input
                          type="number"
                          value={Math.floor(time / 60)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newTimes = [...travelTimes]
                            newTimes[index] = parseInt(e.target.value) * 60
                            setTravelTimes(newTimes)
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                        <span className="text-muted-foreground">分</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ステップ3: 時刻計算実行 */}
      {selectedSpots.length >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ3: 訪問時刻を計算</CardTitle>
            <CardDescription>
              スポットタイプから滞在時間を推定し、訪問時刻を自動計算します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCalculate}
              className="w-full"
              size="lg"
              disabled={selectedSpots.length >= 2 && travelTimes.length === 0}
            >
              ⚙️ 時刻計算を実行
            </Button>

            {selectedSpots.length >= 2 && travelTimes.length === 0 && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ 移動時間を設定してください
              </div>
            )}

            {timeSlots && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">✅ 計算結果</h3>
                  {executionTime && (
                    <Badge variant="secondary">{executionTime.toFixed(2)}ms</Badge>
                  )}
                </div>

                {/* タイムライン表示 */}
                <div className="space-y-3">
                  {selectedSpots.map((spot, index) => {
                    const slot = timeSlots.get(spot.id)
                    if (!slot) return null

                    return (
                      <div key={spot.id} className="relative">
                        {/* スポット情報 */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4 space-y-2 border-2 border-blue-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-lg">{spot.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {spot.types[0]}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 時刻情報 */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">到着時刻</div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatTime(slot.arrivalTime)}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">滞在時間</div>
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {slot.durationMinutes}分
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">出発時刻</div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {formatTime(slot.departureTime)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 移動時間の矢印 */}
                        {index < selectedSpots.length - 1 && travelTimes[index] && (
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="w-px h-6 bg-gray-300"></div>
                              <Badge variant="outline" className="text-xs">
                                🚶 {formatTravelTime(travelTimes[index])}
                              </Badge>
                              <div className="w-px h-6 bg-gray-300"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* サマリー */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                  <h4 className="font-semibold">📊 サマリー</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">開始時刻</div>
                      <div className="font-bold">{startTime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">終了時刻</div>
                      <div className="font-bold">
                        {selectedSpots.length > 0 &&
                          timeSlots.get(selectedSpots[selectedSpots.length - 1].id) &&
                          formatTime(
                            timeSlots.get(selectedSpots[selectedSpots.length - 1].id)!
                              .departureTime
                          )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">総スポット数</div>
                      <div className="font-bold">{selectedSpots.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">総滞在時間</div>
                      <div className="font-bold">
                        {Array.from(timeSlots.values()).reduce(
                          (sum, slot) => sum + slot.durationMinutes,
                          0
                        )}
                        分
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 機能説明 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 実装機能</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">✅ 滞在時間の自動推定:</span>{' '}
              スポットタイプ（博物館、公園、神社など）に応じて最適な滞在時間を推定
            </div>
            <div>
              <span className="font-medium">✅ 訪問時刻の自動計算:</span>{' '}
              開始時刻、滞在時間、移動時間から各スポットの到着・出発時刻を計算
            </div>
            <div>
              <span className="font-medium">✅ 時刻フォーマット:</span>{' '}
              DateオブジェクトをHH:MM形式で見やすく表示
            </div>
            <div className="pt-2 border-t">
              <span className="font-medium">実装Issue:</span> #44
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リセットボタン */}
      {selectedSpots.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleReset} variant="outline" size="lg">
            🔄 リセット
          </Button>
        </div>
      )}
    </div>
  )
}
