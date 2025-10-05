# TDD（Test-Driven Development）開発ガイドライン

## 概要

このドキュメントは、tabijiプロジェクトにおけるTDD（テスト駆動開発）の運用ガイドラインです。
すべてのコードでTDDを強制するのではなく、TDDが効果的な領域に絞って適用します。

## TDDの基本原則

### Red-Green-Refactor サイクル

1. **Red（失敗するテストを書く）**
   - 実装前に、期待する動作を定義したテストを書く
   - テストが失敗することを確認する

2. **Green（最小限の実装で通す）**
   - テストが通る最小限のコードを書く
   - 完璧を目指さず、まずはテストを通すことに集中

3. **Refactor（リファクタリング）**
   - テストが通った状態を保ちながらコードを改善
   - 重複の排除、可読性の向上など

## TDD適用範囲

### ✅ TDDを適用すべき領域（必須）

以下の領域では**必ずTDD**を適用します。

#### 1. ビジネスロジック

- **旅程最適化アルゴリズム**（`lib/itinerary/optimizer.ts`）
- **時刻計算ロジック**（`lib/itinerary/time-calculator.ts`）
- **日別スポット配分**（`lib/itinerary/spot-allocator.ts`）
- **座標計算ユーティリティ**（`lib/maps/utils.ts`）

**理由**: 純粋関数が多く、入出力が明確でテストしやすい

**例**:

```typescript
// __tests__/lib/itinerary/optimizer.test.ts
describe('optimizeRoute', () => {
  it('3つのスポットを最短距離順に並べ替える', () => {
    const spots = [spotA, spotB, spotC]
    const result = optimizeRoute(spots)
    expect(result).toEqual([spotB, spotA, spotC])
  })
})
```

#### 2. バリデーションロジック

- **Zodスキーマ**（`lib/schemas/`）
- **カスタムバリデーション関数**

**理由**: 入力値の境界値テストが重要

**例**:

```typescript
// __tests__/lib/schemas/plan.test.ts
describe('planSchema', () => {
  it('開始日が終了日より後の場合はエラー', () => {
    const result = planSchema.safeParse({
      startDate: '2024-01-10',
      endDate: '2024-01-05',
    })
    expect(result.success).toBe(false)
  })
})
```

#### 3. データ変換・整形ロジック

- **API レスポンスの変換**
- **日付フォーマット**
- **スポットデータの整形**

**理由**: 変換ロジックはバグが混入しやすい

#### 4. Server Actions（データ更新系）

- **プラン作成**（`actions/plans.ts`）
- **スポット保存**（`actions/spots.ts`）
- **ユーザー登録**（`actions/users.ts`）

**理由**: データ整合性が重要、モック化しやすい

**例**:

```typescript
// __tests__/actions/plans.test.ts
describe('createPlan', () => {
  it('プラン作成時にplan_membersにも作成者が追加される', async () => {
    const mockSupabase = createMockSupabase()
    const result = await createPlan(formData, mockSupabase)

    expect(mockSupabase.from).toHaveBeenCalledWith('plan_members')
    expect(result.success).toBe(true)
  })
})
```

### 🔶 TDDを推奨する領域（推奨）

以下の領域では**可能な限りTDD**を適用します。

#### 1. カスタムフック

- **フォーム状態管理フック**（`hooks/use-plan-form-storage.ts`）

**理由**: ロジックを含むフックはテスト可能

**例**:

```typescript
// __tests__/hooks/use-plan-form-storage.test.ts
import { renderHook, act } from '@testing-library/react'

describe('usePlanFormStorage', () => {
  it('LocalStorageに保存・復元できる', () => {
    const { result } = renderHook(() => usePlanFormStorage())

    act(() => {
      result.current.save({ startDate: '2024-01-01' })
    })

    expect(localStorage.getItem('plan-form')).toBeTruthy()
  })
})
```

#### 2. Context（状態管理）

- **認証Context**（`contexts/auth-context.tsx`）
- **プラン作成Context**（`contexts/plan-form-context.tsx`）

**理由**: 状態遷移のテストが重要

### ⚪ TDDを適用しない領域（例外）

以下の領域では**TDDを適用しない**か、実装後にテストを追加します。

#### 1. UIコンポーネント（プレゼンテーション層）

- **ボタン、カード、モーダルなど**（`components/ui/`）
- **レイアウトコンポーネント**

**理由**: ビジュアル確認が必要、スナップショットテストで十分

**代替手段**:

- Storybookでビジュアルテスト
- 実装後にスナップショットテスト追加

