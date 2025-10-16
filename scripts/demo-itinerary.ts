/**
 * 旅程最適化デモスクリプト
 *
 * 実行方法:
 * npx tsx scripts/demo-itinerary.ts
 */

// NOTE: このスクリプトはNode.js環境で実行されるため、
// Google Maps APIのモックが必要です

// Google Maps APIのモック
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).google = {
  maps: {
    LatLng: class {
      private _lat: number
      private _lng: number

      constructor(lat: number, lng: number) {
        this._lat = lat
        this._lng = lng
      }
      lat() {
        return this._lat
      }
      lng() {
        return this._lng
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      equals(other: unknown) {
        return false
      }
      toJSON() {
        return { lat: this._lat, lng: this._lng }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toUrlValue(precision?: number) {
        return `${this._lat},${this._lng}`
      }
    },
    geometry: {
      spherical: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        computeDistanceBetween(from: any, to: any) {
          // 簡易的なユークリッド距離の計算
          const latDiff = from.lat() - to.lat()
          const lngDiff = from.lng() - to.lng()
          return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000
        },
      },
    },
  },
}

import { optimizeSpotOrder, allocateSpotsByDay, generateDayPlan } from '../lib/itinerary'
import type { Spot } from '../lib/itinerary'

console.log('🗺️  旅程最適化アルゴリズム - デモ\n')

// 東京の観光スポット
const spots: Spot[] = [
  { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
  { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
  { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
  { id: '4', name: '浅草寺', lat: 35.7148, lng: 139.7967 },
  { id: '5', name: '皇居', lat: 35.6852, lng: 139.7528 },
  { id: '6', name: '明治神宮', lat: 35.6764, lng: 139.6993 },
  { id: '7', name: '新宿御苑', lat: 35.6852, lng: 139.71 },
  { id: '8', name: '上野動物園', lat: 35.7154, lng: 139.7731 },
  { id: '9', name: 'お台場', lat: 35.627, lng: 139.7703 },
]

console.log('📍 選択されたスポット:')
spots.forEach((spot, i) => {
  console.log(`   ${i + 1}. ${spot.name} (${spot.lat}, ${spot.lng})`)
})

console.log('\n⚙️  ステップ1: 訪問順序の最適化（貪欲法）')
console.time('最適化')
const optimized = optimizeSpotOrder(spots)
console.timeEnd('最適化')

console.log('\n✅ 最適化された訪問順序:')
optimized.forEach((spot, i) => {
  console.log(`   ${i + 1}. ${spot.name}`)
})

console.log('\n⚙️  ステップ2: 日ごとのスポット配分（2泊3日）')
const numberOfDays = 3
const allocated = allocateSpotsByDay(optimized, numberOfDays)

console.log('\n📅 日ごとの配分:')
for (let day = 1; day <= numberOfDays; day++) {
  const daySpots = allocated.filter((s) => s.dayNumber === day)
  console.log(`\n   【${day}日目】(${daySpots.length}スポット)`)
  daySpots.forEach((spot) => {
    console.log(`      ${spot.orderIndex}. ${spot.name}`)
  })
}

console.log('\n⚙️  ステップ3: Map形式で取得')
const dayPlan = generateDayPlan(optimized, numberOfDays)

console.log(`\n   生成されたMap: ${dayPlan.size}日分`)
for (const [day, spots] of dayPlan.entries()) {
  console.log(`   - ${day}日目: ${spots.length}スポット`)
}

console.log('\n✨ デモ完了！\n')

// 統計情報
console.log('📊 統計情報:')
console.log(`   - 総スポット数: ${spots.length}`)
console.log(`   - 旅行日数: ${numberOfDays}日`)
console.log(`   - 1日平均スポット数: ${(spots.length / numberOfDays).toFixed(1)}`)
console.log(`   - アルゴリズム: 貪欲法（最近傍法）`)
console.log(`   - 時間計算量: O(n²)`)
