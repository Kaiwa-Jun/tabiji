/**
 * LIFF デバッグ情報ページ
 * 環境情報、LIFF状態、エラー情報を全て表示してデバッグを支援
 */

'use client'

import { useEffect, useState } from 'react'
import { liffClient } from '@/lib/liff/client'
import { getLiffVersion } from '@/lib/liff/init'
import type { LiffUserProfile, LiffEnvironment } from '@/lib/liff/types'

interface DebugInfo {
  // 環境変数
  env: {
    liffId: string | undefined
    forceLiffMode: string | undefined
    nodeEnv: string | undefined
  }
  // ブラウザ情報
  browser: {
    userAgent: string
    language: string
    platform: string
    cookieEnabled: boolean
    onLine: boolean
  }
  // URL情報
  url: {
    href: string
    origin: string
    pathname: string
    search: string
    hash: string
    params: Record<string, string>
    referrer: string
  }
  // LIFF情報
  liff: {
    isLoggedIn: boolean
    isInClient: boolean
    version: string
    accessToken: string | null
    profile: LiffUserProfile | null
    environment: LiffEnvironment | null
    idToken: Record<string, unknown> | null
  }
  // LocalStorage
  localStorage: {
    liffAccessed: string | null
    itemCount: number
    keys: string[]
  }
  // 現在時刻
  timestamp: string
}

