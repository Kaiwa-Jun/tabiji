# issue #22: LIFF SDK統合 実装プラン

**作成日**: 2025年10月6日
**対象Issue**: [#22 LIFF SDK統合（初期化・ラッパー）](https://github.com/Kaiwa-Jun/tabiji/issues/22)
**前提条件**: issue #21完了（LINEログインチャンネル作成、LIFF ID取得済み）

---

## 📋 概要

### 目的

LIFF SDK（LINE Front-end Framework SDK）をNext.js 15アプリケーションに統合し、LINE内でWebアプリを動作させる基盤を構築します。

### 背景

issue #21で以下の設定が完了しています：
- LINEログインチャンネル「tabiji-liff」作成（2019年以降の新方式）
- LIFFアプリ「tabiji-app」登録
- LIFF ID: `2008239543-7vLMjwjj`
- 環境変数設定完了（`NEXT_PUBLIC_LIFF_ID`）

この基盤の上に、LIFF SDKをNext.jsに統合し、LINEユーザー情報の取得やLIFFアプリ固有の機能を使用可能にします。

### 主要な技術的判断

#### 1. LIFF SDKバージョン: v2.26.1（最新安定版）
- **理由**: 最新のバグ修正とTypeScript型定義を含む
- **メリット**: Pluggable SDK機能によるファイルサイズ削減（最大34%）

#### 2. Client Component必須
- **理由**: LIFFはブラウザAPIに依存（`window`, `navigator`等）
- **対応**: `'use client'`ディレクティブを使用

#### 3. 外部ブラウザ対応
- **設定**: `withLoginOnExternalBrowser: true`
- **理由**: 開発時（ローカル）でもテスト可能にする

---

## 📁 ファイル構成

### 作成するファイル

```
lib/
├── liff/
│   ├── init.ts              # LIFF初期化ロジック
│   ├── client.ts            # LIFFクライアントラッパー
│   └── types.ts             # LIFF関連の型定義
│
app/
├── liff/
│   └── layout.tsx           # LIFF用レイアウト（初期化）
│
__tests__/
└── lib/
    └── liff/
        ├── init.test.ts     # init.tsのテスト
        └── client.test.ts   # client.tsのテスト
```

### 修正するファイル

- `package.json` - LIFF SDK依存関係追加
- `.gitignore` - 必要に応じて（既存で問題なければ不要）

---

## 🚀 実装手順

### ステップ1: LIFF SDK インストール

**目的**: プロジェクトにLIFF SDKを導入する

**実装内容**:

```bash
npm install @line/liff@2.26.1
```

**注意点**:
- バージョンを明示的に指定（`@2.26.1`）することで、予期しないアップデートを防ぐ
- `package.json`の`dependencies`セクションに追加される

**テスト**:
```bash
# インストール確認
npm list @line/liff
# 期待される出力: @line/liff@2.26.1
```

**所要時間**: 1〜2分

---

### ステップ2: LIFF型定義ファイル作成

**目的**: プロジェクト全体で使用するLIFF関連の型を定義する

**実装内容**: `lib/liff/types.ts`

```typescript
/**
 * LIFF関連の型定義
 */

/**
 * LIFFユーザープロフィール
 */
export interface LiffUserProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

/**
 * LIFF初期化設定
 */
export interface LiffInitConfig {
  liffId: string
  withLoginOnExternalBrowser?: boolean
}

/**
 * LIFF初期化結果
 */
export interface LiffInitResult {
  success: boolean
  error?: Error
}

/**
 * LIFF環境情報
 */
export interface LiffEnvironment {
  isInClient: boolean  // LINEアプリ内で動作しているか
  os: string          // OS種別（ios, android, web）
  language: string    // 言語設定
  version: string     // LIFF SDKバージョン
}
```

**注意点**:
- LIFF SDKの型と完全に一致させる必要はなく、tabijiで使用する情報のみを定義
- オプショナル（`?`）な項目は適切に設定

**テスト**:
- 型定義ファイルのため、TypeScriptコンパイラによる型チェックで確認
- 実際の使用は次のステップで検証

**所要時間**: 5〜10分

---

### ステップ3: LIFF初期化処理実装

**目的**: LIFF SDKを初期化し、LINEログイン状態を確認する

**実装内容**: `lib/liff/init.ts`

```typescript
import liff from '@line/liff'
import type { LiffInitConfig, LiffInitResult } from './types'

/**
 * LIFF SDKを初期化する
 *
 * @param config - LIFF初期化設定（省略時は環境変数から取得）
 * @returns 初期化結果
 *
 * @example
 * ```typescript
 * const result = await initializeLiff()
 * if (result.success) {
 *   console.log('LIFF初期化成功')
 * }
 * ```
 */
export async function initializeLiff(
  config?: LiffInitConfig
): Promise<LiffInitResult> {
  try {
    // 環境変数からLIFF IDを取得
    const liffId = config?.liffId || process.env.NEXT_PUBLIC_LIFF_ID

    if (!liffId) {
      throw new Error('LIFF ID is not defined. Please set NEXT_PUBLIC_LIFF_ID in .env.local')
    }

    // LIFF初期化
    // withLoginOnExternalBrowser: 外部ブラウザで自動ログインを有効化
    await liff.init({
      liffId,
      withLoginOnExternalBrowser: config?.withLoginOnExternalBrowser ?? true,
    })

    // ログイン状態確認
    if (!liff.isLoggedIn()) {
      // 未ログインの場合はLINEログイン画面へリダイレクト
      liff.login()
      // login()後はページがリダイレクトされるため、ここには戻ってこない
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('LIFF initialization failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * LIFFが初期化済みかチェックする
 *
 * @returns 初期化済みの場合true
 */
export function isLiffInitialized(): boolean {
  try {
    // liff.isLoggedIn()を呼び出せれば初期化済み
    return liff.isLoggedIn()
  } catch {
    return false
  }
}
```

**注意点**:

1. **環境変数の取得**:
   - `NEXT_PUBLIC_LIFF_ID`はクライアント側で使用できる環境変数
   - 未設定の場合は明確なエラーメッセージを表示

2. **外部ブラウザ対応**:
   - `withLoginOnExternalBrowser: true`により、PCブラウザでも開発可能
   - LINEアプリ外でもLINEログインが自動実行される

3. **エラーハンドリング**:
   - 初期化失敗時は`success: false`と`error`を返す
   - `liff.login()`はリダイレクトのため、その後の処理は実行されない

4. **非同期処理**:
   - `liff.init()`はPromiseを返すため、必ず`await`する

**テスト**: `__tests__/lib/liff/init.test.ts`

```typescript
import { initializeLiff, isLiffInitialized } from '@/lib/liff/init'

// LIFFモックは次のステップで実装
jest.mock('@line/liff')

describe('lib/liff/init', () => {
  describe('initializeLiff', () => {
    it('環境変数が未設定の場合、エラーを返す', async () => {
      // 環境変数をクリア
      delete process.env.NEXT_PUBLIC_LIFF_ID

      const result = await initializeLiff()

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('LIFF ID is not defined')
    })

    it('LIFF IDが渡された場合、初期化が成功する', async () => {
      const result = await initializeLiff({ liffId: 'test-liff-id' })

      expect(result.success).toBe(true)
    })
  })

  describe('isLiffInitialized', () => {
    it('初期化済みの場合、trueを返す', () => {
      expect(isLiffInitialized()).toBe(true)
    })
  })
})
```

**所要時間**: 20〜30分

---

### ステップ4: LIFFクライアントラッパー実装

**目的**: LIFF SDKの機能を型安全でtabiji向けにカスタマイズしたAPIとして提供する

**実装内容**: `lib/liff/client.ts`

```typescript
import liff from '@line/liff'
import type { LiffUserProfile, LiffEnvironment } from './types'

/**
 * LIFFクライアントラッパー
 *
 * LIFF SDKの主要機能を型安全にラップし、
 * tabijiプロジェクトで使いやすいAPIを提供します。
 *
 * @example
 * ```typescript
 * const profile = await liffClient.getUserProfile()
 * console.log(profile.displayName)
 * ```
 */
export class LiffClient {
  /**
   * ユーザープロフィール情報を取得
   *
   * @returns ユーザープロフィール
   * @throws ログインしていない場合はエラー
   */
  async getUserProfile(): Promise<LiffUserProfile> {
    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in')
    }

    const profile = await liff.getProfile()

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    }
  }

  /**
   * LIFFアプリを閉じる
   *
   * LINEアプリ内でのみ動作します。
   * 外部ブラウザでは何も起こりません。
   */
  closeWindow(): void {
    if (liff.isInClient()) {
      liff.closeWindow()
    } else {
      console.warn('closeWindow() is only available in LINE app')
    }
  }

  /**
   * ログアウトする
   *
   * LIFFからログアウトし、ページをリロードします。
   */
  logout(): void {
    liff.logout()
    window.location.reload()
  }

  /**
   * LINEアプリ内で動作しているかチェック
   *
   * @returns LINEアプリ内の場合true
   */
  isInClient(): boolean {
    return liff.isInClient()
  }

  /**
   * ログイン状態を確認
   *
   * @returns ログイン済みの場合true
   */
  isLoggedIn(): boolean {
    return liff.isLoggedIn()
  }

  /**
   * LIFF環境情報を取得
   *
   * @returns LIFF環境情報
   */
  getEnvironment(): LiffEnvironment {
    return {
      isInClient: liff.isInClient(),
      os: liff.getOS(),
      language: liff.getLanguage(),
      version: liff.getVersion(),
    }
  }

  /**
   * アクセストークンを取得
   *
   * @returns アクセストークン
   * @throws ログインしていない場合はエラー
   */
  getAccessToken(): string {
    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in')
    }

    return liff.getAccessToken()
  }

  /**
   * IDトークンを取得
   *
   * @returns IDトークン
   * @throws ログインしていない場合はエラー
   */
  getIDToken(): string | null {
    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in')
    }

    return liff.getIDToken()
  }
}

/**
 * LIFFクライアントのシングルトンインスタンス
 *
 * プロジェクト全体で同一のインスタンスを使用します。
 */
export const liffClient = new LiffClient()
```

**注意点**:

1. **シングルトンパターン**:
   - `liffClient`インスタンスをエクスポートし、プロジェクト全体で共有
   - 複数のインスタンスを作成する必要がないため

2. **エラーハンドリング**:
   - ログインが必要なメソッドは、未ログイン時にエラーをスロー
   - 呼び出し側で適切にハンドリングする

3. **LINEアプリ内/外の判定**:
   - `isInClient()`で判定し、LINE固有機能は警告を出す
   - 外部ブラウザでのエラーを防ぐ

4. **型安全性**:
   - LIFF SDKの返り値を、tabijiの型定義に変換
   - 必要な情報のみを公開

**テスト**: `__tests__/lib/liff/client.test.ts`

```typescript
import { LiffClient, liffClient } from '@/lib/liff/client'
import liff from '@line/liff'

jest.mock('@line/liff')

describe('lib/liff/client', () => {
  let client: LiffClient

  beforeEach(() => {
    client = new LiffClient()
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('ログイン済みの場合、プロフィールを返す', async () => {
      ;(liff.isLoggedIn as jest.Mock).mockReturnValue(true)
      ;(liff.getProfile as jest.Mock).mockResolvedValue({
        userId: 'U1234567890',
        displayName: 'テストユーザー',
        pictureUrl: 'https://example.com/picture.jpg',
        statusMessage: 'こんにちは',
      })

      const profile = await client.getUserProfile()

      expect(profile.userId).toBe('U1234567890')
      expect(profile.displayName).toBe('テストユーザー')
    })

    it('未ログインの場合、エラーをスローする', async () => {
      ;(liff.isLoggedIn as jest.Mock).mockReturnValue(false)

      await expect(client.getUserProfile()).rejects.toThrow('User is not logged in')
    })
  })

  describe('isInClient', () => {
    it('LINEアプリ内の場合、trueを返す', () => {
      ;(liff.isInClient as jest.Mock).mockReturnValue(true)

      expect(client.isInClient()).toBe(true)
    })

    it('外部ブラウザの場合、falseを返す', () => {
      ;(liff.isInClient as jest.Mock).mockReturnValue(false)

      expect(client.isInClient()).toBe(false)
    })
  })

  describe('getEnvironment', () => {
    it('LIFF環境情報を返す', () => {
      ;(liff.isInClient as jest.Mock).mockReturnValue(true)
      ;(liff.getOS as jest.Mock).mockReturnValue('ios')
      ;(liff.getLanguage as jest.Mock).mockReturnValue('ja')
      ;(liff.getVersion as jest.Mock).mockReturnValue('2.26.1')

      const env = client.getEnvironment()

      expect(env.isInClient).toBe(true)
      expect(env.os).toBe('ios')
      expect(env.language).toBe('ja')
      expect(env.version).toBe('2.26.1')
    })
  })
})
```

**所要時間**: 30〜40分

---

### ステップ5: LIFFレイアウト実装

**目的**: `/liff/*`配下のページで自動的にLIFFを初期化する

**実装内容**: `app/liff/layout.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { initializeLiff } from '@/lib/liff/init'

/**
 * LIFFアプリ用レイアウト
 *
 * このレイアウトは`/liff/*`配下のすべてのページに適用され、
 * 自動的にLIFF SDKを初期化します。
 *
 * @param children - 子コンポーネント
 */
export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLiffReady, setIsLiffReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // LIFF初期化
    initializeLiff()
      .then((result) => {
        if (result.success) {
          setIsLiffReady(true)
        } else if (result.error) {
          setError(result.error)
        }
      })
      .catch((err) => {
        setError(err)
      })
  }, [])

  // エラー画面
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-red-50 p-6 text-center">
          <h1 className="mb-2 text-xl font-bold text-red-600">
            初期化エラー
          </h1>
          <p className="text-sm text-red-700">
            LIFFアプリの初期化に失敗しました。
          </p>
          <p className="mt-4 text-xs text-red-600">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  // ローディング画面
  if (!isLiffReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-500" />
          <p className="text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // LIFF初期化完了後、子コンポーネントを表示
  return <>{children}</>
}
```

**注意点**:

1. **`'use client'`ディレクティブ必須**:
   - LIFF SDKはブラウザAPIを使用するため、Client Componentとして実装
   - `useEffect`はClient Componentでのみ使用可能

2. **useEffectの例外的使用**:
   - tabijiの開発方針では`useEffect`使用禁止だが、LIFF初期化は例外
   - 理由: ブラウザ環境でのみ実行可能な処理のため

3. **ローディング状態の管理**:
   - `isLiffReady`で初期化完了を追跡
   - 初期化中はローディング画面を表示
   - エラー時は分かりやすいエラー画面を表示

4. **エラーハンドリング**:
   - 初期化失敗時はユーザーにわかりやすいメッセージを表示
   - デバッグ用にエラーメッセージも表示

**テスト**: 統合テストで確認（後述）

**所要時間**: 20〜30分

---

### ステップ6: テスト環境セットアップ

**目的**: LIFF SDKのモックを作成し、テストを実行可能にする

**実装内容**: `__tests__/__mocks__/@line/liff.ts`

```typescript
/**
 * LIFF SDK モック
 *
 * テスト環境でLIFF SDKの動作をシミュレートします。
 */

