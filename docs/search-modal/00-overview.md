# スポット検索モーダル設計 - 概要

## 全体概要

Step3（スポット選択画面）において、モバイル画面のスペースを最大限活用しつつ、検索・エリア選択・スポット表示を統合したモーダルUIを実装します。

## 設計の要点

- **検索バータップでモーダル表示**: 画面上部の検索バーをタップすると、フルスクリーンモーダルが開く
- **検索バーアイコンの変化**:
  - **マップUI（通常時）**: 🔍（Search）アイコンを表示
  - **モーダル内**: <（ChevronLeft）アイコンを表示
  - **<アイコンをタップ**: モーダルが閉じ、マップUIに戻る
- **常時表示要素**: モーダル内では検索バーとエリアセレクタが常に上部に固定表示
- **動的コンテンツ切り替え**: ユーザーの操作（キーワード入力/エリア変更）に応じて、下部のコンテンツが3パターンに切り替わる

## UI状態の定義

### 3つのモーダル状態

```typescript
/**
 * 検索モーダルの表示状態
 */
type SearchModalState =
  | 'initial' // 初期状態: おすすめ/履歴タブ
  | 'searching' // 検索中: キーワード検索結果
  | 'area-filtered' // エリア絞り込み: 人気スポット一覧

/**
 * モーダル全体のUIコンテキスト
 */
interface SearchModalContext {
  /** モーダルの開閉状態 */
  isOpen: boolean
  /** 現在の表示状態 */
  state: SearchModalState
  /** 検索キーワード */
  keyword: string
  /** 選択中のエリア（都道府県名、未選択の場合はnull） */
  selectedArea: string | null
  /** 検索結果のスポット配列 */
  searchResults: PlaceResult[]
  /** 人気スポット配列（エリア絞り込み時） */
  popularSpots: PlaceResult[]
}
```

### 状態遷移図

```text
[初期状態]
  ├─ キーワード入力 → [検索中]
  └─ エリア選択 → [エリア絞り込み]

[検索中]
  ├─ キーワードクリア → [初期状態]
  └─ エリア選択 → [検索中]（エリア×キーワードで再検索）

[エリア絞り込み]
  ├─ エリアリセット → [初期状態]
  └─ キーワード入力 → [検索中]（エリア×キーワードで再検索）
```

## 現在の実装状況

### 実装済み

#### Step2: エリア選択画面（`components/plan/steps/area-selection.tsx`）

- ✅ 地方・都道府県の2段階選択UI（shadcn/ui Select）
- ✅ 選択した都道府県に地図をズーム
- ✅ `PlanFormContext`でのstate管理（`region`, `prefecture`）
- ✅ 47都道府県の座標データ（`lib/constants/areas.ts`）

#### Step3: スポット選択画面（`components/plan/steps/spot-selection.tsx`）

- ✅ Google Map全画面表示
- ✅ 検索バーUI（現在はdisabled）
- ✅ 選択済みスポット数の表示エリア

#### Places API（`lib/maps/places.ts`）

- ✅ `searchPlacesByArea(area, options)`: エリア名から観光スポット検索
- ✅ `getPlaceDetails(placeId)`: スポット詳細情報取得

### 未実装

- ❌ 検索モーダルコンポーネント
- ❌ エリアセレクタ（モーダル内）
- ❌ おすすめスポット/検索履歴タブ
- ❌ キーワード検索結果表示
- ❌ エリア絞り込み時の人気スポット表示
- ❌ スポット選択・追加機能
- ❌ 検索履歴の保存・表示機能

## コンポーネント構成

### ファイル構造

```text
components/plan/steps/
├── spot-selection.tsx               # Step3親コンポーネント（地図表示）
└── spot-selection/                  # 検索モーダル関連コンポーネント
    ├── search-modal.tsx             # モーダル本体
    ├── search-bar.tsx               # 検索バー（常時表示）
    ├── area-selector.tsx            # エリア選択UI（常時表示）
    ├── recommended-tab.tsx          # おすすめタブ
    ├── history-tab.tsx              # 履歴タブ
    ├── search-results.tsx           # 検索結果一覧
    └── popular-spots.tsx            # 人気スポット一覧

contexts/
└── search-modal-context.tsx         # 検索モーダルの状態管理

hooks/
├── useSearchSpots.ts                # キーワード検索フック
└── usePopularSpots.ts               # 人気スポット取得フック

lib/queries/
└── spots.ts                         # スポット検索のクエリ関数（新規作成）
```

### コンポーネント階層

```text
<SpotSelectionStep>
  <GoogleMapWrapper />
  <SearchBarTrigger onClick={openModal} />  ← タップでモーダル表示

  <SearchModal isOpen={isOpen}>
    <SearchBar value={keyword} onChange={...} />
    <AreaSelector value={selectedArea} onChange={...} />

    {/* 状態に応じて動的に切り替え */}
    {state === 'initial' && (
      <Tabs>
        <RecommendedTab />
        <HistoryTab />
      </Tabs>
    )}

    {state === 'searching' && (
      <SearchResults spots={searchResults} />
    )}

    {state === 'area-filtered' && (
      <PopularSpots spots={popularSpots} />
    )}
  </SearchModal>
</SpotSelectionStep>
```

## 実装フロー

実装は以下の順序で進めます:

1. **[Phase 1-1: Context作成](./01-context.md)** - SearchModalContextの実装
2. **[Phase 1-2: 検索バートリガー](./02-search-bar-trigger.md)** - マップUI上の検索バー（トリガー）
3. **[Phase 1-3: モーダル基本構造](./03-modal-basic.md)** - shadcn/ui Dialogを使ったモーダル
4. **[Phase 2-1: 戻るボタン付き検索バー](./04-search-input.md)** - モーダル内検索バー（<アイコン付き）
5. **[Phase 2-2: エリアセレクタ](./05-area-selector.md)** - 都道府県選択UI
6. **[Phase 3-1: おすすめタブ](./06-recommended-tab.md)** - 初期状態のおすすめ表示
7. **[Phase 3-2: 履歴タブ](./07-history-tab.md)** - 検索履歴表示
8. **[Phase 4: キーワード検索](./08-keyword-search.md)** - Places API統合と検索結果表示
9. **[Phase 5: エリア絞り込み](./09-area-filter.md)** - 人気スポット表示
10. **[Phase 6: スポット選択](./10-spot-selection.md)** - PlanFormContext統合

## 非機能要件

### パフォーマンス

- **デバウンス処理**: キーワード検索は300msのデバウンス実装
- **Places API呼び出し制限**: 検索結果は最大20件に制限
- **画像の遅延ロード**: スポットの写真は必要に応じて読み込み

### アクセシビリティ

- **キーボード操作**: Tab/Enterキーでモーダル操作可能
- **フォーカス管理**: モーダル開閉時に適切なフォーカス移動
- **ARIA属性**: shadcn/uiコンポーネントが標準対応

### エラーハンドリング

- **Places API失敗**: エラー時は空配列を返し、UIでメッセージ表示
- **ネットワークエラー**: トースト通知で適切なエラーメッセージ
- **重複選択**: ユーザーにフィードバック（alert or toast）

---

**作成日**: 2025-10-15
**最終更新**: 2025-10-15
