# プラン作成プレビュー機能 実装プラン

## 概要

スポット選択後に、訪問順序最適化・移動時間計算・時刻計算を実行し、プレビュー画面で経路を確認できる機能を実装します。

## 要件

### 基本フロー

1. スポット選択ステップで「プランを作成する」ボタンを押下
2. 既存ロジックを使用してプラン候補を生成:
   - 訪問順序最適化 (issue#42の`optimizeSpotOrder`)
   - スポット間移動時間取得 (issue#43の`getMultipleRoutes`)
   - 訪問時刻自動計算 (issue#44の`calculateVisitTimes`)
   - 日ごとの配分 (`allocateSpotsByDay`)
3. プレビューモードに切り替わり、以下のUIを表示:
   - **マップタブ**: 最適化された経路を地図上に描画
   - **経路リストタブ**: 日ごとの訪問スポットをタイムライン形式で表示

### UI要件

- **ボタン文言変更**: 「次へ」→「プランを作成する」
- **ボタン活性化条件**: 選択スポット2箇所以上
- **タブUI**: 検索バーを「マップ」「経路リスト」の切り替えタブに置き換え
- **経路描画**: 赤ピン間をPolylineで接続
- **スポット並び替え**: 最適化された順序で表示
- **ヘッダー文言**: 「選択済みスポット」→「プラン候補」

---

## Phase 1: 状態管理の拡張 ✅

### 1-1. PlanFormData型の拡張 ✅

**ファイル**: `types/models.ts`

```typescript
export interface PlanFormData {
  // ... 既存フィールド

  // プレビューモード関連 (NEW)
  /** プレビューモード中かどうか */
  isPreviewMode: boolean
  /** 最適化されたスポット順序 */
  optimizedSpots: PlaceResult[]
  /** スポット間のルート情報 */
  routeInfo: RouteInfo[]
  /** 各スポットの訪問時刻情報 */
  timeSlots: Map<string, TimeSlot> | null
  /** 日ごとに配分されたスポット */
  dayPlan: Map<number, OptimizedSpot[]> | null
}
```

**必要なインポート追加**:

- `PlaceResult` from `@/lib/maps/places`
- `RouteInfo` from `@/lib/maps/directions`
- `TimeSlot`, `OptimizedSpot` from `@/lib/itinerary`

### 1-2. 初期値の更新 ✅

**ファイル**: `contexts/plan-form-context.tsx`

```typescript
const initialFormData: PlanFormData = {
  // ... 既存フィールド
  isPreviewMode: false,
  optimizedSpots: [],
  routeInfo: [],
  timeSlots: null,
  dayPlan: null,
}
```

### 1-3. SearchModalContextとの連携 ✅

**ファイル**: `contexts/search-modal-context.tsx`

新しい関数を追加:

```typescript
/** 選択されたスポットをPlanFormContextに同期 */
const syncToPlanForm: () => void
```

**実装状況**: `selectedSpotsCount`フィールドでスポット数を同期（代替実装）

---

## Phase 2: プラン作成ボタンの実装 ✅

### 2-1. SelectedSpotsSheetの拡張 ✅

**ファイル**: `components/plan/selected-spots-sheet.tsx`

**Props拡張**:

```typescript
interface SelectedSpotsSheetProps {
  spots: PlaceResult[]
  onRemove: (spot: PlaceResult) => void
  onSpotChange?: (index: number) => void
  onSheetStateChange?: (state: SheetState) => void
  // NEW
  isPreviewMode?: boolean
  onCreatePlan?: () => void
}
```

**ヘッダー文言の条件分岐**:

```typescript
<h3 className="font-medium">
  {isPreviewMode ? 'プラン候補' : '選択済みスポット'}
</h3>
```

**「プランを作成する」ボタン追加** (expandedモード時のみ表示):

```typescript
{!isPreviewMode && sheetState === 'expanded' && spots.length >= 2 && (
  <Button
    onClick={onCreatePlan}
    className="mx-4 mb-3"
    size="lg"
  >
    プランを作成する
  </Button>
)}
```

**実装状況**: `isPreviewMode` propを追加。ボタンは`plan-creation-steps.tsx`で実装

### 2-2. SpotSelectionContentからの呼び出し ✅

**ファイル**: `components/plan/steps/spot-selection.tsx`

**実装状況**: `plan-creation-steps.tsx`で「プランを作成する」ボタンを実装

```typescript
const { formData, updateFormData } = usePlanForm()

const handleCreatePlan = async () => {
  // Phase 3で実装
}

<SelectedSpotsSheet
  // ...既存props
  isPreviewMode={formData.isPreviewMode}
  onCreatePlan={handleCreatePlan}
/>
```

---

## Phase 3: プラン作成処理の実装 ✅

### 3-1. プラン作成ロジック ✅

**ファイル**: `lib/itinerary/plan-generator.ts` (NEW)

```typescript
import { optimizeSpotOrder } from './optimizer'
import { getMultipleRoutes } from '@/lib/maps/directions'
import { calculateVisitTimes } from './time-calculator'
import { allocateSpotsByDay, generateDayPlan } from './spot-allocator'
import type { PlaceResult } from '@/lib/maps/places'

export interface GeneratedPlan {
  optimizedSpots: PlaceResult[]
  routeInfo: RouteInfo[]
  timeSlots: Map<string, TimeSlot>
  dayPlan: Map<number, OptimizedSpot[]>
}

/**
 * スポット配列からプランを生成
 */
export async function generatePlan(
  selectedSpots: PlaceResult[],
  startDate: Date,
  numberOfDays: number
): Promise<GeneratedPlan> {
  // 1. 訪問順序の最適化 (issue#42)
  const optimizedSpots = optimizeSpotOrder(
    selectedSpots.map((spot) => ({
      id: spot.placeId,
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
    }))
  )

  // PlaceResultの順序を最適化後の順序に合わせる
  const optimizedPlaceResults = optimizedSpots.map(
    (spot) => selectedSpots.find((s) => s.placeId === spot.id)!
  )

  // 2. スポット間のルート取得 (issue#43)
  const locations = optimizedSpots.map((spot) => ({
    lat: spot.lat,
    lng: spot.lng,
  }))
  const routeInfo = await getMultipleRoutes(locations)

  // 3. 訪問時刻の計算 (issue#44)
  const startTime = new Date(startDate)
  startTime.setHours(9, 0, 0, 0) // デフォルト: 09:00開始

  const travelDurations = routeInfo.map((route) => route.duration)

  const spotsWithTypes = optimizedSpots.map((spot) => {
    const original = selectedSpots.find((s) => s.placeId === spot.id)
    return {
      id: spot.id,
      types: original?.types,
    }
  })

  const timeSlots = calculateVisitTimes(startTime, spotsWithTypes, travelDurations)

  // 4. 日ごとの配分
  const dayPlan = generateDayPlan(optimizedSpots, numberOfDays)

  return {
    optimizedSpots: optimizedPlaceResults,
    routeInfo,
    timeSlots,
    dayPlan,
  }
}
```

### 3-2. SpotSelectionContentでの実装 ✅

**ファイル**: `components/plan/steps/spot-selection.tsx`

```typescript
import { generatePlan } from '@/lib/itinerary/plan-generator'
import { differenceInDays } from 'date-fns'

const handleCreatePlan = async () => {
  const { selectedSpots } = useSearchModal()
  const { formData, updateFormData } = usePlanForm()

  if (selectedSpots.length < 2) return
  if (!formData.startDate || !formData.endDate) {
    // エラーハンドリング: 日程が未選択
    alert('日程を選択してください')
    return
  }

  // ローディング表示（オプション）
  updateFormData({ isPreviewMode: true }) // 先にモードを変更

  try {
    const numberOfDays = differenceInDays(formData.endDate, formData.startDate) + 1

    const plan = await generatePlan(selectedSpots, formData.startDate, numberOfDays)

    // PlanFormContextに結果を保存
    updateFormData({
      isPreviewMode: true,
      optimizedSpots: plan.optimizedSpots,
      routeInfo: plan.routeInfo,
      timeSlots: plan.timeSlots,
      dayPlan: plan.dayPlan,
    })

    // シートを最小化（マップを見やすくする）
    sheetRef.current?.setSheetState('minimized')
  } catch (error) {
    console.error('[handleCreatePlan] Failed:', error)
    // エラーハンドリング
    updateFormData({ isPreviewMode: false })
  }
}
```

---

## Phase 4: タブUIの実装 ✅

### 4-1. TabSwitcherコンポーネント作成 ✅

**ファイル**: `components/plan/steps/spot-selection/tab-switcher.tsx` (NEW)

```typescript
'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Map, List } from 'lucide-react'

interface TabSwitcherProps {
  activeTab: 'map' | 'route-list'
  onTabChange: (tab: 'map' | 'route-list') => void
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex justify-center">
      <Tabs value={activeTab} onValueChange={onTabChange as (value: string) => void}>
        <TabsList className="bg-white shadow-lg">
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            マップ
          </TabsTrigger>
          <TabsTrigger value="route-list" className="gap-2">
            <List className="h-4 w-4" />
            経路リスト
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
```

**実装状況**: タブ切り替え、ぼかし効果（旅程リストタブのみ）を実装

### 4-2. SpotSelectionContentの改修 ✅

**ファイル**: `components/plan/steps/spot-selection.tsx`

**実装状況**: タブ切り替え実装。RouteListViewはオーバーレイ表示でマップ状態を保持

```typescript
const [activeTab, setActiveTab] = useState<'map' | 'route-list'>('map')

return (
  <div className="relative h-full w-full">
    <GoogleMapWrapper ... />

    {/* プレビューモードではタブ、通常モードでは検索バー */}
    {formData.isPreviewMode ? (
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    ) : (
      <SearchBarTrigger onClick={openModal} />
    )}

    {/* タブコンテンツ */}
    {activeTab === 'map' && (
      <>
        {/* マップ表示（既存のコンテンツ） */}
      </>
    )}

    {activeTab === 'route-list' && (
      <RouteListView /> {/* Phase 6で実装 */}
    )}

    {/* ... */}
  </div>
)
```

---

## Phase 5: マップへの経路描画

### 5-1. Polylineコンポーネント作成

**ファイル**: `components/map/polyline.tsx` (NEW)

```typescript
'use client'

import { useEffect } from 'react'

interface PolylineProps {
  map: google.maps.Map
  path: google.maps.LatLng[]
  strokeColor?: string
  strokeWeight?: number
  strokeOpacity?: number
}

export function Polyline({
  map,
  path,
  strokeColor = '#ef4444', // 赤色
  strokeWeight = 4,
  strokeOpacity = 0.8,
}: PolylineProps) {
  useEffect(() => {
    const polyline = new google.maps.Polyline({
      path,
      strokeColor,
      strokeWeight,
      strokeOpacity,
      map,
    })

    return () => {
      polyline.setMap(null)
    }
  }, [map, path, strokeColor, strokeWeight, strokeOpacity])

  return null // React要素は返さない
}
```

### 5-2. エンコードされたポリラインのデコード

**ファイル**: `lib/maps/polyline-decoder.ts` (NEW)

```typescript
/**
 * Google Maps Polyline Algorithmでエンコードされた文字列をデコード
 */
export function decodePolyline(encoded: string): google.maps.LatLng[] {
  const points: google.maps.LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push(new google.maps.LatLng(lat / 1e5, lng / 1e5))
  }

  return points
}
```

### 5-3. SpotSelectionContentへの統合

**ファイル**: `components/plan/steps/spot-selection.tsx`

```typescript
import { decodePolyline } from '@/lib/maps/polyline-decoder'
import { Polyline } from '@/components/map/polyline'

// プレビューモード時: ルートを描画
useEffect(() => {
  if (!mapRef.current || !formData.isPreviewMode || formData.routeInfo.length === 0) {
    return
  }

  const polylines: google.maps.Polyline[] = []

  formData.routeInfo.forEach((route) => {
    if (route.polyline) {
      const path = decodePolyline(route.polyline)
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: '#ef4444', // 赤色
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map: mapRef.current,
      })
      polylines.push(polyline)
    }
  })

  return () => {
    polylines.forEach((polyline) => polyline.setMap(null))
  }
}, [formData.isPreviewMode, formData.routeInfo])
```

### 5-4. マーカーの並び替え

プレビューモード時は`formData.optimizedSpots`を使用してマーカーを描画:

```typescript
// 選択されたスポットをカスタムデザインのマーカーとして表示
useEffect(() => {
  if (!mapRef.current) return

  // プレビューモードでは最適化されたスポット順序を使用
  const spotsToDisplay = formData.isPreviewMode ? formData.optimizedSpots : selectedSpots

  // ... マーカー描画ロジック
}, [selectedSpots, formData.isPreviewMode, formData.optimizedSpots])
```

---

## Phase 6: 経路リストUIの実装 ✅

### 6-1. RouteListViewコンポーネント作成 ✅

**ファイル**: `components/plan/route-list-view.tsx` (NEW)

**実装状況**: `formData.dayPlan`から最適化されたスポットを表示。各スポットの到着・出発時刻、滞在時間、移動時間・距離を表示

```typescript
'use client'

import { usePlanForm } from '@/contexts/plan-form-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { formatTime } from '@/lib/itinerary'
import { formatDuration } from '@/lib/maps/directions'

export function RouteListView() {
  const { formData } = usePlanForm()

  if (!formData.dayPlan || !formData.timeSlots) {
    return (
      <div className="absolute inset-0 z-10 bg-white flex items-center justify-center">
        <p className="text-muted-foreground">プランを作成してください</p>
      </div>
    )
  }

  const days = Array.from(formData.dayPlan.entries()).sort(([a], [b]) => a - b)

  return (
    <div className="absolute inset-0 z-10 bg-white overflow-y-auto">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold">経路プラン</h2>

        {days.map(([dayNumber, spots]) => (
          <Card key={dayNumber}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3 py-1">
                  {dayNumber}日目
                </Badge>
                <span className="text-muted-foreground text-sm font-normal">
                  {spots.length}箇所
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spots.map((spot, index) => {
                  const timeSlot = formData.timeSlots!.get(spot.id)
                  const isLast = index === spots.length - 1
                  const nextRoute = !isLast ? formData.routeInfo[
                    formData.optimizedSpots.findIndex(s => s.placeId === spot.id)
                  ] : null

                  return (
                    <div key={spot.id}>
                      {/* スポット情報 */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {spot.orderIndex}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{spot.name}</h4>
                          {timeSlot && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">到着</div>
                                <div className="font-medium">
                                  {formatTime(timeSlot.arrivalTime)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">滞在</div>
                                <div className="font-medium">
                                  {timeSlot.durationMinutes}分
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">出発</div>
                                <div className="font-medium">
                                  {formatTime(timeSlot.departureTime)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 移動時間 */}
                      {!isLast && nextRoute && (
                        <div className="flex items-center gap-2 py-2 pl-11 text-sm text-muted-foreground">
                          <ArrowRight className="h-4 w-4" />
                          <span>移動時間: {formatDuration(nextRoute.duration)}</span>
                          <span className="text-xs">
                            ({(nextRoute.distance / 1000).toFixed(1)}km)
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 6-2. SpotSelectionContentへの統合 ✅

```typescript
{activeTab === 'route-list' && <RouteListView />}
```

---

## Phase 7: 編集・保存機能の追加 ✅

### 7-1. プレビューモードからの戻る機能 ✅

**ファイル**: `components/plan/steps/spot-selection/tab-switcher.tsx`

**実装状況**: `plan-creation-steps.tsx`で「戻る」ボタン実装

```typescript
interface TabSwitcherProps {
  // ... 既存props
  onEditPlan?: () => void // NEW
}

export function TabSwitcher({ activeTab, onTabChange, onEditPlan }: TabSwitcherProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
      {/* 戻るボタン */}
      {onEditPlan && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEditPlan}
          className="bg-white shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          編集
        </Button>
      )}

      {/* タブ */}
      <Tabs ...>...</Tabs>

      {/* スペーサー（レイアウト調整用） */}
      <div className="w-20" />
    </div>
  )
}
```

### 7-2. SpotSelectionContentでの実装 ✅

**実装状況**: `plan-creation-steps.tsx`でプレビューモード解除機能実装

```typescript
const handleEditPlan = () => {
  updateFormData({
    isPreviewMode: false,
    optimizedSpots: [],
    routeInfo: [],
    timeSlots: null,
    dayPlan: null,
  })
  setActiveTab('map')
}