export default function LiffDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const collectDebugInfo = async () => {
      try {
        // URLパラメータを解析
        const params = new URLSearchParams(window.location.search)
        const paramsObj: Record<string, string> = {}
        params.forEach((value, key) => {
          paramsObj[key] = value
        })

        // LocalStorage情報を収集
        const localStorageInfo = {
          liffAccessed: null as string | null,
          itemCount: 0,
          keys: [] as string[],
        }
        try {
          localStorageInfo.liffAccessed = localStorage.getItem('_tabiji_liff_accessed')
          localStorageInfo.itemCount = localStorage.length
          localStorageInfo.keys = Object.keys(localStorage)
        } catch {
          console.warn('LocalStorage access failed')
        }

        // LIFF情報を収集
        let profile: LiffUserProfile | null = null
        let environment: LiffEnvironment | null = null
        let accessToken: string | null = null
        let idToken: Record<string, unknown> | null = null

        try {
          profile = await liffClient.getProfile()
        } catch (e) {
          console.warn('Profile fetch failed:', e)
        }

        try {
          environment = liffClient.getEnvironment()
        } catch (e) {
          console.warn('Environment fetch failed:', e)
        }

        try {
          accessToken = liffClient.getAccessToken()
        } catch (e) {
          console.warn('Access token fetch failed:', e)
        }

        try {
          idToken = liffClient.getDecodedIDToken()
        } catch (e) {
          console.warn('ID token fetch failed:', e)
        }

        const info: DebugInfo = {
          env: {
            liffId: process.env.NEXT_PUBLIC_LIFF_ID,
            forceLiffMode: process.env.NEXT_PUBLIC_FORCE_LIFF_MODE,
            nodeEnv: process.env.NODE_ENV,
          },
          browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
          },
          url: {
            href: window.location.href,
            origin: window.location.origin,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            params: paramsObj,
            referrer: document.referrer,
          },
          liff: {
            isLoggedIn: liffClient.isLoggedIn(),
            isInClient: liffClient.isInClient(),
            version: getLiffVersion(),
            accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
            profile,
            environment,
            idToken: idToken
              ? {
                  sub: idToken.sub,
                  name: idToken.name,
                  picture: idToken.picture,
                  iss: idToken.iss,
                  aud: idToken.aud,
                  exp: idToken.exp,
                  iat: idToken.iat,
                }
              : null,
          },
          localStorage: localStorageInfo,
          timestamp: new Date().toISOString(),
        }

        setDebugInfo(info)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    collectDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">デバッグ情報を収集中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">エラー</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🔍 LIFF デバッグ情報</h1>
          <p className="text-sm text-gray-600">
            LIFF統合のデバッグに必要な情報を全て表示します
          </p>
          <p className="text-xs text-gray-500 mt-2">
            取得日時: {debugInfo?.timestamp}
          </p>
        </div>

        {/* 環境変数 */}
        <DebugSection title="📦 環境変数" icon="📦">
          <DebugItem label="NEXT_PUBLIC_LIFF_ID" value={debugInfo?.env.liffId} />
          <DebugItem
            label="NEXT_PUBLIC_FORCE_LIFF_MODE"
            value={debugInfo?.env.forceLiffMode || '(未設定)'}
          />
          <DebugItem label="NODE_ENV" value={debugInfo?.env.nodeEnv} />
        </DebugSection>

        {/* URL情報 */}
        <DebugSection title="🌐 URL情報" icon="🌐">
          <DebugItem label="URL" value={debugInfo?.url.href} mono />
          <DebugItem label="Origin" value={debugInfo?.url.origin} mono />
          <DebugItem label="Pathname" value={debugInfo?.url.pathname} mono />
          <DebugItem label="Search" value={debugInfo?.url.search || '(なし)'} mono />
          <DebugItem label="Hash" value={debugInfo?.url.hash || '(なし)'} mono />
          <DebugItem label="Referrer" value={debugInfo?.url.referrer || '(なし)'} mono />
          {debugInfo?.url.params && Object.keys(debugInfo.url.params).length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">URLパラメータ:</p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo.url.params, null, 2)}
              </pre>
            </div>
          )}
        </DebugSection>

        {/* ブラウザ情報 */}
        <DebugSection title="💻 ブラウザ情報" icon="💻">
          <DebugItem label="User Agent" value={debugInfo?.browser.userAgent} mono small />
          <DebugItem label="Language" value={debugInfo?.browser.language} />
          <DebugItem label="Platform" value={debugInfo?.browser.platform} />
          <DebugItem
            label="Cookie有効"
            value={debugInfo?.browser.cookieEnabled ? 'はい' : 'いいえ'}
          />
          <DebugItem label="オンライン" value={debugInfo?.browser.onLine ? 'はい' : 'いいえ'} />
        </DebugSection>

        {/* LIFF情報 */}
        <DebugSection title="📱 LIFF SDK 状態" icon="📱">
          <DebugItem
            label="ログイン状態"
            value={debugInfo?.liff.isLoggedIn ? 'ログイン済み ✅' : '未ログイン ❌'}
            highlight={debugInfo?.liff.isLoggedIn}
          />
          <DebugItem
            label="実行環境"
            value={
              debugInfo?.liff.isInClient ? 'LINEアプリ内 📱' : '外部ブラウザ 🌐'
            }
            highlight={debugInfo?.liff.isInClient}
          />
          <DebugItem label="SDKバージョン" value={debugInfo?.liff.version} />
          <DebugItem
            label="アクセストークン"
            value={debugInfo?.liff.accessToken || '(取得できず)'}
            mono
          />

          {debugInfo?.liff.profile && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-3">👤 ユーザープロフィール:</p>
              <div className="space-y-2">
                <DebugItem label="表示名" value={debugInfo.liff.profile.displayName} />
                <DebugItem label="ユーザーID" value={debugInfo.liff.profile.userId} mono small />
                {debugInfo.liff.profile.statusMessage && (
                  <DebugItem label="ステータス" value={debugInfo.liff.profile.statusMessage} />
                )}
                {debugInfo.liff.profile.pictureUrl && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-32">プロフィール画像:</span>
                    <img
                      src={debugInfo.liff.profile.pictureUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-blue-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {debugInfo?.liff.environment && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">環境詳細:</p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo.liff.environment, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo?.liff.idToken && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">IDトークン (JWT):</p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo.liff.idToken, null, 2)}
              </pre>
            </div>
          )}
        </DebugSection>

        {/* LocalStorage */}
        <DebugSection title="💾 LocalStorage" icon="💾">
          <DebugItem
            label="_tabiji_liff_accessed"
            value={debugInfo?.localStorage.liffAccessed || '(未設定)'}
          />
          <DebugItem
            label="保存アイテム数"
            value={debugInfo?.localStorage.itemCount?.toString() || '0'}
          />
          {debugInfo?.localStorage.keys && debugInfo.localStorage.keys.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">保存されているキー:</p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {debugInfo.localStorage.keys.join('\n')}
              </pre>
            </div>
          )}
        </DebugSection>

        {/* アクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎯 アクション</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                alert('デバッグ情報をクリップボードにコピーしました')
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              📋 デバッグ情報をコピー
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              🔄 再読み込み
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('_tabiji_liff_accessed')
                  alert('LIFFアクセスフラグをクリアしました')
                  window.location.reload()
                } catch {
                  alert('LocalStorageのクリアに失敗しました')
                }
              }}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition-colors"
            >
              🗑️ LIFFキャッシュをクリア
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>このページをスクリーンショットで保存しておくとデバッグに役立ちます</p>
        </div>
      </div>
    </div>
  )
}

function DebugSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function DebugItem({
  label,
  value,
  mono = false,
  small = false,
  highlight = false,
}: {
  label: string
  value: string | undefined
  mono?: boolean
  small?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-start border-b border-gray-100 pb-2">
      <dt className="font-medium text-gray-700 w-40 flex-shrink-0 text-sm">{label}</dt>
      <dd
        className={`flex-1 break-all ${
          mono ? 'font-mono' : ''
        } ${
          small ? 'text-xs' : 'text-sm'
        } ${
          highlight ? 'text-blue-600 font-semibold' : 'text-gray-900'
        }`}
      >
        {value || '(なし)'}
      </dd>
    </div>
  )
}
