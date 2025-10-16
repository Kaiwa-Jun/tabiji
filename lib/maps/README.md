# Google Maps API ラッパー

Google Maps API（Maps JavaScript API、Places API、Directions API）のラッパーを配置します。

## ファイル構成

```
maps/
├── loader.ts           # Google Maps ローダー（✅実装済み）
├── constants.ts        # 定数定義（ズームレベル等）（✅実装済み）
├── utils.ts            # 座標計算などのユーティリティ（✅実装済み）
├── places.ts           # Places API ラッパー（✅実装済み - issue#36）
└── directions.ts       # Directions API ラッパー（✅実装済み - issue#43）
```

## 実装済み機能

### loader.ts

- `initGoogleMaps()` - Google Maps APIの初期化と非同期ロード

### constants.ts

- 日本の中心座標、各種ズームレベル定数

### utils.ts

- `panToLocation()` - 地図を指定座標に移動
- `fitBounds()` - 複数スポットが見えるようにズーム調整
- `calculateDistance()` - 2地点間の距離計算（メートル）
- `calculateCenter()` - 複数地点の中心座標を計算
- `getMapCenter()` - 地図の中心座標を取得
- `getMapZoom()` - 地図のズームレベルを取得

### places.ts（✅ issue#36で実装）

- `searchPlacesByArea()` - エリア名から観光スポットを検索
- `getPlaceDetails()` - Google Places IDからスポット詳細を取得
- `PlaceResult`型 - Places API検索結果の型定義

### directions.ts（✅ issue#43で実装）

- `getDirections()` - 2地点間のルート情報を取得
- `getMultipleRoutes()` - 複数地点の経路を一括取得
- `calculateTotalDuration()` - 移動時間の合計を計算
- `formatDuration()` - 秒を「◯時間◯分」形式に変換
- `RouteInfo`型 - ルート情報の型定義

## 使用例

### エリアからスポットを検索

```typescript
import { searchPlacesByArea } from '@/lib/maps/places'

// 東京都の観光地を検索
const spots = await searchPlacesByArea('東京都')
console.log(`${spots.length}件のスポットが見つかりました`)

// 京都府の美術館を10件検索
const museums = await searchPlacesByArea('京都府', {
  type: 'museum',
  limit: 10,
})
```

### スポット詳細を取得

```typescript
import { getPlaceDetails } from '@/lib/maps/places'

const detail = await getPlaceDetails('ChIJN1t_tDeuEmsRUsoyG83frY4')
if (detail) {
  console.log(`${detail.name} - 評価: ${detail.rating}⭐`)
}
```

### 複数スポットの中心座標を計算

```typescript
import { calculateCenter } from '@/lib/maps/utils'

const spots = [
  { lat: 35.6812, lng: 139.7671 }, // 東京駅
  { lat: 35.6586, lng: 139.7454 }, // 東京タワー
  { lat: 35.7101, lng: 139.8107 }, // スカイツリー
]

const center = calculateCenter(spots)
console.log(`中心座標: ${center.lat}, ${center.lng}`)
```

### 地図上に複数スポットを表示

```typescript
import { fitBounds, searchPlacesByArea } from '@/lib/maps'

// スポット検索
const spots = await searchPlacesByArea('東京都')

// 全スポットが見えるように地図を調整
fitBounds(map, spots)
```

### 2地点間の移動時間を取得

```typescript
import { getDirections, formatDuration } from '@/lib/maps/directions'

const route = await getDirections(
  { lat: 35.6586, lng: 139.7454 }, // 東京タワー
  { lat: 35.6585, lng: 139.7471 } // 増上寺
)

if (route) {
  console.log(`距離: ${(route.distance / 1000).toFixed(1)}km`)
  console.log(`所要時間: ${formatDuration(route.duration)}`)
}
```

### 複数スポット間の移動時間を計算

```typescript
import { getMultipleRoutes, calculateTotalDuration, formatDuration } from '@/lib/maps/directions'

const locations = [
  { lat: 35.6812, lng: 139.7671 }, // 東京駅
  { lat: 35.6586, lng: 139.7454 }, // 東京タワー
  { lat: 35.7101, lng: 139.8107 }, // スカイツリー
]

const routes = await getMultipleRoutes(locations)
const total = calculateTotalDuration(routes)

console.log(`全${routes.length}区間の合計移動時間: ${formatDuration(total)}`)
```