#### 2. 外部APIラッパー（初回実装時）

- **Google Maps API**（`lib/maps/places.ts`）
- **LINE Messaging API**（`lib/line/messaging.ts`）

**理由**: 外部APIの仕様確認が必要、モック作成が困難

**代替手段**:

- 実装後にモックを使ったテスト追加
- 統合テストで動作確認

#### 3. データベースクエリ（初回実装時）

- **Supabase クエリ**（`lib/queries/`）

**理由**: DB構造の確認が必要、モック作成が複雑

**代替手段**:

- 実装後にモックを使ったテスト追加
- E2Eテストで動作確認

## TDD実践ガイド

### ステップ1: テストファイル作成

実装ファイルと並行してテストファイルを作成します。

```bash
# 実装ファイル
lib/itinerary/optimizer.ts

# テストファイル
__tests__/lib/itinerary/optimizer.test.ts
```

### ステップ2: テストケースの洗い出し

実装前に、以下の観点でテストケースを洗い出します。

- **正常系**: 期待通りの入力で期待通りの出力
- **異常系**: 不正な入力でエラーが発生
- **境界値**: 最小値、最大値、空配列など
- **エッジケース**: 特殊なパターン

**例**:

```typescript
describe('calculateTravelTime', () => {
  // 正常系
  it('2地点間の移動時間を計算できる', () => {})

  // 境界値
  it('同じ地点の場合は0分を返す', () => {})

  // 異常系
  it('座標が不正な場合はエラーを投げる', () => {})
})
```

### ステップ3: Red - 失敗するテストを書く

最初のテストを書き、実行して失敗を確認します。

```typescript
// __tests__/lib/itinerary/optimizer.test.ts
import { optimizeRoute } from '@/lib/itinerary/optimizer'

describe('optimizeRoute', () => {
  it('3つのスポットを最短距離順に並べ替える', () => {
    const spots = [
      { id: '1', name: 'A', lat: 35.681, lng: 139.767 },
      { id: '2', name: 'B', lat: 35.689, lng: 139.691 },
      { id: '3', name: 'C', lat: 35.658, lng: 139.745 },
    ]

    const result = optimizeRoute(spots)

    // この時点では optimizeRoute は未実装なので失敗する
    expect(result[0].id).toBe('3') // C が最初
  })
})
```

```bash
npm test
# ❌ FAIL: optimizeRoute is not defined
```

### ステップ4: Green - 最小限の実装

テストが通る最小限のコードを書きます。

```typescript
// lib/itinerary/optimizer.ts
export function optimizeRoute(spots) {
  // 最初は単純な実装
  return spots.sort((a, b) => a.lat - b.lat)
}
```

```bash
npm test
# ✅ PASS
```

### ステップ5: Refactor - リファクタリング

テストが通った状態を保ちながら、コードを改善します。

```typescript
// lib/itinerary/optimizer.ts
import type { Spot } from '@/types/spot'

export function optimizeRoute(spots: Spot[]): Spot[] {
  // より洗練されたアルゴリズムに改善
  return nearestNeighborAlgorithm(spots)
}

function nearestNeighborAlgorithm(spots: Spot[]): Spot[] {
  // 実装...
}
```

```bash
npm test
# ✅ PASS（リファクタ後もテストが通る）
```

## テスト作成のベストプラクティス

### 1. テストは1つの関心事に集中

```typescript
// ❌ 悪い例: 複数の関心事を1つのテストに詰め込む
it('プランを作成し、メンバーを追加し、通知を送信する', () => {
  // 複数のことをテストしている
})

// ✅ 良い例: 1テスト1関心事
it('プランを作成できる', () => {})
it('作成者が自動的にメンバーに追加される', () => {})
it('プラン作成時に通知が送信される', () => {})
```

### 2. AAA パターンを使う

- **Arrange（準備）**: テストデータを用意
- **Act（実行）**: テスト対象の関数を実行
- **Assert（検証）**: 結果を検証

```typescript
it('移動時間を計算できる', () => {
  // Arrange: テストデータを準備
  const from = { lat: 35.681, lng: 139.767 }
  const to = { lat: 35.689, lng: 139.691 }

  // Act: 関数を実行
  const result = calculateTravelTime(from, to)

  // Assert: 結果を検証
  expect(result).toBeGreaterThan(0)
})
```

### 3. テストデータはファクトリー関数で作成