const mockLiff = {
  init: jest.fn().mockResolvedValue(undefined),
  login: jest.fn(),
  logout: jest.fn(),
  isLoggedIn: jest.fn().mockReturnValue(true),
  isInClient: jest.fn().mockReturnValue(false),
  getProfile: jest.fn().mockResolvedValue({
    userId: 'U1234567890',
    displayName: 'Mock User',
    pictureUrl: 'https://example.com/mock.jpg',
    statusMessage: 'Mock Status',
  }),
  getAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  getIDToken: jest.fn().mockReturnValue('mock-id-token'),
  getOS: jest.fn().mockReturnValue('web'),
  getLanguage: jest.fn().mockReturnValue('ja'),
  getVersion: jest.fn().mockReturnValue('2.26.1'),
  closeWindow: jest.fn(),
}

export default mockLiff
```

**注意点**:
- すべてのLIFF APIをモック化
- テストごとに`jest.clearAllMocks()`でリセット

**テスト**:
```bash
npm test
```

**所要時間**: 15〜20分

---

### ステップ7: 環境変数の確認

**目的**: LIFF IDが正しく設定されていることを確認する

**実装内容**:

`.env.local`が以下の内容を含むことを確認:

```env
NEXT_PUBLIC_LIFF_ID=2008239543-7vLMjwjj
```

**注意点**:
- `NEXT_PUBLIC_`プレフィックスが必須（クライアント側で使用）
- `.env.example`には含めない（セキュリティのため）

**テスト**:
```bash
# 環境変数確認
grep "^NEXT_PUBLIC_LIFF_ID=" .env.local
# 期待される出力: NEXT_PUBLIC_LIFF_ID=2008239543-7vLMjwjj
```

**所要時間**: 2〜3分

---

## 🔍 技術的考慮事項

### 1. Next.js 15とLIFFの互換性

#### Server Component vs Client Component

| コンポーネント | 使用可否 | 理由 |
|---------------|---------|------|
| **Server Component** | ❌ 不可 | LIFF SDKはブラウザAPIに依存 |
| **Client Component** | ✅ 可能 | `'use client'`で明示的に指定 |

**実装パターン**:
```typescript
// ❌ 不可: Server Component
export default async function Page() {
  const profile = await liff.getProfile() // エラー！
}

