# Phase 6: スポット選択実装

## 目的

選択したスポットをプラン作成フォームに追加し、選択済みカウントを更新する機能を実装します。

## UI変化

**Before**:

- スポットカードタップしても何も起きない
- 選択済みカウントが常に「0件」

**After**:

- スポットカードタップでプランに追加される
- モーダルが自動で閉じる
- 選択済みカウントが更新される
- 同じスポットは重複追加できない（アラート表示）

## 実装内容

### 1. PlanFormContextにスポット管理を追加

**ファイル**: `contexts/plan-form-context.tsx`（更新）

```typescript
// 型定義を更新
interface Spot {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  photoUrl?: string
  rating?: number
}

interface PlanFormData {
  // ... 既存フィールド
  spots: Spot[] // 追加
}

// Context実装を更新
export function PlanFormProvider({ children }: { children: ReactNode }) {
  // ... 既存のstate

  const addSpot = (spot: Spot) => {
    updateFormData({
      spots: [...(formData.spots || []), spot],
    })
  }

  const removeSpot = (placeId: string) => {
    updateFormData({
      spots: (formData.spots || []).filter((s) => s.placeId !== placeId),
    })
  }

  return (
    <PlanFormContext.Provider
      value={{
        formData,
        updateFormData,
        addSpot,
        removeSpot,
        // ...
      }}
    >
      {children}
    </PlanFormContext.Provider>
  )
}
```

### 2. スポット選択処理の実装

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（更新）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
import { usePlanForm } from '@/contexts/plan-form-context'
import { useSearchSpots } from '@/hooks/useSearchSpots'
import { usePopularSpots } from '@/hooks/usePopularSpots'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'
import { HistoryTab } from './history-tab'
import { SearchResults } from './search-results'
import { PopularSpots } from './popular-spots'
import type { PlaceResult } from '@/lib/maps/places'

export function SearchModal() {
  const { isOpen, closeModal, state, keyword, selectedArea } = useSearchModal()
  const { addSpot, formData } = usePlanForm()

  const { results: searchResults, isLoading: isSearching } = useSearchSpots(
    keyword,
    selectedArea
  )

  const { spots: popularSpots, isLoading: isLoadingPopular } = usePopularSpots(
    selectedArea
  )

  const handleSelectSpot = (spot: PlaceResult) => {
    // すでに追加済みかチェック
    const isAlreadyAdded = formData.spots?.some((s) => s.placeId === spot.placeId)

    if (isAlreadyAdded) {
      alert('このスポットはすでに追加されています')
      return
    }

    // スポットを追加
    addSpot({
      placeId: spot.placeId,
      name: spot.name,
      address: spot.address,
      lat: spot.lat,
      lng: spot.lng,
      photoUrl: spot.photoUrl,
      rating: spot.rating,
    })

    // モーダルを閉じる
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="h-full max-h-screen w-full max-w-full p-0 sm:h-[90vh] sm:max-w-2xl">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="space-y-3 border-b p-4">
            <SearchInput />
            <AreaSelector />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {state === 'initial' && (
              <Tabs defaultValue="recommended">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommended">おすすめ</TabsTrigger>
                  <TabsTrigger value="history">履歴</TabsTrigger>
                </TabsList>
                <TabsContent value="recommended" className="mt-4">
                  <RecommendedTab />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <HistoryTab />
                </TabsContent>
              </Tabs>
            )}

            {state === 'searching' && (
              <SearchResults
                results={searchResults}
                isLoading={isSearching}
                onSelectSpot={handleSelectSpot}
              />
            )}

            {state === 'area-filtered' && (
              <PopularSpots
                area={selectedArea!}
                spots={popularSpots}
                isLoading={isLoadingPopular}
                onSelectSpot={handleSelectSpot}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. 選択済みスポット表示の更新

**ファイル**: `components/plan/steps/spot-selection.tsx`（更新）

```typescript
'use client'

import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { MapPin } from 'lucide-react'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { usePlanForm } from '@/contexts/plan-form-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'

function SpotSelectionContent() {
  const { openModal } = useSearchModal()
  const { formData } = usePlanForm()
  const selectedCount = formData.spots?.length || 0

  return (
    <div className="relative h-full w-full">
      <GoogleMapWrapper
        lat={JAPAN_CENTER.lat}
        lng={JAPAN_CENTER.lng}
        zoom={JAPAN_ZOOM}
        height="100%"
        width="100%"
      />

      <SearchBarTrigger onClick={openModal} />
      <SearchModal />

      {/* 選択済みスポット数表示 */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              選択済みスポット: <span className="font-bold">{selectedCount}</span>件
            </p>
          </div>
          {selectedCount > 0 && (
            <p className="mt-1 text-xs text-blue-700">
              次のステップで日程を組みます
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function SpotSelectionStep() {
  return (
    <SearchModalProvider>
      <SpotSelectionContent />
    </SearchModalProvider>
  )
}
```

## 設計のポイント

### 1. 重複チェック

```typescript
const isAlreadyAdded = formData.spots?.some((s) => s.placeId === spot.placeId)
```

`placeId`でユニーク性を判定し、重複追加を防ぎます。

### 2. モーダルの自動クローズ

```typescript
closeModal()
```

スポット追加後にモーダルを自動で閉じ、マップUIに戻ります。これにより、追加されたことが視覚的に分かりやすくなります。

### 3. LocalStorage自動保存

`PlanFormContext`が内部でLocalStorageに自動保存するため、追加実装は不要です。

## テスト項目

- [ ] スポットカードタップでスポットが追加される
- [ ] 選択済みカウントが増える
- [ ] モーダルが自動で閉じる
- [ ] 同じスポットを再度タップするとアラートが表示される
- [ ] 重複追加されない
- [ ] 選択済みカウントが1件以上の場合、補足メッセージが表示される
- [ ] LocalStorageに保存される（ページリロード後も保持）

## 今後の拡張

### 1. 選択済みスポット一覧の表示

マップUI上の選択済みカウント部分をタップすると、選択済みスポット一覧を表示するモーダルを開く。

### 2. スポットの削除機能

選択済みスポット一覧から個別に削除できる機能。

### 3. 地図上にピン表示

選択済みスポットを地図上にマーカーで表示し、視覚的に確認できる。

### 4. スポットの並び替え

ドラッグ&ドロップで訪問順序を変更できる機能。

## まとめ

これで検索モーダルの基本機能がすべて実装完了します！

### 実装した機能

- ✅ モーダルの開閉
- ✅ 戻るボタン付き検索バー
- ✅ エリアセレクタ
- ✅ おすすめ・履歴タブ
- ✅ キーワード検索（Places API統合）
- ✅ エリア絞り込み（人気スポット表示）
- ✅ スポット選択・追加機能

### 次のステップ（オプション）

- 検索履歴の永続化
- 地図上のピン表示
- スポット詳細表示
- お気に入り機能

---

**実装優先度**: 🔴 高（コア機能の完成）
