'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { useSearchModal } from '@/contexts/search-modal-context'

export function SearchInput() {
  const { keyword, setKeyword, closeModal, isOpen } = useSearchModal()
  const inputRef = useRef<HTMLInputElement>(null)

  // モーダルが開いた時に自動的にinputにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // requestAnimationFrameを使用してレンダリング後に確実にフォーカス
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        // iOS Safari用に追加で設定
        inputRef.current?.click()
      })
    }
  }, [isOpen])

  return (
    <div className="relative h-12 w-full rounded-lg border border-gray-300 bg-white">
      {/* 戻るボタン（検索バー内部左端） */}
      <button
        onClick={closeModal}
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="検索を閉じる"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>

      {/* 検索入力欄 */}
      <input
        ref={inputRef}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="スポット名やキーワードを入力..."
        autoFocus
        className="h-full w-full rounded-lg border-none bg-transparent pl-12 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* クリアボタン（検索バー内部右端） */}
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
  )
}