// ✅ 可能: Client Component
'use client'
export default function Page() {
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    liff.getProfile().then(setProfile)
  }, [])
}
```

### 2. 外部ブラウザ vs LINEアプリ内

#### 動作環境の違い

| 機能 | LINEアプリ内 | 外部ブラウザ |
|-----|------------|------------|
| **ユーザー情報取得** | ✅ 自動 | ✅ ログイン後可能 |
| **`liff.closeWindow()`** | ✅ 動作 | ❌ 何もしない |
| **`liff.sendMessages()`** | ✅ 動作 | ❌ エラー |

**実装での対応**:
```typescript
// LINEアプリ内のみで動作する機能
if (liff.isInClient()) {
  liff.closeWindow()
} else {
  console.warn('This feature is only available in LINE app')
}
```

### 3. TypeScript型安全性

#### LIFF SDKの型定義

LIFF SDK v2.26.1にはTypeScript型定義が含まれていますが、tabijiプロジェクト固有の型を定義することで：
- より厳密な型チェック
- プロジェクト固有の情報のみを公開
- 将来的な拡張性

**実装例**:
```typescript
// LIFF SDKの型をそのまま使用（冗長）
const profile: Profile = await liff.getProfile()

// tabijiの型を使用（シンプル）
const profile: LiffUserProfile = await liffClient.getUserProfile()
```

### 4. エラーハンドリング戦略

#### エラーの種類と対応

| エラー種別 | 原因 | 対応 |
|-----------|------|------|
| **初期化失敗** | LIFF ID未設定 | エラー画面表示 |
| **ログイン失敗** | ユーザーがキャンセル | LINEログイン画面へリダイレクト |
| **API呼び出し失敗** | ネットワークエラー | リトライまたはエラー通知 |

**実装での対応**:
```typescript
try {
  const result = await initializeLiff()
  if (!result.success) {
    // エラー画面を表示
    setError(result.error)
  }
} catch (error) {
  // 予期しないエラー
  console.error('Unexpected error:', error)
}
```

---

## 🧪 テスト戦略

### 1. ユニットテスト

**対象**:
- `lib/liff/init.ts`
- `lib/liff/client.ts`

**テストケース**:
- 正常系: 初期化成功、プロフィール取得成功
- 異常系: 環境変数未設定、未ログイン、ネットワークエラー
- エッジケース: 複数回の初期化、ログアウト後の操作

**実行方法**:
```bash
npm test -- lib/liff
```

### 2. 統合テスト

**対象**:
- `app/liff/layout.tsx`
- LIFF初期化フロー全体

**テストケース**:
- ローディング表示 → 初期化完了 → 子コンポーネント表示
- エラー時のエラー画面表示

**実行方法**:
```bash
npm test -- app/liff
```

### 3. 手動テスト（E2E）

**手順**:
1. ローカル環境でLIFFアプリを起動
2. LIFF URLにアクセス
3. ユーザー情報取得を確認

詳細は「デバッグ・動作確認方法」セクション参照。

---

## 🛠️ デバッグ・動作確認方法

### 方法1: liff-cli使用（推奨）

LINE公式のLIFF開発CLIツールを使用します。

#### セットアップ

```bash
# liff-cliインストール
npm install -g @line/liff-cli

