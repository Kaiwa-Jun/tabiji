# tabiji - 開発ガイド

このドキュメントは、Claude Code向けのtabijiプロジェクトの開発ガイドです。

## プロジェクト概要

**tabiji** - 旅行計画・記録アプリケーション

### 技術スタック

- **フレームワーク**: Next.js 15+ (App Router)
- **UIライブラリ**: React 19+
- **スタイリング**: Tailwind CSS 4+
- **UIコンポーネント**: Radix UI (shadcn/ui) + lucide-react
- **フォーム**: React Hook Form + Zod
- **アニメーション**: Framer Motion
- **テスト**: Jest + React Testing Library
- **リント**: ESLint
- **フォーマット**: Prettier
- **Git Hooks**: Husky + lint-staged

## 開発原則

### 基本方針

- **Server Component優先**: 初期データ取得はServer Componentで実装
- **Server Actions**: データ更新操作はServer Actionsで実装
- **useEffect使用禁止**: リアルタイム機能が必要な場合のみ例外的に使用可
- **型安全性**: TypeScript strictモードで開発
- **フォーム実装**: React Hook Form + Zodで型安全なバリデーション
- **UIコンポーネント**: shadcn/uiを基盤として再利用可能なコンポーネントを構築
- **コンポーネント分割**: 責任を明確にした小さいコンポーネント
- **再利用性**: 共通UIは`components/ui`に配置
- **テスト**: 重要な機能には必ずテストを追加

### ファイル構成

```text
tabiji/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── actions/               # Server Actions（データ更新処理）
├── components/            # Reactコンポーネント
│   ├── ui/               # 再利用可能なUIコンポーネント
│   └── [feature]/        # 機能別コンポーネント
├── lib/                  # ユーティリティ・ヘルパー関数
├── hooks/                # カスタムReactフック
├── types/                # TypeScript型定義
└── __tests__/            # テストファイル
```

## Server Actions

### 基本実装パターン

Server Actionsは`actions/`ディレクトリに機能別に配置します。

```typescript
// actions/users.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { userSchema } from '@/lib/schemas/user'

export async function createUser(formData: FormData) {
  // 1. データ検証
  const result = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  try {
    // 2. データベース操作
    const user = await createUserInDB(result.data)

    // 3. キャッシュの再検証
    revalidatePath('/users')

    // 4. リダイレクト（必要に応じて）
    redirect(`/users/${user.id}`)
  } catch (error) {
    return {
      success: false,
      message: 'ユーザーの作成に失敗しました',
    }
  }
}
```

### フォームでのServer Action使用

```typescript
'use client';
import { useFormState } from 'react-dom';
import { createUser } from '@/actions/users';

export function UserForm() {
  const [state, formAction] = useFormState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" placeholder="名前" />
      <input name="email" placeholder="メール" />
      {state?.errors?.name && (
        <p className="text-red-500">{state.errors.name[0]}</p>
      )}
      <button type="submit">作成</button>
    </form>
  );
}
```

## コーディング規約

### TypeScript

- **strictモード必須**: `any`型の使用は原則禁止
- **型定義**: 関数の引数・戻り値には必ず型を指定
- **インターフェース**: 再利用する型は`types/`に配置
- **型推論**: 明確な場合は型推論を活用

```typescript
// ✅ 良い例
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): User | null {
  // 実装
}

// ❌ 悪い例
function getUser(id: any): any {
  // 実装
}
```

### React コンポーネント

#### Server Component と Client Component の使い分け

**Server Component使用ケース:**

- データ取得（初期表示）
- 静的コンテンツ
- SEOが重要なコンテンツ

**Client Component使用ケース:**

- ユーザーインタラクション（クリック、入力）
- リアルタイム機能
- ブラウザAPI使用（localStorage等）
- React Hooks使用

