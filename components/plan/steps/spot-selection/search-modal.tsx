'use client'

import { useSearchModal } from '@/contexts/search-modal-context'
import { SearchInput } from './search-input'

export function SearchModal() {
  const { isOpen, state } = useSearchModal()

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      {/* 固定ヘッダー: 検索バー（マップUI上のトリガーと同じ横幅） */}
      <div className="px-4 pt-4">
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
  )
}