```typescript
// __tests__/helpers/factories.ts
export function createMockSpot(overrides = {}) {
  return {
    id: '1',
    name: 'Test Spot',
    lat: 35.681,
    lng: 139.767,
    ...overrides,
  }
}

// テストで使用
it('スポットを保存できる', () => {
  const spot = createMockSpot({ name: 'Tokyo Tower' })
  // ...
})
```

### 4. モックは必要最小限に（重要）

**原則**: モックは「制御できない外部要素」のみに使用し、自分たちのコードはモック化しない

#### ❌ モックを使うべきでない例

```typescript
// 悪い例1: 自分たちのビジネスロジックをモック化
jest.mock('@/lib/itinerary/optimizer')
import { optimizeRoute } from '@/lib/itinerary/optimizer'

it('プランを作成できる', () => {
  // optimizeRouteの実際の動作をテストしていない
  ;(optimizeRoute as jest.Mock).mockReturnValue([spot1, spot2])
  const result = createPlan(data)
  // これでは optimizeRoute にバグがあっても検出できない
})

// 悪い例2: すべての依存をモック化
jest.mock('@/lib/maps/utils')
jest.mock('@/lib/itinerary/time-calculator')
jest.mock('@/lib/schemas/plan')
// → 実装の詳細に依存しすぎ、リファクタリング時にテストが壊れる
```

#### ✅ モックを使うべき例

```typescript
// 良い例1: 外部サービス（Supabase）のモック化
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  })),
}))

// 良い例2: 外部API（Google Maps）のモック化
jest.mock('@/lib/maps/places', () => ({
  searchPlaces: jest.fn().mockResolvedValue(mockPlaces),
}))

// 良い例3: 時間依存の処理
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-01-01'))

// 良い例4: ランダム性の制御
jest.spyOn(Math, 'random').mockReturnValue(0.5)
```

#### 📊 モック vs 実装の判断基準

| 要素                       | モック | 実装 | 理由                     |
| -------------------------- | ------ | ---- | ------------------------ |
| 自分たちのビジネスロジック | ❌     | ✅   | 実際の動作をテストすべき |
| ユーティリティ関数         | ❌     | ✅   | 実際の動作をテストすべき |
| バリデーション             | ❌     | ✅   | 実際の動作をテストすべき |
| Supabase                   | ✅     | ❌   | 外部サービス、制御不可   |
| Google Maps API            | ✅     | ❌   | 外部サービス、制御不可   |
| LINE Messaging API         | ✅     | ❌   | 外部サービス、制御不可   |
| 現在時刻                   | ✅     | ❌   | テスト実行時に変わる     |
| ランダム値                 | ✅     | ❌   | テストの再現性のため     |

#### 💡 モックレスなテストの書き方

```typescript
// ❌ 悪い例: 内部ロジックをモック化
jest.mock('@/lib/itinerary/optimizer')
jest.mock('@/lib/itinerary/time-calculator')

it('プランを作成できる', async () => {
  ;(optimizeRoute as jest.Mock).mockReturnValue(mockRoute)
  ;(calculateTime as jest.Mock).mockReturnValue(mockTime)

  const result = await createPlan(data)
  // 実際のロジックをテストしていない
})

// ✅ 良い例: 実際のロジックを使う
it('プランを作成できる', async () => {
  // Supabaseのみモック化（外部サービス）
  const mockSupabase = createMockSupabaseClient()

  // 実際のロジックを使用
  const result = await createPlan(data, mockSupabase)

  // 実際の最適化・時刻計算が行われる
  expect(result.plan_days[0].plan_spots).toHaveLength(3)
  expect(result.plan_days[0].plan_spots[0].arrival_time).toBeTruthy()
})
```

#### 🔧 統合テスト vs ユニットテスト

**ユニットテスト**: 1つの関数・モジュールを独立してテスト

```typescript
// lib/itinerary/optimizer.ts のユニットテスト
describe('optimizeRoute', () => {
  it('最短距離順に並べ替える', () => {
    const spots = [spotA, spotB, spotC]
    const result = optimizeRoute(spots)
    // モック不要、純粋関数なのでそのままテスト可能
    expect(result).toEqual([spotB, spotA, spotC])
  })
})
```

**統合テスト**: 複数のモジュールを組み合わせてテスト

```typescript
// actions/plans.ts の統合テスト
describe('createPlan', () => {
  it('スポットを最適化して時刻を計算してDBに保存', async () => {
    const mockSupabase = createMockSupabaseClient() // DB のみモック

    // optimizeRoute, calculateTime など内部ロジックは実装を使う
    const result = await createPlan(
      {
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        spots: [spot1, spot2, spot3],
      },
      mockSupabase
    )

    // 実際の最適化・時刻計算結果を検証
    expect(result.success).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('travel_plans')

    // 内部ロジックの動作も検証される
    const savedSpots = mockSupabase.insertedData.plan_spots
    expect(savedSpots[0].order_index).toBe(1)
    expect(savedSpots[0].arrival_time).toBeTruthy()
  })
})
```

