'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Map, List } from 'lucide-react'

interface TabSwitcherProps {
  activeTab: 'map' | 'route-list'
  onTabChange: (tab: 'map' | 'route-list') => void
}

/**
 * プレビューモード時のタブ切り替えコンポーネント
 * マップタブと旅程リストタブを切り替える
 */
export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20">
      {/* タブ領域全体にぼかし効果を適用（旅程リストタブ時のみ） */}
      <div className="relative">
        {/* ぼかし背景エリア（旅程リストタブ時のみ表示） */}
        {activeTab === 'route-list' && (
          <div className="absolute inset-0 h-20 bg-white/30 backdrop-blur-md" />
        )}

        {/* タブコンテンツ */}
        <div className="relative px-4 pt-4">
          <Tabs
            value={activeTab}
            onValueChange={onTabChange as (value: string) => void}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg">
              <TabsTrigger
                value="map"
                className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Map className="h-4 w-4" />
                マップ
              </TabsTrigger>
              <TabsTrigger
                value="route-list"
                className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <List className="h-4 w-4" />
                旅程リスト
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