```typescript
// ✅ 推奨: Server Component + Client Component分離パターン
// app/users/page.tsx
export default async function UsersPage() {
  const users = await getUsers(); // Server Componentでデータ取得
  return <UsersPageClient initialUsers={users} />;
}

// components/users/users-page-client.tsx
'use client';
export function UsersPageClient({ initialUsers }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const refetch = () => {
    router.refresh(); // Server Componentのデータを再取得
  };

  // フィルタリング、ソート等のクライアント側処理
}
```

#### データ再取得パターン

```typescript
'use client'
import { useRouter } from 'next/navigation'

export function DataComponent({ initialData }) {
  const router = useRouter()

  const handleUpdate = async () => {
    // Server Actionでデータ更新
    await updateData()
    // Server Componentのデータを再取得
    router.refresh()
  }
}
```

#### コンポーネント設計

- **単一責任の原則**: 1つのコンポーネントは1つの責務のみ
- **Propsの型定義**: interfaceで明示的に定義
- **デフォルト値**: 適切にデフォルト値を設定

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### スタイリング

- **Tailwind CSS**: ユーティリティクラスを優先
- **カスタムCSS**: 必要な場合のみモジュールCSSを使用
- **レスポンシブ**: モバイルファーストで設計

```typescript
// ✅ 推奨
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-8 md:p-8">
  <h1 className="text-2xl font-bold md:text-4xl">タイトル</h1>
</div>
```

### 命名規約

- **コンポーネント**: PascalCase（例: `UserProfile.tsx`）
- **関数**: camelCase（例: `getUserData`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_ITEMS`）
- **型/インターフェース**: PascalCase（例: `UserData`）
- **ファイル名**: kebab-case（例: `user-profile.tsx`）

## フォーム実装

### React Hook Form + Zod

フォーム実装はReact Hook FormとZodを組み合わせて型安全に実装します。

#### バリデーションスキーマ定義

```typescript
// lib/schemas/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),

  email: z.string().email('有効なメールアドレスを入力してください'),

  age: z
    .number()
    .min(0, '年齢は0以上で入力してください')
    .max(150, '年齢は150以下で入力してください')
    .optional(),
})

export type UserFormSchema = z.infer<typeof userSchema>
```

#### フォームコンポーネント実装

```typescript
// components/forms/user-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormSchema } from '@/lib/schemas/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface UserFormProps {
  onSubmit: (data: UserFormSchema) => Promise<void>;
  initialData?: Partial<UserFormSchema>;
}

export function UserForm({ onSubmit, initialData }: UserFormProps) {
  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      ...initialData,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前 *</FormLabel>
              <FormControl>
                <Input placeholder="山田太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '送信中...' : '送信'}
        </Button>
      </form>
    </Form>
  );
}
```

### shadcn/ui活用

shadcn/uiコンポーネントを基盤として、プロジェクト固有のコンポーネントを構築します。

#### 基本コンポーネント

```bash
# shadcn/uiコンポーネントの追加
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add card
```

#### カスタムコンポーネント例

```typescript
// components/ui/status-badge.tsx
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
  className?: string;
}

