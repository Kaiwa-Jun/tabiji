'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { PlaceResult } from '@/lib/maps/places'

type SearchModalState = 'initial' | 'searching' | 'area-filtered'

interface SearchModalContextValue {
  isOpen: boolean
  state: SearchModalState
  keyword: string
  selectedArea: string | null
  searchResults: PlaceResult[]
  popularSpots: PlaceResult[]
  openModal: () => void
  closeModal: () => void
  setKeyword: (keyword: string) => void
  setSelectedArea: (area: string | null) => void
  setSearchResults: (results: PlaceResult[]) => void
  setPopularSpots: (spots: PlaceResult[]) => void
}

const SearchModalContext = createContext<SearchModalContextValue | undefined>(undefined)

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [popularSpots, setPopularSpots] = useState<PlaceResult[]>([])

  // 状態を自動計算
  const state: SearchModalState = keyword
    ? 'searching'
    : selectedArea
      ? 'area-filtered'
      : 'initial'

  return (
    <SearchModalContext.Provider
      value={{
        isOpen,
        state,
        keyword,
        selectedArea,
        searchResults,
        popularSpots,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
        setKeyword,
        setSelectedArea,
        setSearchResults,
        setPopularSpots,
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
