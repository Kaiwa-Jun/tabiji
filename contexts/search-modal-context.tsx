'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { PlaceResult } from '@/lib/maps/places'
import type { Region } from '@/lib/constants/areas'

type SearchModalState = 'initial' | 'searching' | 'area-filtered'

/**
 * 検索タイプ
 * - spot: 通常のスポット検索（観光地、レストランなど）
 * - station: 駅・空港
 * - accommodation: 宿泊施設（ホテル、旅館など）
 */
export type SearchType = 'spot' | 'station' | 'accommodation'

/**
 * スポット選択時のカスタムコールバック型
 */
type OnSelectCallback = (spot: PlaceResult) => void

interface SearchModalContextValue {
  isOpen: boolean
  state: SearchModalState
  keyword: string
  selectedRegion: Region | null
  selectedPrefecture: string | null
  searchResults: PlaceResult[]
  popularSpots: PlaceResult[]
  selectedSpot: PlaceResult | null
  selectedSpots: PlaceResult[]
  searchType: SearchType
  openModal: (searchType?: SearchType, onSelect?: OnSelectCallback) => void
  closeModal: () => void
  setKeyword: (keyword: string) => void
  setSelectedRegion: (region: Region | null) => void
  setSelectedPrefecture: (prefecture: string | null) => void
  setSearchResults: (results: PlaceResult[]) => void
  setPopularSpots: (spots: PlaceResult[]) => void
  selectSpot: (spot: PlaceResult) => void
  removeSpot: (spot: PlaceResult) => void
  setSearchType: (searchType: SearchType) => void
}

const SearchModalContext = createContext<SearchModalContextValue | undefined>(undefined)

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [popularSpots, setPopularSpots] = useState<PlaceResult[]>([])
  const [selectedSpot, setSelectedSpot] = useState<PlaceResult | null>(null)
  const [selectedSpots, setSelectedSpots] = useState<PlaceResult[]>([])
  const [searchType, setSearchType] = useState<SearchType>('spot')
  const [onSelectCallback, setOnSelectCallback] = useState<OnSelectCallback | null>(null)

  // 状態を自動計算
  const state: SearchModalState = keyword
    ? 'searching'
    : selectedRegion || selectedPrefecture
      ? 'area-filtered'
      : 'initial'

  const openModal = (type: SearchType = 'spot', onSelect?: OnSelectCallback) => {
    setSearchType(type)
    setIsOpen(true)
    // カスタムコールバックを設定（関数をstateに保存するため、関数を返す関数として設定）
    setOnSelectCallback(() => onSelect || null)
    // モーダルを開く際に検索状態をリセット
    setKeyword('')
    setSelectedRegion(null)
    setSelectedPrefecture(null)
  }

  const selectSpot = (spot: PlaceResult) => {
    setSelectedSpot(spot)

    // カスタムコールバックが設定されている場合はそれを実行
    if (onSelectCallback) {
      onSelectCallback(spot)
    } else {
      // デフォルト動作: selectedSpotsに追加
      setSelectedSpots((prev) => {
        if (prev.some((s) => s.placeId === spot.placeId)) {
          return prev
        }
        return [...prev, spot]
      })
    }

    setIsOpen(false)
    // コールバックをクリア
    setOnSelectCallback(null)
  }

  const removeSpot = (spot: PlaceResult) => {
    setSelectedSpots((prev) => prev.filter((s) => s.placeId !== spot.placeId))
  }

  return (
    <SearchModalContext.Provider
      value={{
        isOpen,
        state,
        keyword,
        selectedRegion,
        selectedPrefecture,
        searchResults,
        popularSpots,
        selectedSpot,
        selectedSpots,
        searchType,
        openModal,
        closeModal: () => setIsOpen(false),
        setKeyword,
        setSelectedRegion,
        setSelectedPrefecture,
        setSearchResults,
        setPopularSpots,
        selectSpot,
        removeSpot,
        setSearchType,
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
