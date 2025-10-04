# 技術スタック

## フロントエンド

### **React / Next.js**
- App Router ベースで構築
- LIFF アプリの UI を実装

### **UI ライブラリ**
- **Tailwind CSS**：ユーティリティファーストでスタイリング
- **shadcn/ui**：基本的な UI コンポーネント（ボタン、カード、モーダル等）
- **framer-motion**：アニメーションやトランジション

## バックエンド

### **Next.js API Routes**
- Bot の Webhook 処理
- LIFF アプリからの API 呼び出し
- SSR や Server Actions も活用可能

### **Supabase**
- データベース（PostgreSQL）
- 認証（必要に応じて）
- ストレージ（画像など）
- Edge Functions（必要になれば Bot 補助用に利用可能）

## ホスティング

### **Vercel**
- フロントエンド（Next.js）とバックエンド（API Routes）を一元管理
- Bot の Webhook エンドポイントもデプロイ

### **Supabase**
- データベースおよび補助的なサーバー処理

## 外部 API

### **Google Maps API**
- **Places API**：スポット検索
- **Maps JavaScript API**：地図表示
- **Directions API**：経路情報（MVP では徒歩モードのみ）

### **LINE Messaging API**
- Bot の実装
- Flex Message の送信
- リッチメニューの設定

### **LINE Login / LIFF**
- ユーザー認証
- LIFF アプリの実装

## 開発ツール

### **パッケージマネージャー**
- pnpm（高速で効率的な依存関係管理）

### **コード品質**
- ESLint（コード規約）
- Prettier（フォーマッター）
- TypeScript（型安全性）

### **テスト**
- Jest（ユニットテスト）
- React Testing Library（コンポーネントテスト）
- Playwright（E2E テスト）※将来的に導入

## 実装方針

### **MVP 段階**
- Vercel（Next.js）＋Supabase のハイブリッド構成でシンプルに始める
- Bot と LIFF アプリを同じコードベースで管理し、開発体験を重視

### **将来的な拡張**
- 複雑な Bot 処理やスケジューリングが必要になれば Supabase Edge Functions を活用
- データベース連携やユーザー認証は段階的に導入

## 環境変数

以下の環境変数が必要です：

```env
# LINE
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
LIFF_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Vercel
VERCEL_URL=
```

## ディレクトリ構成

```
tabiji/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── webhook/       # LINE Bot Webhook
│   ├── liff/              # LIFF アプリ
│   └── page.tsx           # ランディングページ
├── components/            # 共通コンポーネント
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabase クライアント
│   ├── line/             # LINE API ラッパー
│   └── maps/             # Google Maps ラッパー
├── hooks/                 # カスタムフック
├── types/                 # TypeScript 型定義
└── docs/                  # ドキュメント
```