# LIFF環境変数設定（必要に応じて）
export LINE_CHANNEL_ACCESS_TOKEN=<your_channel_access_token>
```

#### ローカルサーバー起動

```bash
# ターミナル1: Next.js開発サーバー起動
npm run dev

# ターミナル2: LIFF CLIプロキシ起動
liff-cli serve \
  --liff-id 2008239543-7vLMjwjj \
  --url http://localhost:3000/liff/plans
```

#### アクセス

1. LIFF CLIが表示するHTTPS URLをコピー
2. スマホのLINEアプリでURLを開く
3. またはPCブラウザでアクセス（外部ブラウザモード）

### 方法2: ngrok使用

HTTPSトンネリングツールを使用します。

#### セットアップ

```bash
# ngrokインストール（Homebrew）
brew install ngrok

# または公式サイトからダウンロード
# https://ngrok.com/download
```

#### ローカルサーバー公開

```bash
# ターミナル1: Next.js開発サーバー起動
npm run dev

# ターミナル2: ngrok起動
ngrok http 3000
```

#### LIFF Endpoint URL更新

1. LINE Developers Consoleを開く
2. LINEログインチャンネル「tabiji-liff」→ LIFF → 「tabiji-app」を選択
3. エンドポイントURLをngrokのHTTPS URLに変更
   - 例: `https://abcd1234.ngrok.io/liff/plans`
