'use client'

import { SpotCard } from './spot-card'
import type { PlaceResult } from '@/lib/maps/places'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { MapPin } from 'lucide-react'

interface SpotListProps {
  spots: PlaceResult[]
  onRemove: (spot: PlaceResult) => void
}

/**
 * スポット一覧コンポーネント（横スクロール）
 * 選択済みスポットをカード形式で表示
 */
export function SpotList({ spots, onRemove }: SpotListProps) {
  if (spots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10 p-6 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          まだスポットが選択されていません
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          検索バーから行きたい場所を探してみましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">選択済みスポット</h3>
        <p className="text-xs text-muted-foreground">
          {spots.length}件
        </p>
      </div>

      {/* 横スクロールリスト */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {spots.map((spot) => (
            <div key={spot.placeId} className="w-[200px] flex-shrink-0">
              <SpotCard spot={spot} onRemove={onRemove} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
