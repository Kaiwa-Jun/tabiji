# Phase 3-1: おすすめタブ実装

## 目的

初期状態（キーワード・エリア未選択）でおすすめスポットタブを表示します。

## UI変化

**Before**:

- 動的コンテンツエリアに仮のテキストのみ

**After**:

- 「おすすめ」「履歴」の2つのタブが表示
- おすすめタブに人気の観光スポットが表示される
- スポットカードをタップできる（動作は後のPhaseで実装）

## 実装内容

### おすすめタブコンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/recommended-tab.tsx`（新規作成）

```typescript
'use client'

import { Sparkles } from 'lucide-react'

export function RecommendedTab() {
  // TODO: おすすめスポットのロジック実装
  const recommendations = [
    { id: '1', name: '東京タワー', area: '東京都' },
    { id: '2', name: '清水寺', area: '京都府' },
    { id: '3', name: '厳島神社', area: '広島県' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Sparkles className="h-4 w-4" />
        <span>人気の観光スポット</span>
      </div>

      {recommendations.map((spot) => (
        <button
          key={spot.id}
          className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
        >
          <h3 className="font-medium">{spot.name}</h3>
          <p className="text-sm text-gray-500">{spot.area}</p>
        </button>
      ))}
    </div>
  )
}
```

### モーダルにタブUIを統合

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（更新）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'

export function SearchModal() {
  const { isOpen, closeModal, state } = useSearchModal()

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
                  <p className="text-sm text-gray-500">
                    次のPhaseで履歴タブを実装します
                  </p>
                </TabsContent>
              </Tabs>
            )}

            {state === 'searching' && (
              <p className="text-sm text-gray-500">検索結果を表示（Phase 4で実装）</p>
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

### 1. タブの等幅配置

```typescript
<TabsList className="grid w-full grid-cols-2">
```

`grid-cols-2`で2つのタブを等幅で配置し、タップしやすいUIを実現。

### 2. Sparklesアイコンで視覚的な強調

```typescript
<Sparkles className="h-4 w-4" />
```

「おすすめ」であることを視覚的に伝えます。

### 3. ホバー効果

```typescript
className = 'hover:bg-gray-50'
```

デスクトップでのマウスオーバー時にフィードバックを提供。

## テスト項目

- [ ] 初期状態（state='initial'）でタブUIが表示される
- [ ] 「おすすめ」「履歴」の2つのタブが表示される
- [ ] デフォルトで「おすすめ」タブが選択されている
- [ ] おすすめタブに3つのスポットが表示される
- [ ] Sparklesアイコンが表示される
- [ ] スポットカードをタップできる
- [ ] ホバー時に背景色が変わる
- [ ] タブを切り替えられる

## 次のステップ

次は [Phase 3-2: 履歴タブ](./07-history-tab.md) で、検索履歴表示を実装します。

---

**実装優先度**: 🟡 中（初期状態のコンテンツ）
