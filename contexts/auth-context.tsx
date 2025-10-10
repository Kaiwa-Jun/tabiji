'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { liffClient } from '@/lib/liff/client'
import { registerOrUpdateUser } from '@/actions/users'
import type { User } from '@/types/user'

/**
 * 認証Contextの型定義
 */
interface AuthContextType {
  /** 現在のユーザー情報（未ログインの場合はnull） */
  user: User | null
  /** データ読み込み中フラグ */
  isLoading: boolean
  /** 初期化完了フラグ */
  isInitialized: boolean
  /** ログアウト関数 */
  logout: () => void
  /** ユーザー情報を再取得する関数 */
  refetch: () => Promise<void>
}

/**
 * 認証Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 認証プロバイダーのProps
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * 認証プロバイダー
 * LIFFからユーザー情報を取得し、Supabaseに保存してContext経由で提供
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * ユーザー情報を取得してSupabaseに保存
   */
  const fetchUser = async () => {
    try {
      setIsLoading(true)
      console.log('[AuthContext] Fetching user profile...')

      // LIFFからユーザープロフィールを取得
      const profile = await liffClient.getProfile()
      console.log('[AuthContext] LIFF profile retrieved:', {
        userId: profile.userId,
        displayName: profile.displayName,
      })

      // Server Actionでユーザー登録/更新
      const { data, error } = await registerOrUpdateUser({
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      })

      if (error) {
        console.error('[AuthContext] User registration failed:', error)
        setUser(null)
        return
      }

      console.log('[AuthContext] User data saved to DB:', data?.id)
      setUser(data)
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }

  /**
   * ログアウト処理
   */
  const logout = () => {
    console.log('[AuthContext] Logging out...')
    setUser(null)
    liffClient.logout()
    // liffClient.logout()内でリダイレクトが実行される
  }

  /**
   * マウント時にユーザー情報を取得
   */
  useEffect(() => {
    fetchUser()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    logout,
    refetch: fetchUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * 認証Contextを使用するためのカスタムフック
 *
 * @throws AuthProviderの外で使用された場合にエラー
 * @returns 認証状態とログアウト関数
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, logout } = useAuth()
 *
 *   if (isLoading) return <div>読み込み中...</div>
 *   if (!user) return <div>未ログイン</div>
 *
 *   return <div>ようこそ、{user.display_name}さん</div>
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
