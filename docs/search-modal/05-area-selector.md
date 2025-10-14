# Phase 2-2: エリアセレクタ実装

## 目的

モーダル内にエリア（都道府県）選択UIを実装します。

## UI変化

**Before**:

- 検索バーのみ表示

**After**:

- 検索バーの下にエリアセレクタが表示
- 47都道府県から選択可能
- 「すべてのエリア」オプションで絞り込み解除
- エリア選択で状態が`area-filtered`に変化

## 実装内容

### エリアセレクタコンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/area-selector.tsx`（新規作成）

```typescript
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_PREFECTURES } from '@/lib/constants/areas'
import { useSearchModal } from '@/contexts/search-modal-context'
import { MapPin } from 'lucide-react'

export function AreaSelector() {
  const { selectedArea, setSelectedArea } = useSearchModal()

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-5 w-5 text-gray-500" />
      <Select
        value={selectedArea || ''}
        onValueChange={(value) => setSelectedArea(value || null)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="エリアを選択（オプション）" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">すべてのエリア</SelectItem>
          {ALL_PREFECTURES.map((prefecture) => (
            <SelectItem key={prefecture} value={prefecture}>
              {prefecture}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

### モーダルに統合

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（更新）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'

export function SearchModal() {
  const { isOpen, closeModal, state } = useSearchModal()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="h-full max-h-screen w-full max-w-full p-0 sm:h-[90vh] sm:max-w-2xl">
        <div className="flex h-full flex-col overflow-hidden">
          {/* 固定ヘッダー: 検索バー + エリアセレクタ */}
          <div className="space-y-3 border-b p-4">
            <SearchInput />
            <AreaSelector />
          </div>

          {/* 動的コンテンツエリア */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-500">State: {state}</p>
            <p className="mt-2 text-xs text-gray-400">
              次のPhaseでタブUIを実装します
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## 設計のポイント

### 1. shadcn/ui Selectの活用

既にStep2で使用しているSelectコンポーネントを再利用。アクセシビリティとUXが保証されています。

### 2. オプショナルなフィルター

```typescript
<SelectItem value="">すべてのエリア</SelectItem>
```

空文字列を選択することで、エリアフィルターを解除できます。

### 3. MapPinアイコンで視覚的ヒント

```typescript
<MapPin className="h-5 w-5 text-gray-500" />
```

エリア選択であることを視覚的に示します。

## テスト項目

- [ ] エリアセレクタが検索バーの下に表示される
- [ ] MapPinアイコンが表示される
- [ ] セレクタをタップして都道府県リストが表示される
- [ ] 「すべてのエリア」が最初のオプションとして表示される
- [ ] 47都道府県が選択肢に含まれる
- [ ] エリア選択で状態が`area-filtered`に変わる
- [ ] 「すべてのエリア」選択で状態が`initial`に戻る
- [ ] エリア選択後にキーワード入力すると状態が`searching`に変わる

## 次のステップ

次は [Phase 3-1: おすすめタブ](./06-recommended-tab.md) で、初期状態のおすすめスポット表示を実装します。

---

**実装優先度**: 🟡 中（フィルター機能）
