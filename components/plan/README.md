# プラン関連コンポーネント

プラン作成・表示に関するコンポーネントを配置します。

## ディレクトリ構成

```
plan/
├── steps/              # プラン作成ステップコンポーネント
│   ├── date-input.tsx
│   ├── area-selection.tsx
│   └── spot-selection.tsx
├── tabs/               # 結果画面タブコンポーネント
│   ├── itinerary-tab.tsx
│   └── map-tab.tsx
├── step-indicator.tsx  # ステップインジケーター
├── step-navigation.tsx # ナビゲーションボタン
├── plan-card.tsx       # プランカード（一覧用）
├── spot-card.tsx       # スポットカード
└── ...
```

## 実装予定

- フェーズ3: ステップ関連コンポーネント
- フェーズ4: スポット選択コンポーネント
- フェーズ6: 結果画面コンポーネント
- フェーズ7: プラン一覧コンポーネント