4. 保存

#### アクセス

LIFF URLをスマホのLINEアプリで開く:
```
https://liff.line.me/2008239543-7vLMjwjj
```

### 方法3: Vercelプレビューデプロイ（本番に近い環境）

#### デプロイ

```bash
# コミット
git add .
git commit -m "feat: implement LIFF SDK integration"

# プッシュ
git push origin feature/issue22

# VercelでプレビューURLが自動生成される
```

#### LIFF Endpoint URL更新

プレビューURLをLIFFのエンドポイントURLに設定します。

### デバッグのヒント

#### Chrome DevTools（Android）

1. AndroidスマホとPCをUSB接続
2. Chrome DevToolsで`chrome://inspect`を開く
3. LIFFアプリを選択してデバッグ

#### Safari Web Inspector（iOS）

1. iPhoneとMacをUSB接続
2. SafariのDevelopメニューからiPhoneを選択
3. LIFFアプリを選択してデバッグ

#### console.logの活用

```typescript
// LIFF環境情報をログ出力
useEffect(() => {
  if (liff.isLoggedIn()) {
    console.log('LIFF Environment:', {
      isInClient: liff.isInClient(),
      os: liff.getOS(),
      version: liff.getVersion(),
    })
  }
}, [])
```

---

## ✅ 完了条件チェックリスト

