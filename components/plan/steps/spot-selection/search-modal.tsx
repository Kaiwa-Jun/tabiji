'use client'

import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'
import { AreaSelector } from './area-selector'

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
        <p className="text-sm text-gray-500">State: {state}</p>
        <p className="mt-2 text-xs text-gray-400">
          次のPhaseでタブUIを実装します
        </p>
      </div>
    </div>
  )
}
