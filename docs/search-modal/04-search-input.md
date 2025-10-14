# Phase 2-1: 戻るボタン付き検索バー実装

## 目的

モーダル内に戻るボタン（<アイコン）付きの検索バーを実装します。

## UI変化

**Before**:

- モーダル内に仮のコンテンツのみ表示

**After**:

- モーダル上部に戻るボタン + 検索入力欄が表示
- 戻るボタン（<）をタップするとモーダルが閉じる
- 検索キーワードを入力できる
- キーワードがある場合、クリアボタン（×）が表示される

## 実装内容

### 1. shadcn/ui Tabsのインストール

```bash
npx shadcn@latest add tabs
```

### 2. 検索入力コンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/search-input.tsx`（新規作成）

```typescript
'use client'

import { ChevronLeft, X } from 'lucide-react'
import { useSearchModal } from '@/contexts/search-modal-context'

export function SearchInput() {
  const { keyword, setKeyword, closeModal } = useSearchModal()

  return (
    <div className="flex items-center gap-2">
      {/* 戻るボタン */}
      <button
        onClick={closeModal}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="検索を閉じる"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>

      {/* 検索入力欄 */}
      <div className="relative flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="スポット名やキーワードを入力..."
          className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
            aria-label="検索キーワードをクリア"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  )
}
```

### 3. モーダルに統合

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（更新）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'

export function SearchModal() {
  const { isOpen, closeModal, state } = useSearchModal()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="h-full max-h-screen w-full max-w-full p-0 sm:h-[90vh] sm:max-w-2xl">
        <div className="flex h-full flex-col overflow-hidden">
          {/* 固定ヘッダー: 検索バー */}
          <div className="border-b p-4">
            <SearchInput />
          </div>

          {/* 動的コンテンツエリア */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-500">State: {state}</p>
            <p className="mt-2 text-xs text-gray-400">
              次のPhaseでエリアセレクタを実装します
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## 設計のポイント

### 1. 戻るボタンの配置

```typescript
<ChevronLeft className="h-6 w-6 text-gray-700" />
```

- モバイルアプリで一般的な「戻る」UIパターン
- タップ領域を確保するため`h-10 w-10`のボタンサイズ

### 2. 検索入力欄のクリアボタン

```typescript
{keyword && (
  <button onClick={() => setKeyword('')}>
    <X className="h-4 w-4 text-gray-500" />
  </button>
)}
```

キーワードがある場合のみ表示される条件付きレンダリング。

### 3. flexレイアウト

```typescript
<div className="flex items-center gap-2">
```

戻るボタンと検索入力欄を横並びで配置し、`gap-2`で適切な間隔を確保。

## テスト項目

- [ ] モーダル上部に戻るボタン（<）が表示される
- [ ] 戻るボタンをタップしてモーダルが閉じる
- [ ] 戻るボタンでマップUIに戻る
- [ ] 検索バーに文字入力できる
- [ ] 入力中に状態が`searching`に変わる
- [ ] クリアボタン（×）でキーワードをリセットできる
- [ ] クリア後に状態が`initial`に戻る
- [ ] キーワードがない場合、クリアボタンが非表示

## 次のステップ

次は [Phase 2-2: エリアセレクタ](./05-area-selector.md) で、都道府県選択UIを実装します。

---

**実装優先度**: 🔴 高（モーダルの主要UI）
