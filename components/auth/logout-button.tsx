'use client'

import { useAuth } from '@/contexts/auth-context'
import { LogOut } from 'lucide-react'

/**
 * ログアウトボタンコンポーネント
 *
 * @example
 * ```tsx
 * <LogoutButton />
 * ```
 */
export function LogoutButton() {
  const { logout } = useAuth()

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      logout()
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
    >
      <LogOut className="h-4 w-4" />
      <span>ログアウト</span>
    </button>
  )
}
