'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'

export function SearchModal() {
  const { isOpen, state } = useSearchModal()

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      {/* 固定ヘッダー: 検索バー + エリアセレクタ */}
      <div className="space-y-2 border-b px-4 pb-3 pt-4">
        <SearchInput />
        <AreaSelector />
      </div>

      {/* 動的コンテンツエリア */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 初期状態: タブUI（おすすめ/履歴） */}
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

        {/* 検索中: 検索結果表示 */}
        {state === 'searching' && (
          <p className="text-sm text-gray-500">検索結果を表示（Phase 8で実装）</p>
        )}

        {/* エリアフィルター: エリア別人気スポット */}
        {state === 'area-filtered' && (
          <p className="text-sm text-gray-500">
            エリア別人気スポットを表示（Phase 8で実装）
          </p>
        )}
      </div>
    </div>
  )
}
