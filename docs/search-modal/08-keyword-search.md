# Phase 4: キーワード検索実装

## 目的

キーワード入力時にPlaces APIで検索し、結果を表示する機能を実装します。

## UI変化

**Before**:

- キーワード入力しても「検索結果を表示（Phase 4で実装）」と表示されるのみ

**After**:

- キーワード入力すると自動的に検索が実行される（300msデバウンス）
- ローディング中はスピナーを表示
- 検索結果がスポットカード形式で表示される
- 結果0件時は適切なメッセージを表示
- スポットカードに写真・評価が表示される

## 実装内容

### 1. 検索クエリ関数作成

**ファイル**: `lib/queries/spots.ts`（新規作成）

```typescript
import { searchPlacesByArea } from '@/lib/maps/places'
import type { PlaceResult } from '@/lib/maps/places'

/**
 * キーワードとエリアでスポット検索
 * @param keyword - 検索キーワード
 * @param area - 都道府県名（オプション）
 */
export async function searchSpotsByKeyword(keyword: string, area?: string): Promise<PlaceResult[]> {
  if (!keyword.trim()) return []

  try {
    // エリア指定がある場合は「エリア名 + キーワード」で検索
    // ない場合は「日本 + キーワード」で検索
    const searchQuery = area ? `${area} ${keyword}` : `日本 ${keyword}`

    const results = await searchPlacesByArea(searchQuery, { limit: 20 })
    return results
  } catch (error) {
    console.error('[searchSpotsByKeyword] Error:', error)
    return []
  }
}
```

### 2. 検索フック作成

**ファイル**: `hooks/useSearchSpots.ts`（新規作成）

```typescript
'use client'

import { useEffect, useState } from 'react'
import { searchSpotsByKeyword } from '@/lib/queries/spots'
import type { PlaceResult } from '@/lib/maps/places'

export function useSearchSpots(keyword: string, area: string | null) {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const spots = await searchSpotsByKeyword(keyword, area || undefined)
        setResults(spots)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [keyword, area])

  return { results, isLoading }
}
```

### 3. 検索結果表示コンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/search-results.tsx`（新規作成）

```typescript
'use client'

import { Loader2, MapPin } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'

interface SearchResultsProps {
  results: PlaceResult[]
  isLoading: boolean
  onSelectSpot: (spot: PlaceResult) => void
}

export function SearchResults({ results, isLoading, onSelectSpot }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">スポットが見つかりませんでした</p>
        <p className="mt-1 text-xs text-gray-400">
          別のキーワードで検索してください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">{results.length}件のスポットが見つかりました</p>

      {results.map((spot) => (
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
      ))}
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
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'
import { HistoryTab } from './history-tab'
import { SearchResults } from './search-results'
import type { PlaceResult } from '@/lib/maps/places'

export function SearchModal() {
  const { isOpen, closeModal, state, keyword, selectedArea } = useSearchModal()
  const { results, isLoading } = useSearchSpots(keyword, selectedArea)

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
                results={results}
                isLoading={isLoading}
                onSelectSpot={handleSelectSpot}
              />
            )}

            {state === 'area-filtered' && (
              <p className="text-sm text-gray-500">
                人気スポットを表示（Phase 5で実装）
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## 設計のポイント

### 1. デバウンス処理

```typescript
const timeoutId = setTimeout(search, 300)
return () => clearTimeout(timeoutId)
```

ユーザーが入力を停止してから300ms後に検索を実行し、API呼び出しを最小限に抑えます。

### 2. エリア×キーワードの組み合わせ検索

```typescript
const searchQuery = area ? `${area} ${keyword}` : `日本 ${keyword}`
```

エリアが選択されている場合は、そのエリア内でキーワード検索を実行します。

### 3. ローディングとエラー状態のUI

- ローディング中: Loader2アイコンのスピナー
- 結果0件: MapPinアイコン + メッセージ
- 結果あり: スポットカード一覧

## テスト項目

- [ ] キーワード入力で検索結果が表示される
- [ ] 300msのデバウンスが動作する（入力中は検索されない）
- [ ] エリア選択すると検索結果が絞り込まれる
- [ ] 検索中はローディングスピナーが表示される
- [ ] 検索結果0件時は適切なメッセージが表示される
- [ ] スポットカードに名前・住所が表示される
- [ ] 評価がある場合は星と数値が表示される
- [ ] 写真がある場合はサムネイルが表示される
- [ ] スポットカードをタップできる（次のPhaseで動作確認）

## 次のステップ

次は [Phase 5: エリア絞り込み](./09-area-filter.md) で、エリアのみ選択時の人気スポット表示を実装します。

---

**実装優先度**: 🔴 高（コア機能）
