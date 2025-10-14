# Phase 5: エリア絞り込み実装

## 目的

エリアのみ選択時に、その都道府県の人気スポットを表示する機能を実装します。

## UI変化

**Before**:

- エリア選択しても「人気スポットを表示（Phase 5で実装）」と表示されるのみ

**After**:

- エリア選択すると自動的にそのエリアの人気スポットが表示される
- ローディング中はスピナーを表示
- 人気スポットがスポットカード形式で表示される
- TrendingUpアイコンで「人気スポット」であることを示す

## 実装内容

### 1. 人気スポット取得関数追加

**ファイル**: `lib/queries/spots.ts`（更新）

```typescript
/**
 * エリアの人気スポットを取得
 * @param area - 都道府県名
 */
export async function getPopularSpotsByArea(area: string): Promise<PlaceResult[]> {
  try {
    // 「エリア名 + 観光地」で検索（Places APIのデフォルトクエリ）
    const results = await searchPlacesByArea(area, { limit: 20 })
    return results
  } catch (error) {
    console.error('[getPopularSpotsByArea] Error:', error)
    return []
  }
}
```

### 2. 人気スポット取得フック作成

**ファイル**: `hooks/usePopularSpots.ts`（新規作成）

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getPopularSpotsByArea } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'

export function usePopularSpots(area: string | null) {
  const [spots, setSpots] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!area) {
      setSpots([])
      return
    }

    const fetchPopular = async () => {
      setIsLoading(true)
      try {
        const results = await getPopularSpotsByArea(area)
        setSpots(results)
      } catch (error) {
        console.error('Popular spots fetch error:', error)
        setSpots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopular()
  }, [area])

  return { spots, isLoading }
}
```

### 3. 人気スポット表示コンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/popular-spots.tsx`（新規作成）

```typescript
'use client'

import { TrendingUp, MapPin } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'

interface PopularSpotsProps {
  area: string
  spots: PlaceResult[]
  isLoading: boolean
  onSelectSpot: (spot: PlaceResult) => void
}

export function PopularSpots({ area, spots, isLoading, onSelectSpot }: PopularSpotsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <TrendingUp className="h-4 w-4" />
        <span>{area}の人気スポット</span>
      </div>

      {spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            {area}のスポットが見つかりませんでした
          </p>
        </div>
      ) : (
        spots.map((spot) => (
          <button
            key={spot.placeId}
            onClick={() => onSelectSpot(spot)}
            className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-medium">{spot.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{spot.address}</p>
                {spot.rating && (
                  <p className="mt-1 text-sm text-yellow-600">⭐ {spot.rating}</p>
                )}
              </div>
              {spot.photoUrl && (
                <img
                  src={spot.photoUrl}
                  alt={spot.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
            </div>
          </button>
        ))
      )}
    </div>
  )
}
```

### 4. モーダルに統合

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（更新）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
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

  // キーワード検索
  const { results: searchResults, isLoading: isSearching } = useSearchSpots(
    keyword,
    selectedArea
  )

  // 人気スポット取得
  const { spots: popularSpots, isLoading: isLoadingPopular } = usePopularSpots(
    selectedArea
  )

  const handleSelectSpot = (spot: PlaceResult) => {
    console.log('Selected spot:', spot)
    // TODO: Phase 6でスポット追加処理を実装
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

## 設計のポイント

### 1. TrendingUpアイコンで差別化

```typescript
<TrendingUp className="h-4 w-4" />
```

検索結果（キーワードベース）と人気スポット（エリアベース）を視覚的に区別します。

### 2. エリア名の表示

```typescript
<span>{area}の人気スポット</span>
```

どのエリアの人気スポットが表示されているか明示します。

### 3. スポットカードの再利用

SearchResultsと同じスポットカードデザインを使用し、一貫性を保ちます。

## テスト項目

- [ ] エリアのみ選択で人気スポットが表示される
- [ ] TrendingUpアイコンが表示される
- [ ] 「〇〇の人気スポット」とエリア名が表示される
- [ ] エリアを変更すると人気スポットが更新される
- [ ] ローディング中はスピナーが表示される
- [ ] スポット0件時は適切なメッセージが表示される
- [ ] スポットカードに名前・住所・評価・写真が表示される
- [ ] スポットカードをタップできる（次のPhaseで動作確認）

## 次のステップ

次は [Phase 6: スポット選択](./10-spot-selection.md) で、スポットをプランに追加する機能を実装します。

---

**実装優先度**: 🟡 中（補助的な機能）
