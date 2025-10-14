'use client'

import { Search } from 'lucide-react'

interface SearchBarTriggerProps {
  onClick: () => void
}

export function SearchBarTrigger({ onClick }: SearchBarTriggerProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10">
      <button
        onClick={onClick}
        className="relative flex h-12 w-full items-center rounded-lg border border-gray-300 bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Search className="ml-3 h-5 w-5 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">スポットを検索...</span>
      </button>
    </div>
  )
}
