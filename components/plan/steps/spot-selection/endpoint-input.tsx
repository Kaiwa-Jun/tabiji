'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Search, MapPin } from 'lucide-react'
import { useSearchSpots } from '@/hooks/useSearchSpots'
import type { PlaceResult } from '@/lib/maps/places'
import type { SearchType } from '@/contexts/search-modal-context'

interface EndpointInputProps {
  /** ラベル（例: "出発地点", "1日目の宿泊施設"） */
  label: string
  /** プレースホルダー */
  placeholder: string
  /** 検索タイプ */
  searchType: SearchType
  /** 現在の値 */
  value: PlaceResult | null
  /** スポット選択時のコールバック */
  onSelect: (place: PlaceResult) => void
  /** クリア時のコールバック */
  onClear: () => void
  /** 必須かどうか */
  required?: boolean
  /** 検索の中心位置（位置ベース検索用、オプション） */
  nearLocation?: { lat: number; lng: number }
}

/**
 * エンドポイント入力コンポーネント（インライン検索対応）
 * 出発地点・宿泊施設・最終目的地などの入力に使用
 * タップすると入力フィールドになり、その下に検索結果がサジェスト表示される
 */
export function EndpointInput({
  label,
  placeholder,
  searchType,
  value,
  onSelect,
  onClear,
  required = false,
  nearLocation,
}: EndpointInputProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [keyword, setKeyword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 検索結果を取得（都道府県フィルタなし、位置ベース検索対応）
  const { results, isLoading } = useSearchSpots(keyword, null, searchType, nearLocation)

  // 検索結果が更新されたらログ出力
  useEffect(() => {
    if (keyword.trim()) {
      console.log('[EndpointInput] 🎯 検索結果受信:', {
        label,
        keyword,
        searchType,
        resultsCount: results.length,
        isLoading,
        firstResults: results.slice(0, 3).map((r) => r.name),
      })
    }
  }, [results, isLoading, keyword, label, searchType])

  /**
   * 検索モードを開始
   */
  const handleStartSearch = () => {
    setIsSearching(true)
    setKeyword('')
  }

  /**
   * 検索モードになったらスクロールとフォーカスを実行
   */
  useEffect(() => {
    if (isSearching && containerRef.current && inputRef.current) {
      // 親のスクロールコンテナを探す
      let scrollContainer: HTMLElement | null = containerRef.current.parentElement
      while (scrollContainer) {
        const style = window.getComputedStyle(scrollContainer)
        if (
          style.overflowY === 'auto' ||
          style.overflowY === 'scroll' ||
          scrollContainer.classList.contains('overflow-y-auto')
        ) {
          break
        }
        scrollContainer = scrollContainer.parentElement
      }

      if (scrollContainer) {
        // 要素のスクロールコンテナからの相対位置を計算
        let offsetTop = 0
        let element: HTMLElement | null = containerRef.current

        while (element && element !== scrollContainer) {
          offsetTop += element.offsetTop
          element = element.offsetParent as HTMLElement | null
        }

        // 要素がコンテナの最上部に来るようにスクロール
        scrollContainer.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        })
      }

      // すぐにフォーカス
      inputRef.current.focus()
    }
  }, [isSearching])

  /**
   * スポット選択ハンドラー
   */
  const handleSelectSpot = (spot: PlaceResult) => {
    onSelect(spot)
    setIsSearching(false)
    setKeyword('')
  }

  /**
   * クリアハンドラー
   */
  const handleClear = () => {
    onClear()
    setKeyword('')
    setIsSearching(false)
  }

  /**
   * 外側クリックで検索モードを閉じる
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearching(false)
        setKeyword('')
      }
    }

    if (isSearching) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isSearching])

  /**
   * 住所から郵便番号を削除
   */
  const removePostalCode = (address: string): string => {
    // 郵便番号パターン: 〒123-4567 または 〒1234567
    return address.replace(/〒?\d{3}-?\d{4}\s*/g, '').trim()
  }

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* 選択済み表示 */}
      {value && !isSearching ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-3">
          <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-gray-900">{value.name}</p>
            <p className="truncate text-sm text-gray-500">{removePostalCode(value.address)}</p>
          </div>
          <button
            onClick={handleClear}
            className="rounded-full p-1 hover:bg-gray-100 flex-shrink-0"
            aria-label={`${label}をクリア`}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ) : isSearching ? (
        /* 検索モード */
        <div className="space-y-2">
          {/* 検索入力フィールド */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-blue-500 bg-white h-12 px-10 text-base leading-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                aria-label="キーワードをクリア"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* 検索結果サジェスト */}
          {keyword.trim() && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">検索中...</div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {results.map((spot) => (
                    <button
                      key={spot.placeId}
                      onClick={() => handleSelectSpot(spot)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                    >
                      <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">
                          <span className="font-medium text-gray-900">{spot.name}</span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-gray-500">{removePostalCode(spot.address)}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  検索結果が見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 未選択状態（クリックで検索モードに） */
        <button
          onClick={handleStartSearch}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white p-3 text-left hover:border-gray-400 hover:bg-gray-50"
        >
          <Search className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">{placeholder}</span>
        </button>
      )}
    </div>
  )
}
