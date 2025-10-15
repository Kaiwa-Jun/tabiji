'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MapPin, X } from 'lucide-react'
import type { PlaceResult } from '@/lib/maps/places'
import { Button } from '@/components/ui/button'

interface SpotCardProps {
  spot: PlaceResult
  onRemove: (spot: PlaceResult) => void
}

/**
 * スポットカードコンポーネント
 * 選択済みスポットを表示し、削除可能にする
 */
export function SpotCard({ spot, onRemove }: SpotCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* 削除ボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 z-20 h-6 w-6 rounded-full bg-white/90 hover:bg-white"
          onClick={() => onRemove(spot)}
          aria-label={`${spot.name}を削除`}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* スポット画像 + 情報オーバーレイ */}
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          {/* 背景画像 */}
          {spot.photoUrl ? (
            <Image
              src={spot.photoUrl}
              alt={spot.name}
              fill
              className="object-cover"
              sizes="280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* 半透過背景 + スポット情報（画像下部にオーバーレイ） */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/75 via-black/50 to-transparent p-2.5 pt-6">
            {/* 1行目: スポット名 + 評価 */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-medium text-sm text-white" title={spot.name}>
                {spot.name}
              </h3>
              {spot.rating && (
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{spot.rating}</span>
                </div>
              )}
            </div>
            {/* 2行目: 住所 */}
            <p className="mt-1 truncate text-xs text-white/90" title={spot.address}>
              {spot.address}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
