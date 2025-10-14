# スポット検索モーダル実装ガイド

## 📚 ドキュメント一覧

実装は以下の順序で進めてください。各Phaseは独立してテスト可能です。

### 基盤（Phase 1）

1. **[00-overview.md](./00-overview.md)** - 全体概要と設計
2. **[01-context.md](./01-context.md)** - SearchModalContext作成 🔴
3. **[02-search-bar-trigger.md](./02-search-bar-trigger.md)** - 検索バートリガー 🔴
4. **[03-modal-basic.md](./03-modal-basic.md)** - モーダル基本構造 🔴

### UI実装（Phase 2）

5. **[04-search-input.md](./04-search-input.md)** - 戻るボタン付き検索バー 🔴
6. **[05-area-selector.md](./05-area-selector.md)** - エリアセレクタ 🟡

### コンテンツ表示（Phase 3）

7. **[06-recommended-tab.md](./06-recommended-tab.md)** - おすすめタブ 🟡
8. **[07-history-tab.md](./07-history-tab.md)** - 履歴タブ 🟢

### 検索機能（Phase 4-6）

9. **[08-keyword-search.md](./08-keyword-search.md)** - キーワード検索 🔴
10. **[09-area-filter.md](./09-area-filter.md)** - エリア絞り込み 🟡
11. **[10-spot-selection.md](./10-spot-selection.md)** - スポット選択 🔴

## 🎯 優先度の説明

- 🔴 **高**: MVP（Minimum Viable Product）に必須の機能
- 🟡 **中**: UX向上に寄与するが、後回しにできる機能
- 🟢 **低**: Nice to have、余裕があれば実装

## 🚀 クイックスタート

### 最小限の実装（MVP）

MVP（最小限の動作するプロダクト）を実現するには、以下のPhaseのみ実装してください:

```
Phase 1-1 → 1-2 → 1-3 → 2-1 → 4 → 6
```

これで以下が動作します:

- ✅ 検索バーでモーダルを開く
- ✅ キーワードで検索
- ✅ スポットを追加
- ✅ モーダルを閉じる

### 推奨実装順序（Full）

すべての機能を実装する場合は、ドキュメント番号順に進めてください:

```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10
```

## 📋 実装チェックリスト

### Phase 1: 基盤

- [ ] Context作成（01）
- [ ] 検索バートリガー（02）
- [ ] モーダル基本構造（03）

### Phase 2: UI

- [ ] 検索バー（戻るボタン付き）（04）
- [ ] エリアセレクタ（05）

### Phase 3: 初期状態

- [ ] おすすめタブ（06）
- [ ] 履歴タブ（07）

### Phase 4-6: 検索・選択

- [ ] キーワード検索（08）
- [ ] エリア絞り込み（09）
- [ ] スポット選択（10）

## 🛠️ 開発環境セットアップ

### 必要な依存関係

```bash
# shadcn/ui コンポーネント
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add select
```

### 既存の前提条件

以下が既に実装されていることを前提としています:

- `PlanFormContext`: プラン作成フォームの状態管理
- `lib/constants/areas.ts`: 47都道府県の座標データ
- `lib/maps/places.ts`: Google Places API ラッパー
- `GoogleMapWrapper`: Google Map表示コンポーネント

## 📖 実装時の注意点

### 1. 状態管理

`SearchModalContext`が自動的に状態を計算します:

```typescript
const state = keyword ? 'searching' : selectedArea ? 'area-filtered' : 'initial'
```

明示的に状態を変更する必要はありません。

### 2. デバウンス

キーワード検索は300msのデバウンスが実装されています。ユーザーが入力を停止してから検索が実行されます。

### 3. Places API制限

検索結果は最大20件に制限されています（`limit: 20`）。必要に応じて調整してください。

### 4. LocalStorage

`PlanFormContext`が自動的にLocalStorageに保存します。追加実装は不要です。

## 🧪 テスト方法

各Phaseのドキュメントに「テスト項目」が記載されています。実装完了後、それらの項目を確認してください。

### ローカル開発サーバー

```bash
npm run dev
```

`http://localhost:3000/liff/plan/new` にアクセスし、Step3でテストできます。

## 🐛 トラブルシューティング

### モーダルが開かない

- `SearchModalProvider`で全体を包んでいるか確認
- `useSearchModal()`が正しくimportされているか確認

### 検索結果が表示されない

- Google Maps APIキーが設定されているか確認
- ブラウザのコンソールでAPIエラーを確認

### スポットが追加されない

- `PlanFormContext`の`addSpot`関数が正しく実装されているか確認
- `formData.spots`の型定義が正しいか確認

## 📚 関連ドキュメント

- [開発ガイド全体](../CLAUDE.md)
- [TDDガイドライン](../tdd-guidelines.md)
- [Maps API実装](../maps-api-integration.md)

## 🎨 デザインリファレンス

- [Figmaデザイン](#) ← 必要に応じて追加
- [shadcn/ui公式](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

**作成日**: 2025-10-15
**最終更新**: 2025-10-15
**メンテナー**: @Kaiwa-Jun