### コード実装

- [ ] `@line/liff@2.26.1`がインストールされている
- [ ] `lib/liff/types.ts`が実装されている
- [ ] `lib/liff/init.ts`が実装されている
- [ ] `lib/liff/client.ts`が実装されている
- [ ] `app/liff/layout.tsx`が実装されている
- [ ] LIFFモック（`__tests__/__mocks__/@line/liff.ts`）が作成されている

### テスト

- [ ] `lib/liff/init.ts`のユニットテストが実装され、すべてパスする
- [ ] `lib/liff/client.ts`のユニットテストが実装され、すべてパスする
- [ ] `npm test`がすべて成功する

### 動作確認

- [ ] ローカル環境でLIFFアプリが起動する
- [ ] LIFFブラウザ（またはngrok）でアクセスできる
- [ ] LIFF初期化が成功する（ローディング → 初期化完了）
- [ ] `liff.getProfile()`でユーザー情報が取得できる
- [ ] エラー時にエラー画面が表示される

### ドキュメント

- [ ] このREADME（`docs/implementation-plan-issue22.md`）が完成している
- [ ] 各ファイルにTSDocコメントが記載されている

---

## ⚠️ リスクと対応策

### リスク1: 外部ブラウザでのテストが困難

**問題**:
- LIFFアプリは基本的にLINEアプリ内で動作
- 開発時にスマホでのテストが必要

