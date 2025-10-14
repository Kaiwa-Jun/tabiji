'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchModal } from '@/contexts/search-modal-context'
import { useSearchSpots } from '@/hooks/useSearchSpots'
import { useAreaSpots } from '@/hooks/useAreaSpots'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'
import { RecommendedTab } from './recommended-tab'
import { HistoryTab } from './history-tab'
import { SearchResults } from './search-results'
import { AreaFilteredResults } from './area-filtered-results'

export function SearchModal() {
  const { isOpen, state, keyword, selectedPrefecture } = useSearchModal()
  const { results, isLoading } = useSearchSpots(keyword, selectedPrefecture)
  const {
    results: areaResults,
    isLoading: areaLoading,
  } = useAreaSpots(selectedPrefecture)

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
              <HistoryTab />
            </TabsContent>
          </Tabs>
        )}

        {/* 検索中: 検索結果表示 */}
        {state === 'searching' && (
          <SearchResults results={results} isLoading={isLoading} />
        )}

        {/* エリアフィルター: エリア別人気スポット */}
        {state === 'area-filtered' && selectedPrefecture && (
          <AreaFilteredResults
            results={areaResults}
            isLoading={areaLoading}
            prefecture={selectedPrefecture}
          />
        )}
      </div>
    </div>
  )
}