#### ⚠️ モック過多の兆候

以下のような状況は、モックを使いすぎている可能性があります：

1. **テストファイルのモック定義が実装より長い**
2. **リファクタリングのたびにテストが壊れる**
3. **テストは通るのに本番でバグが発生する**
4. **モックの戻り値を調整するのに時間がかかる**

#### 💊 解決策

1. **純粋関数を増やす**: 副作用を分離し、モック不要なコードを増やす
2. **依存性注入**: 外部依存を引数で受け取る設計にする
3. **統合テストを増やす**: 細かいモックより、実際の連携をテスト
4. **E2Eテスト**: 重要フローは実際の環境でテスト

```typescript
// 改善例: 依存性注入でテストしやすく
// ❌ Before: Supabaseがハードコード
export async function createPlan(data: PlanData) {
  const supabase = createServerClient() // モック化が難しい
  // ...
}

// ✅ After: 依存を注入可能に
export async function createPlan(
  data: PlanData,
  supabase = createServerClient() // デフォルト引数
) {
  // テスト時はモックSupabaseを渡せる
  // 本番はデフォルトの実装を使う
}
```

## テスト実行コマンド

### 通常のテスト実行

```bash
# 全テスト実行
npm test

# 特定のファイルのみ
npm test optimizer.test.ts

# 監視モード
npm run test:watch

# カバレッジ付き
npm run test:coverage
```

### TDD開発時の推奨フロー

```bash
# ターミナル1: 監視モードでテスト実行（常に起動）
npm run test:watch

# ターミナル2: 実装作業
# ファイルを保存するたびに自動でテストが実行される
```

## カバレッジ目標

### 最低限の目標

- **ビジネスロジック**: 90%以上
- **Server Actions**: 80%以上
- **バリデーション**: 100%
- **ユーティリティ関数**: 80%以上

### カバレッジ確認

```bash
npm run test:coverage
```

```
File                       | % Stmts | % Branch | % Funcs | % Lines
---------------------------|---------|----------|---------|--------
lib/itinerary/optimizer.ts |   95.00 |    90.00 |  100.00 |   95.00
lib/schemas/plan.ts        |  100.00 |   100.00 |  100.00 |  100.00
actions/plans.ts           |   85.00 |    80.00 |   90.00 |   85.00
```

## CI/CD統合

### Pre-commit（Husky）

コミット前にテストを自動実行：

```json
// .husky/pre-commit
npm test
```

### Pre-push（Husky）

プッシュ前に全テスト+カバレッジチェック：

```json
// .husky/pre-push
npm run test:coverage
```

### GitHub Actions

PRマージ前にテストを実行：

```yaml
# .github/workflows/test.yml
name: Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
```

## トラブルシューティング

### テストが書きにくい場合

**原因**: 関数が複雑すぎる、依存が多すぎる

**解決策**:

1. 関数を小さく分割する
2. 依存を注入できるようにする（Dependency Injection）
3. 純粋関数にリファクタリングする

### モック化が難しい場合

**原因**: 外部依存が多い、タイトカップリング

**解決策**:

1. ラッパー関数を作成する
2. インターフェースを定義する
3. テスト用の環境変数を使う

## まとめ

### TDDのメリット

- **バグの早期発見**: 実装前にテストがあるため、バグが混入しにくい
- **リファクタリングの安全性**: テストがあることで安心してコード改善ができる
- **ドキュメントとしての役割**: テストが仕様書の役割を果たす
- **設計品質の向上**: テスタブルなコードは設計が良い

### TDDの注意点

- **すべてにTDDは不要**: UIなど、ビジュアル確認が必要なものは例外
- **完璧を目指さない**: 最初は簡単なテストから始める
- **テストのメンテナンスコスト**: 実装変更時にテストも更新が必要

### 推奨アプローチ

1. **ビジネスロジック・バリデーションは必ずTDD**
2. **UIコンポーネントは実装後にテスト**
3. **外部APIラッパーは実装後にモックテスト**
4. **継続的な改善**: カバレッジを徐々に上げていく

---

**参考リンク**:

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TDD by Example (Kent Beck)](https://www.amazon.co.jp/dp/4274217884)
