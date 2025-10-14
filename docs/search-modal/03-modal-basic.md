# Phase 1-3: モーダル基本構造実装

## 目的

shadcn/ui Dialogを使用したフルスクリーンモーダルの基本構造を実装します。

## UI変化

**Before**:

- 検索バータップしても何も起きない

**After**:

- 検索バータップでモーダルが開く
- ×ボタンまたはモーダル外タップでモーダルが閉じる
- モバイルではフルスクリーン表示

## 実装内容

### 1. shadcn/ui Dialogのインストール

```bash
npx shadcn@latest add dialog
```

### 2. モーダルコンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/search-modal.tsx`（新規作成）

```typescript
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSearchModal } from '@/contexts/search-modal-context'

export function SearchModal() {
  const { isOpen, closeModal, state } = useSearchModal()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="h-full max-h-screen w-full max-w-full p-0 sm:h-[90vh] sm:max-w-2xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>スポット検索</DialogTitle>
        </DialogHeader>

        <div className="flex h-full flex-col overflow-hidden">
          {/* TODO: 検索バー・エリアセレクタ・動的コンテンツ */}
          <div className="p-4">
            <p className="text-sm text-gray-500">State: {state}</p>
            <p className="mt-2 text-xs text-gray-400">
              次のPhaseで検索UIを実装します
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Step3に統合

**ファイル**: `components/plan/steps/spot-selection.tsx`（更新）

```typescript
'use client'

import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { MapPin } from 'lucide-react'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'

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

      <SearchBarTrigger onClick={openModal} />

      {/* モーダルを追加 */}
      <SearchModal />

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

### 1. レスポンシブ対応

```typescript
className = 'h-full max-h-screen w-full max-w-full p-0 sm:h-[90vh] sm:max-w-2xl'
```

- **モバイル**: フルスクリーン表示
- **デスクトップ**: 90vhの高さで中央表示

### 2. flexレイアウトで縦方向配置

```typescript
<div className="flex h-full flex-col overflow-hidden">
```

ヘッダー（固定）+ コンテンツエリア（スクロール可能）の構成を実現します。

### 3. onOpenChangeハンドラ

```typescript
onOpenChange={(open) => !open && closeModal()}
```

ユーザーが×ボタンやモーダル外をクリックした際に`closeModal()`を呼び出します。

## テスト項目

- [ ] 検索バーをタップしてモーダルが開く
- [ ] モーダルが開いている間、背景がオーバーレイされる
- [ ] モーダルのヘッダーに「スポット検索」と表示される
- [ ] ×ボタンでモーダルが閉じる
- [ ] モーダル外をタップしてモーダルが閉じる
- [ ] モバイル画面でフルスクリーン表示される
- [ ] デスクトップ画面で中央に90vhで表示される
- [ ] モーダル内に現在の状態（state）が表示される

## 次のステップ

次は [Phase 2-1: 戻るボタン付き検索バー](./04-search-input.md) で、モーダル内の検索バー（戻るボタン付き）を実装します。

---

**実装優先度**: 🔴 高（モーダルの基盤）
