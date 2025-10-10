'use client'

import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'

/**
 * ユーザープロフィール表示コンポーネント
 *
 * @example
 * ```tsx
 * <UserProfile />
 * ```
 */
export function UserProfile() {
  const { user, isLoading } = useAuth()

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  // 未ログイン
  if (!user) {
    return (
      <div className="text-sm text-gray-500">
        ログインしていません
      </div>
    )
  }

  // ログイン済み
  return (
    <div className="flex items-center gap-3">
      {user.picture_url ? (
        <Image
          src={user.picture_url}
          alt={user.display_name || 'User'}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600">
          <span className="text-sm font-medium">
            {user.display_name?.charAt(0) || '?'}
          </span>
        </div>
      )}
      <div>
        <div className="font-medium text-gray-900">
          {user.display_name || '名前なし'}
        </div>
        <div className="text-xs text-gray-500">
          {user.line_user_id}
        </div>
      </div>
    </div>
  )
}
