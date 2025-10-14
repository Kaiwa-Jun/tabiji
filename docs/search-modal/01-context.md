# Phase 1-1: SearchModalContext作成

## 目的

検索モーダルの状態管理を行うReact Contextを実装します。

## UI変化

- なし（状態管理のみ）

## 実装内容

### ファイル作成

**ファイル**: `contexts/search-modal-context.tsx`（新規作成）

```typescript
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { PlaceResult } from '@/lib/maps/places'

type SearchModalState = 'initial' | 'searching' | 'area-filtered'

interface SearchModalContextValue {
  isOpen: boolean
  state: SearchModalState
  keyword: string
  selectedArea: string | null
  searchResults: PlaceResult[]
  popularSpots: PlaceResult[]
  openModal: () => void
  closeModal: () => void
  setKeyword: (keyword: string) => void
  setSelectedArea: (area: string | null) => void
  setSearchResults: (results: PlaceResult[]) => void
  setPopularSpots: (spots: PlaceResult[]) => void
}

const SearchModalContext = createContext<SearchModalContextValue | undefined>(undefined)

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [popularSpots, setPopularSpots] = useState<PlaceResult[]>([])

  // 状態を自動計算
  const state: SearchModalState = keyword
    ? 'searching'
    : selectedArea
      ? 'area-filtered'
      : 'initial'

  return (
    <SearchModalContext.Provider
      value={{
        isOpen,
        state,
        keyword,
        selectedArea,
        searchResults,
        popularSpots,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
        setKeyword,
        setSelectedArea,
        setSearchResults,
        setPopularSpots,
      }}
    >
      {children}
    </SearchModalContext.Provider>
  )
}

export function useSearchModal() {
  const context = useContext(SearchModalContext)
  if (!context) {
    throw new Error('useSearchModal must be used within SearchModalProvider')
  }
  return context
}
```

## 設計のポイント

### 1. 状態の自動計算

```typescript
const state: SearchModalState = keyword ? 'searching' : selectedArea ? 'area-filtered' : 'initial'
```

キーワードとエリアの組み合わせで自動的に状態が決まるため、開発者が明示的に状態を切り替える必要がありません。

### 2. 必要最小限のstate

- `isOpen`: モーダルの開閉状態
- `keyword`: 検索キーワード
- `selectedArea`: 選択中のエリア
- `searchResults`: 検索結果（後のPhaseで使用）
- `popularSpots`: 人気スポット（後のPhaseで使用）

## テスト項目

- [ ] Contextが正しく初期化される
- [ ] `openModal()`で`isOpen`が`true`になる
- [ ] `closeModal()`で`isOpen`が`false`になる
- [ ] キーワード設定で状態が`searching`になる
- [ ] エリア設定（キーワードなし）で状態が`area-filtered`になる
- [ ] キーワードとエリアの両方クリアで状態が`initial`になる

## 次のステップ

次は [Phase 1-2: 検索バートリガー](./02-search-bar-trigger.md) で、マップUI上に表示する検索バーを実装します。

---

**実装優先度**: 🔴 高（基盤となる状態管理）