**対応策**:
- `withLoginOnExternalBrowser: true`で外部ブラウザでも動作可能に
- liff-cliまたはngrokを使用してローカル環境をHTTPS化
- LIFF Mock使用でユニットテストを充実

### リスク2: 環境変数の設定ミス

**問題**:
- `NEXT_PUBLIC_LIFF_ID`が未設定または誤っている
- クライアント側で環境変数が読み込めない

**対応策**:
- 初期化時に環境変数チェックを実施
- エラーメッセージで具体的な原因を表示
- `.env.example`に設定例を記載

### リスク3: LIFF SDKのバージョンアップによる破壊的変更

**問題**:
- 将来のバージョンアップでAPIが変更される可能性

**対応策**:
- `package.json`でバージョンを固定（`@2.26.1`）
- ラッパークラス（`LiffClient`）で変更の影響を局所化
- リリースノートを定期的に確認

### リスク4: TypeScript型定義の不一致

**問題**:
- LIFF SDKの型定義とtabijiの型定義が不一致

**対応策**:
- tabijiの型定義を独自に定義（`lib/liff/types.ts`）
- 型変換ロジックを`LiffClient`内に集約
- TypeScriptコンパイラの厳格な型チェックを有効化

---

## 📝 次のステップ（issue #23以降）

issue #22完了後、以下の機能を実装します：

### issue #23: LINE認証機能（ログイン・ログアウト・Context）
- Supabaseとの連携
- LINE User IDをSupabaseユーザーと紐付け
- ログイン/ログアウトフロー

### issue #24: LIFFプラン作成画面（UI）
- プラン作成フォーム実装
- LIFFレイアウトの活用

---

## 🎯 まとめ

### 実装の全体像

```
[LIFF SDK]
    ↓
[lib/liff/init.ts] ← LIFF初期化
    ↓
[lib/liff/client.ts] ← APIラッパー
    ↓
[app/liff/layout.tsx] ← 自動初期化
    ↓
[/liff/plans 等] ← 実際のLIFFページ
```

### 所要時間の目安

| ステップ | 内容 | 所要時間 |
|---------|------|---------|
| ステップ1 | SDK インストール | 1〜2分 |
| ステップ2 | 型定義作成 | 5〜10分 |
| ステップ3 | 初期化処理 | 20〜30分 |
| ステップ4 | クライアントラッパー | 30〜40分 |
| ステップ5 | レイアウト実装 | 20〜30分 |
| ステップ6 | テスト環境 | 15〜20分 |
| ステップ7 | 環境変数確認 | 2〜3分 |
| **合計** | | **約2〜2.5時間** |

### キーポイント

1. **Client Component必須**: LIFF SDKはブラウザAPIに依存
2. **外部ブラウザ対応**: 開発時のテストを容易にするため`withLoginOnExternalBrowser: true`
3. **型安全性**: tabijiプロジェクト固有の型定義で厳密な型チェック
4. **エラーハンドリング**: 初期化失敗時は明確なエラー画面を表示
5. **テスト**: モックを活用したユニットテストで品質を担保

---

**作成者**: Claude
**レビュー**: [未実施]
**最終更新**: 2025年10月6日
