/**
 * LIFFプロバイダーコンポーネント
 * LIFF初期化とローディング状態を管理
 */

'use client'

import { useEffect, useState } from 'react'
import { initializeLiff } from '@/lib/liff/init'

interface LiffProviderProps {
  children: React.ReactNode
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const result = await initializeLiff()

        if (result.success) {
          setIsInitialized(true)
        } else if (result.error) {
          setError(result.error)
        }
        // result.success === false かつ error がない場合はログインリダイレクト中
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    }

    init()
  }, [])

  // ローディング中
  if (!isInitialized && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">LIFF初期化中...</p>
        </div>
      </div>
    )
  }

  // エラー発生時
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">
            初期化エラー
          </h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  // 初期化完了
  return <>{children}</>
}
