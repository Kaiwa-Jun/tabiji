# Phase 1-2: 検索バートリガー実装

## 目的

マップUI上に検索バー（トリガー）を表示し、タップでモーダルを開く機能を実装します。

## UI変化

**Before**:

- 検索バーが`disabled`状態

**After**:

- 検索バーがクリック可能
- タップするとモーダルが開く（Phase 1-3で実装）

## 実装内容

### ファイル作成

**ファイル**: `components/plan/steps/spot-selection/search-bar-trigger.tsx`（新規作成）

```typescript
'use client'

import { Search } from 'lucide-react'

interface SearchBarTriggerProps {
  onClick: () => void
}

export function SearchBarTrigger({ onClick }: SearchBarTriggerProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10">
      <button
        onClick={onClick}
        className="relative h-12 w-full rounded-lg border border-gray-300 bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <span className="pl-10 text-sm text-gray-500">スポットを検索...</span>
      </button>
    </div>
  )
}
```

### 既存ファイル更新

**ファイル**: `components/plan/steps/spot-selection.tsx`（更新）

```typescript
'use client'

import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { MapPin } from 'lucide-react'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'

function SpotSelectionContent() {
  const { openModal } = useSearchModal()

  return (
    <div className="relative h-full w-full">
      <GoogleMapWrapper
        lat={JAPAN_CENTER.lat}
        lng={JAPAN_CENTER.lng}
        zoom={JAPAN_ZOOM}
        height="100%"
        width="100%"
      />

      {/* 検索バートリガー */}
      <SearchBarTrigger onClick={openModal} />

      {/* 選択済みスポット数表示 */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              選択済みスポット: <span className="font-bold">0</span>件
            </p>
          </div>
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

### 1. 検索バーはボタン要素

`<input disabled>`ではなく`<button>`として実装することで:

- タップ領域が明確
- ホバー効果が適用可能
- アクセシビリティ向上

### 2. Context Providerで包む

`SearchModalProvider`で全体を包むことで、子コンポーネントから`useSearchModal()`でContextにアクセス可能になります。

### 3. Searchアイコンの配置

`absolute`ポジショニングで左側に固定配置し、視覚的に検索機能であることを明示します。

## テスト項目

- [ ] 検索バーが画面上部に表示される
- [ ] 検索バーにSearchアイコンが表示される
- [ ] 検索バーをタップできる
- [ ] ホバー時に背景色が変わる
- [ ] タップ時に`openModal()`が呼ばれる（次のPhaseで確認）

## 次のステップ

次は [Phase 1-3: モーダル基本構造](./03-modal-basic.md) で、shadcn/ui Dialogを使ったモーダルを実装します。

---

**実装優先度**: 🔴 高（ユーザーがモーダルを開くトリガー）
