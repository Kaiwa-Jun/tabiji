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

// 開発モード判定: LIFF URLからのアクセスかどうか
const isLiffMode = () => {
  if (typeof window === 'undefined') return false

  // 環境変数で強制モード切り替え（デバッグ用）
  if (process.env.NEXT_PUBLIC_FORCE_LIFF_MODE === 'true') {
    console.log('[LIFF Mode] 強制的にLIFFモードを有効化（NEXT_PUBLIC_FORCE_LIFF_MODE=true）')
    return true
  }
  if (process.env.NEXT_PUBLIC_FORCE_LIFF_MODE === 'false') {
    console.log('[LIFF Mode] 強制的にLIFFモードを無効化（NEXT_PUBLIC_FORCE_LIFF_MODE=false）')
    return false
  }

  // URLパラメータに liff.state または code があればLIFFモード
  const params = new URLSearchParams(window.location.search)
  if (params.has('liff.state') || params.has('code') || params.has('liffClientId')) {
    console.log('[LIFF Mode] URLパラメータによりLIFFモードを検出:', Array.from(params.keys()))
    return true
  }

  // Referrerチェック（LINEから来た場合）
  if (document.referrer && (document.referrer.includes('line.me') || document.referrer.includes('liff.line.me'))) {
    console.log('[LIFF Mode] ReferrerによりLIFFモードを検出:', document.referrer)
    // LocalStorageにフラグを保存（リロード時も維持）
    try {
      localStorage.setItem('_tabiji_liff_accessed', 'true')
    } catch (e) {
      console.warn('[LIFF Mode] LocalStorage保存失敗:', e)
    }
    return true
  }

  // ngrok/cloudflare経由でのアクセスをチェック
  if (document.referrer && (document.referrer.includes('ngrok-free.dev') || document.referrer.includes('ngrok.io'))) {
    console.log('[LIFF Mode] ngrok経由でのアクセスを検出:', document.referrer)
    try {
      localStorage.setItem('_tabiji_liff_accessed', 'true')
    } catch (e) {
      console.warn('[LIFF Mode] LocalStorage保存失敗:', e)
    }
    return true
  }

  // LocalStorageにLIFFアクセスフラグがある場合
  try {
    if (localStorage.getItem('_tabiji_liff_accessed') === 'true') {
      console.log('[LIFF Mode] LocalStorageのフラグによりLIFFモードを検出')
      return true
    }
  } catch (e) {
    console.warn('[LIFF Mode] LocalStorage読み取り失敗:', e)
  }

  console.log('[LIFF Mode] 開発モード（LIFF初期化をスキップ）')
  return false
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [skipInit, setSkipInit] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // デバッグログを追加する関数
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const log = `[${timestamp}] ${message}`
    console.log(log)
    setDebugInfo((prev) => [...prev, log])
  }

  useEffect(() => {
    // デバッグ情報を収集
    addDebugLog('=== LIFF Provider 初期化開始 ===')
    addDebugLog(`URL: ${window.location.href}`)
    addDebugLog(`Referrer: ${document.referrer || '(なし)'}`)
    addDebugLog(`User Agent: ${navigator.userAgent}`)
    addDebugLog(`LIFF ID: ${process.env.NEXT_PUBLIC_LIFF_ID || 'NOT SET'}`)
    addDebugLog(`FORCE_LIFF_MODE: ${process.env.NEXT_PUBLIC_FORCE_LIFF_MODE || '(未設定)'}`)

    const urlParams = new URLSearchParams(window.location.search)
    addDebugLog(`URLパラメータ: ${urlParams.toString() || '(なし)'}`)

    // 開発モード（localhost:3000から直接アクセス）の場合は初期化をスキップ
    const liffModeResult = isLiffMode()
    addDebugLog(`isLiffMode結果: ${liffModeResult}`)

    if (!liffModeResult) {
      addDebugLog('[LIFF Provider] 開発モード: LIFF初期化をスキップします')
      setSkipInit(true)
      setIsInitialized(true)
      return
    }

    // LIFFモードの場合は初期化を実行
    const init = async () => {
      try {
        addDebugLog('[LIFF Provider] LIFFモード: 初期化を開始します')
        const result = await initializeLiff()

        if (result.success) {
          addDebugLog('[LIFF Provider] 初期化成功!')
          setIsInitialized(true)
        } else if (result.error) {
          addDebugLog(`[LIFF Provider] 初期化エラー: ${result.error.message}`)
          setError(result.error)
        } else {
          addDebugLog('[LIFF Provider] ログインリダイレクト中...')
        }
        // result.success === false かつ error がない場合はログインリダイレクト中
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        addDebugLog(`[LIFF Provider] 予期しないエラー: ${errorMessage}`)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    }

    init()
  }, [])

  // ローディング中（LIFFモードのみ）
  if (!isInitialized && !error && !skipInit) {
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
        <div className="max-w-2xl w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">
            LIFF 初期化エラー
          </h2>
          <p className="text-red-700 mb-4">{error.message}</p>

          {/* デバッグ情報の表示 */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-red-800 hover:text-red-900 select-none">
              🔍 デバッグ情報を表示（クリックで展開）
            </summary>
            <div className="mt-3 bg-red-100 rounded p-3 max-h-96 overflow-auto">
              <pre className="text-xs font-mono text-red-900 whitespace-pre-wrap break-all">
                {debugInfo.join('\n')}
              </pre>
            </div>
          </details>

          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              🔄 再読み込み
            </button>
            <button
              onClick={() => {
                // LocalStorageのLIFFフラグをクリア
                try {
                  localStorage.removeItem('_tabiji_liff_accessed')
                } catch {
                  // LocalStorageアクセスに失敗しても続行
                }
                window.location.reload()
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors text-sm"
            >
              🗑️ キャッシュをクリアして再読み込み
            </button>
          </div>

          <div className="mt-4 text-xs text-red-700 bg-red-100 p-3 rounded">
            <p className="font-semibold mb-1">💡 トラブルシューティング:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>スマホのLINEアプリで画面を3回タップしてLIFF Inspectorを開く</li>
              <li>上記のデバッグ情報をスクリーンショットで保存</li>
              <li>/liff/debug ページで詳細な環境情報を確認</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // 初期化完了
  return <>{children}</>
}
