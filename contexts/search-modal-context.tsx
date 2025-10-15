'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { PlaceResult } from '@/lib/maps/places'
import type { Region } from '@/lib/constants/areas'

type SearchModalState = 'initial' | 'searching' | 'area-filtered'

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
  openModal: () => void
  closeModal: () => void
  setKeyword: (keyword: string) => void
  setSelectedRegion: (region: Region | null) => void
  setSelectedPrefecture: (prefecture: string | null) => void
  setSearchResults: (results: PlaceResult[]) => void
  setPopularSpots: (spots: PlaceResult[]) => void
  selectSpot: (spot: PlaceResult) => void
  removeSpot: (spot: PlaceResult) => void
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

  // 状態を自動計算
  const state: SearchModalState = keyword
    ? 'searching'
    : selectedRegion || selectedPrefecture
      ? 'area-filtered'
      : 'initial'

  const selectSpot = (spot: PlaceResult) => {
    setSelectedSpot(spot)
    // 重複チェックして配列に追加
    setSelectedSpots((prev) => {
      if (prev.some((s) => s.placeId === spot.placeId)) {
        return prev
      }
      return [...prev, spot]
    })
    setIsOpen(false)
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
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
        setKeyword,
        setSelectedRegion,
        setSelectedPrefecture,
        setSearchResults,
        setPopularSpots,
        selectSpot,
        removeSpot,
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
