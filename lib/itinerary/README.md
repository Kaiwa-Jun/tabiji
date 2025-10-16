# 旅程最適化ロジック

旅程の最適化・時刻計算などのロジックを配置します。

## ファイル構成

```
itinerary/
├── index.ts            # 公開API（エントリーポイント）
├── types.ts            # 型定義
├── optimizer.ts        # ✅ 訪問順序の最適化アルゴリズム（貪欲法）
├── spot-allocator.ts   # ✅ 日別スポット配分ロジック
└── time-calculator.ts  # 🔄 時刻計算ロジック（未実装）
```

## 実装済み機能

### 訪問順序の最適化（optimizer.ts）

貪欲法（最近傍法）による訪問順序の最適化を実装。

- **アルゴリズム**: 最も西にあるスポットから開始し、現在地から最も近いスポットを順次選択
- **時間計算量**: O(n²)
- **テストカバレッジ**: 96.66% (Statements), 91.66% (Branch)

**使用例**:

```typescript
import { optimizeSpotOrder } from '@/lib/itinerary'

const spots = [
  { id: '1', name: '東京駅', lat: 35.6812, lng: 139.7671 },
  { id: '2', name: '東京タワー', lat: 35.6586, lng: 139.7454 },
  { id: '3', name: 'スカイツリー', lat: 35.7101, lng: 139.8107 },
]

const optimized = optimizeSpotOrder(spots)
// 最も効率的な訪問順序に並べ替えられる
```

### 日別スポット配分（spot-allocator.ts）

スポットを旅行日数に応じて均等に配分する機能を実装。

- **配分ロジック**: 余りのスポットは最初の数日に1つずつ配分
- **インデックス**: dayNumber、orderIndexは1始まり
- **テストカバレッジ**: 96% (Statements), 90% (Branch)

**使用例**:

```typescript
import { allocateSpotsByDay, generateDayPlan } from '@/lib/itinerary'

// 配列として取得
const allocated = allocateSpotsByDay(spots, 2)
// 1日目: 3スポット、2日目: 2スポット

// Mapとして取得
const dayPlan = generateDayPlan(spots, 2)
// Map { 1 => [...], 2 => [...] }
```

## 実装予定

- **時刻計算ロジック**: スポット間の移動時間、滞在時間の計算
- **遺伝的アルゴリズム**: より最適なルート探索（将来的な改善）

## テスト

全29個のテストケースが実装済み。

```bash
# テスト実行
npm test -- optimizer.test.ts spot-allocator.test.ts

# カバレッジ付きテスト
npm run test:coverage -- optimizer.test.ts spot-allocator.test.ts
```

## 関連Issue

- #42: 訪問順序最適化アルゴリズム（貪欲法・日ごと配分）✅ 完了
- #43: Directions API ラッパー実装（次のステップ）