<TabSwitcher
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onEditPlan={handleEditPlan}
/>
```

### 7-3. 保存ボタンの追加 ✅

**ファイル**: `components/plan/route-list-view.tsx`

**実装状況**: `plan-creation-steps.tsx`で「保存」ボタン実装

```typescript
import { usePlanForm } from '@/contexts/plan-form-context'

export function RouteListView() {
  const { formData, nextStep } = usePlanForm()

  const handleSavePlan = () => {
    // issue#45で実装予定のプラン保存処理
    // 現時点では次のステップに進むのみ
    nextStep()
  }

  return (
    <div className="absolute inset-0 z-10 bg-white overflow-y-auto">
      {/* ... 経路リスト表示 */}

      {/* 保存ボタン（固定フッター） */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button
          onClick={handleSavePlan}
          className="w-full"
          size="lg"
        >
          このプランで保存する
        </Button>
      </div>
    </div>
  )
}
```

---

## Phase 8: エラーハンドリングとローディング

### 8-1. ローディング状態の管理

**ファイル**: `types/models.ts`

```typescript
export interface PlanFormData {
  // ... 既存フィールド
  isGeneratingPlan: boolean // NEW
}
```

### 8-2. ローディングUIの実装

**ファイル**: `components/plan/steps/spot-selection.tsx`

```typescript
const handleCreatePlan = async () => {
  updateFormData({ isGeneratingPlan: true })

  try {
    // ... プラン生成処理
  } catch (error) {
    // エラーハンドリング
  } finally {
    updateFormData({ isGeneratingPlan: false })
  }
}

// ローディング表示
{formData.isGeneratingPlan && (
  <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
    <Card className="p-6 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <p className="text-center font-medium">プランを作成中...</p>
    </Card>
  </div>
)}
```

---

## テスト観点

### 動作確認項目

1. **Phase 1-2**: ボタン表示・活性化
   - [ ] スポット1箇所: ボタン非活性
   - [ ] スポット2箇所以上: ボタン活性
   - [ ] ボタン文言が「プランを作成する」になっている

2. **Phase 3**: プラン生成
   - [ ] 最適化が正しく動作（西から東への順序）
   - [ ] Directions APIが正常に呼び出される
   - [ ] 時刻計算が正確
   - [ ] 日ごとの配分が均等

3. **Phase 4**: タブUI
   - [ ] タブが表示される
   - [ ] タブ切り替えが動作する
   - [ ] 検索バーが非表示になる

4. **Phase 5**: 経路描画
   - [ ] Polylineが地図上に表示される
   - [ ] 赤色で描画される
   - [ ] マーカーが最適化順序で表示される

5. **Phase 6**: 経路リスト
   - [ ] 日ごとにカード表示される
   - [ ] 訪問順序が正しい
   - [ ] 時刻・滞在時間が表示される
   - [ ] 移動時間が表示される

6. **Phase 7**: 編集・保存
   - [ ] 編集ボタンでプレビューモード解除
   - [ ] 選択状態が維持される
   - [ ] 保存ボタンが表示される

7. **Phase 8**: エラー・ローディング
   - [ ] ローディング表示が出る
   - [ ] APIエラー時に適切なメッセージ
   - [ ] 日程未選択時のバリデーション

---

## 依存関係

### 既存実装（利用可能）

- ✅ issue#42: 訪問順序最適化アルゴリズム (`lib/itinerary/optimizer.ts`)
- ✅ issue#43: Directions API ラッパー (`lib/maps/directions.ts`)
- ✅ issue#44: 時刻計算ロジック (`lib/itinerary/time-calculator.ts`)
- ✅ 日ごとの配分 (`lib/itinerary/spot-allocator.ts`)
- ✅ Tabs UI (`components/ui/tabs.tsx`)

### 新規作成ファイル

1. `lib/itinerary/plan-generator.ts` - プラン生成統合ロジック
2. `lib/maps/polyline-decoder.ts` - ポリライン文字列デコーダー
3. `components/map/polyline.tsx` - Polylineコンポーネント
4. `components/plan/route-list-view.tsx` - 経路リストUI
5. `components/plan/steps/spot-selection/tab-switcher.tsx` - タブ切り替えUI

### 変更ファイル

1. `types/models.ts` - PlanFormData型拡張
2. `contexts/plan-form-context.tsx` - 初期値追加
3. `components/plan/selected-spots-sheet.tsx` - ボタン・文言追加
4. `components/plan/steps/spot-selection.tsx` - メインロジック統合

---

## 実装状況

### 完了済み ✅

- **Phase 1**: 型定義・状態管理
- **Phase 2**: ボタンUI
- **Phase 3**: プラン生成ロジック（統合処理）
- **Phase 4**: タブUI
- **Phase 6**: 経路リスト（実データ表示）
- **Phase 7**: 編集・保存

### 未実装

- **Phase 5**: 経路描画（マップ上にPolyline表示）
- **Phase 8**: エラーハンドリングとローディング（簡易版は実装済み）

---

## 実装順序の推奨

1. ✅ **Phase 1**: 型定義・状態管理 → 他のPhaseの基礎
2. ✅ **Phase 2**: ボタンUI → 早期に動作確認可能
3. ✅ **Phase 3**: プラン生成ロジック → 最重要機能
4. ⏭️ **Phase 5**: 経路描画 → 視覚的フィードバックが早く得られる（今回スキップ）
5. ✅ **Phase 4**: タブUI → 描画確認後にタブ実装
6. ✅ **Phase 6**: 経路リスト → 情報表示UI
7. ✅ **Phase 7**: 編集・保存 → UX向上
8. ⏭️ **Phase 8**: エラーハンドリング → 最終仕上げ（簡易版は実装済み）

各Phaseの実装完了ごとに動作確認を行い、問題があれば次のPhaseに進む前に修正することを推奨します。
