'use client'

import { useState } from 'react'
import { optimizeSpotOrder, allocateSpotsByDay } from '@/lib/itinerary'
import type { Spot, OptimizedSpot } from '@/lib/itinerary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// サンプルスポット（東京の観光地）
const SAMPLE_SPOTS: Spot[] = [
  { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
  { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
  { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
  { id: '4', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
  { id: '5', name: '皇居', lat: 35.6852, lng: 139.7528 },
  { id: '6', name: '明治神宮', lat: 35.6764, lng: 139.6993 },
  { id: '7', name: '新宿御苑', lat: 35.6852, lng: 139.71 },
  { id: '8', name: '上野動物園', lat: 35.7154, lng: 139.7731 },
  { id: '9', name: 'お台場', lat: 35.627, lng: 139.7703 },
]

export default function TestItineraryPage() {
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>([])
  const [optimizedSpots, setOptimizedSpots] = useState<Spot[]>([])
  const [allocatedSpots, setAllocatedSpots] = useState<OptimizedSpot[]>([])
  const [numberOfDays, setNumberOfDays] = useState(3)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  // スポットの選択/解除
  const toggleSpot = (spot: Spot) => {
    setSelectedSpots((prev) => {
      const exists = prev.find((s) => s.id === spot.id)
      if (exists) {
        return prev.filter((s) => s.id !== spot.id)
      } else {
        return [...prev, spot]
      }
    })
  }

  // 訪問順序を最適化
  const handleOptimize = () => {
    const startTime = performance.now()
    const result = optimizeSpotOrder(selectedSpots)
    const endTime = performance.now()

    setOptimizedSpots(result)
    setExecutionTime(endTime - startTime)
    setAllocatedSpots([])
  }

  // 日ごとに配分
  const handleAllocate = () => {
    const result = allocateSpotsByDay(optimizedSpots, numberOfDays)
    setAllocatedSpots(result)
  }

  // リセット
  const handleReset = () => {
    setSelectedSpots([])
    setOptimizedSpots([])
    setAllocatedSpots([])
    setExecutionTime(null)
  }

  // 日ごとのスポットを取得
  const getDaySpots = (day: number) => {
    return allocatedSpots.filter((s) => s.dayNumber === day)
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🗺️ 旅程最適化アルゴリズム - テスト画面</h1>
        <p className="text-muted-foreground">
          issue#42で実装した訪問順序最適化と日別配分の動作確認
        </p>
      </div>

      {/* ステップ1: スポット選択 */}
      <Card>
        <CardHeader>
          <CardTitle>ステップ1: 訪問したいスポットを選択</CardTitle>
          <CardDescription>
            東京の観光スポットから訪問したい場所を選んでください（{selectedSpots.length}/
            {SAMPLE_SPOTS.length}選択中）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SAMPLE_SPOTS.map((spot) => {
              const isSelected = selectedSpots.find((s) => s.id === spot.id)
              return (
                <button
                  key={spot.id}
                  onClick={() => toggleSpot(spot)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{spot.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ステップ2: 最適化実行 */}
      {selectedSpots.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ2: 訪問順序を最適化</CardTitle>
            <CardDescription>
              貪欲法（最近傍法）でスポットの訪問順序を最適化します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleOptimize} className="w-full" size="lg">
              ⚙️ 最適化を実行
            </Button>

            {optimizedSpots.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">✅ 最適化された訪問順序</h3>
                  {executionTime && (
                    <Badge variant="secondary">{executionTime.toFixed(2)}ms</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {optimizedSpots.map((spot, index) => (
                    <div
                      key={spot.id}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{spot.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ステップ3: 日別配分 */}
      {optimizedSpots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ3: 日ごとにスポットを配分</CardTitle>
            <CardDescription>旅行日数を選んで、スポットを均等に配分します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">旅行日数:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((days) => (
                  <button
                    key={days}
                    onClick={() => setNumberOfDays(days)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      numberOfDays === days
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 font-bold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {days}日
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAllocate} className="w-full" size="lg">
              📅 日ごとに配分
            </Button>

            {allocatedSpots.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">✅ 日ごとの配分結果</h3>
                {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => {
                  const daySpots = getDaySpots(day)
                  if (daySpots.length === 0) return null

                  return (
                    <div
                      key={day}
                      className="border-2 border-blue-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-base px-3 py-1">
                          {day}日目
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {daySpots.length}スポット
                        </span>
                      </div>
                      <div className="space-y-2">
                        {daySpots.map((spot) => (
                          <div
                            key={spot.id}
                            className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-950 rounded"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                              {spot.orderIndex}
                            </div>
                            <div className="text-sm">{spot.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 統計情報 */}
      {allocatedSpots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 統計情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">総スポット数</div>
                <div className="text-2xl font-bold">{selectedSpots.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">旅行日数</div>
                <div className="text-2xl font-bold">{numberOfDays}日</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">1日平均</div>
                <div className="text-2xl font-bold">
                  {(selectedSpots.length / numberOfDays).toFixed(1)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">処理時間</div>
                <div className="text-2xl font-bold">
                  {executionTime ? `${executionTime.toFixed(2)}ms` : '-'}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="text-sm">
                <span className="font-medium">アルゴリズム:</span> 貪欲法（最近傍法）
              </div>
              <div className="text-sm">
                <span className="font-medium">時間計算量:</span> O(n²)
              </div>
              <div className="text-sm">
                <span className="font-medium">実装Issue:</span> #42
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