const statusConfig = {
  active: {
    label: '有効',
    className: 'bg-green-100 text-green-800',
  },
  inactive: {
    label: '無効',
    className: 'bg-gray-100 text-gray-800',
  },
  pending: {
    label: '保留中',
    className: 'bg-yellow-100 text-yellow-800',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
```

## テスト

### テスト戦略

- **ユニットテスト**: 重要なロジック・関数
- **コンポーネントテスト**: UIコンポーネントの振る舞い
- **テストファイル配置**: `__tests__`ディレクトリ内

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('クリックイベントが正しく動作する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);

    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Git運用

### ブランチ戦略

- **main**: 本番環境
- **develop**: 開発環境（デフォルトブランチ）
- **feature/xxx**: 機能開発
- **fix/xxx**: バグ修正

### コミット

- **pre-commit**: リント + フォーマット自動実行
- **pre-push**: テスト + 型チェック + ビルド実行
- **コミットメッセージ**: 簡潔で分かりやすく（日本語OK）

```bash
# 良い例
git commit -m "ユーザープロフィール画面を追加"
git commit -m "ボタンコンポーネントのバグを修正"
```

### PR作成

`/deploy`コマンドを使用すると自動的にコミット・プッシュ・PR作成を実行します。

## 開発コマンド

### 基本コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リント
npm run lint

# テスト実行
npm run test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# 型チェック
npm run type-check
```

## カスタムフック

### フィルタリング・ソート用フック

```typescript
// hooks/useDataFilters.ts
import { useState, useMemo } from 'react'

interface UseDataFiltersProps<T> {
  data: T[]
  searchFields: (keyof T)[]
}

export function useDataFilters<T>({ data, searchFields }: UseDataFiltersProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof T | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredData = useMemo(() => {
    let filtered = data

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // ソート
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [data, searchTerm, searchFields, sortField, sortOrder])

  const handleSort = (field: keyof T) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    handleSort,
    filteredData,
  }
}
```

## エラーハンドリング

### 基本方針

- **ユーザーフレンドリーなメッセージ**: 技術的な詳細は隠す
- **適切なログ出力**: エラー内容をコンソールに記録
- **フォールバック**: エラー時の代替表示を用意

```typescript
try {
  const data = await fetchData();
  return <DataView data={data} />;
} catch (error) {
  console.error('データ取得エラー:', error);
  return <ErrorMessage message="データの取得に失敗しました" />;
}
```

## パフォーマンス

### 最適化のポイント

- **動的インポート**: 大きなコンポーネントは遅延読み込み
- **画像最適化**: Next.jsの`Image`コンポーネントを使用
- **メモ化**: 重い計算は`useMemo`でメモ化
- **コールバック最適化**: `useCallback`で再生成を防ぐ

```typescript
// 動的インポート
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'))

// メモ化
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// コールバック最適化
const handleClick = useCallback(() => {
  // 処理
}, [dependency])
```

## アクセシビリティ

### 基本事項

- **セマンティックHTML**: 適切なHTML要素を使用
- **キーボード操作**: 全ての機能をキーボードで操作可能に
- **ARIAラベル**: 必要に応じてaria属性を追加
- **カラーコントラスト**: 十分なコントラスト比を確保

```typescript
// ✅ 良い例
<button
  type="button"
  aria-label="メニューを開く"
  onClick={handleOpen}
>
  <MenuIcon />
</button>

// ❌ 悪い例
<div onClick={handleOpen}>
  <MenuIcon />
</div>
```

## セキュリティ

### 基本方針

- **入力値検証**: ユーザー入力は必ず検証
- **XSS対策**: HTMLのエスケープ処理
- **環境変数**: 秘匿情報は環境変数で管理
- **依存関係**: 定期的なセキュリティアップデート

## その他のルール

### コードレビュー

- **1ファイル200行以内**: 長すぎる場合は分割を検討
- **関数は50行以内**: 複雑な処理は分割
- **コメント**: 「なぜ」を書く（「何を」は書かない）

### 禁止事項

- ❌ `any`型の使用（型推論できない場合のみ例外）
- ❌ `useEffect`でのデータフェッチ（Server Componentを使用）
- ❌ Client Componentでの初期データ取得（Server Componentから渡す）
- ❌ コンソールログの残置（開発時のみ使用）
- ❌ ハードコーディング（設定は定数化）
- ❌ 未使用のインポート・変数

### ファイル分割・ディレクトリ設計

**基本指針:**

- ページファイル（page.tsx）は100〜200行を目安に分割
- 1ファイル1責任の原則を守る
- 機能別・ドメイン別にディレクトリを整理

**分割例:**

```text
components/
├── ui/                          # 共通UIコンポーネント
│   ├── button.tsx
│   └── input.tsx
└── users/                       # ユーザー機能
    ├── users-table.tsx         # テーブル表示
    ├── users-filters.tsx       # 検索・フィルター
    └── user-form.tsx           # フォーム

lib/
└── users-utils.ts              # 業務ロジック・データ整形

hooks/
└── useUsersFilters.ts          # フィルター・ソート状態管理
```

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**重要**: このガイドラインは継続的に更新されます。プロジェクトの成長に合わせて適宜見直してください。
