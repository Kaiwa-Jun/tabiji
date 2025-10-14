# Phase 3-2: 履歴タブ実装

## 目的

初期状態で検索履歴を表示するタブを実装します。

## UI変化

**Before**:

- 履歴タブに仮のテキストのみ

**After**:

- 履歴タブに検索履歴が表示される
- 履歴がない場合は空状態メッセージを表示
- 履歴項目をタップできる（動作は後のPhaseで実装）

## 実装内容

### 履歴タブコンポーネント作成

**ファイル**: `components/plan/steps/spot-selection/history-tab.tsx`（新規作成）

```typescript
'use client'

import { History } from 'lucide-react'

export function HistoryTab() {
  // TODO: LocalStorageから検索履歴を取得
  const history: string[] = [] // 空の場合の例

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">検索履歴がありません</p>
        <p className="mt-1 text-xs text-gray-400">
          スポットを検索すると、ここに履歴が表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((item, index) => (
        <button
          key={index}
          className="w-full rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-400" />
            <span>{item}</span>
          </div>
        </button>
      ))}
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'
import { HistoryTab } from './history-tab'

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
                  <HistoryTab />
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

### 1. 空状態のUX

```typescript
if (history.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <History className="mb-3 h-12 w-12 text-gray-300" />
      <p className="text-sm text-gray-500">検索履歴がありません</p>
    </div>
  )
}
```

履歴がない場合に適切なメッセージとアイコンを表示し、ユーザーに状況を明確に伝えます。

### 2. 履歴アイコンの活用

各履歴項目に小さなHistoryアイコンを表示し、視覚的な一貫性を保ちます。

### 3. LocalStorage統合は後回し

現時点では空配列を返すことで、空状態のUIを確認できます。実際のLocalStorage統合は後のPhaseまたは拡張案として実装します。

## テスト項目

- [ ] 履歴タブをタップして表示切り替えができる
- [ ] 履歴がない場合、空状態メッセージが表示される
- [ ] 空状態でHistoryアイコンが大きく表示される
- [ ] 空状態メッセージに「検索履歴がありません」と表示される
- [ ] 補足メッセージが表示される

## 今後の拡張

- LocalStorageに検索キーワードを保存
- 履歴項目タップで再検索
- 履歴の削除機能
- 履歴の上限設定（例: 最新10件まで）

## 次のステップ

次は [Phase 4: キーワード検索](./08-keyword-search.md) で、Places API統合と検索結果表示を実装します。

---

**実装優先度**: 🟢 低（Nice to have）
