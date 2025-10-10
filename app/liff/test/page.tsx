/**
 * LIFF動作確認用テストページ
 * useAuth()フックと認証コンポーネントの動作確認
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { UserProfile } from '@/components/auth/user-profile'
import { LogoutButton } from '@/components/auth/logout-button'
import { liffClient } from '@/lib/liff/client'

export default function LiffTestPage() {
  const { user, isLoading, isInitialized } = useAuth()
  const environment = liffClient.getEnvironment()

  // 初期化中
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">認証情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            LIFF 動作確認
          </h1>
          <p className="text-sm text-gray-600">
            認証Context（useAuth）とUIコンポーネントの動作確認
          </p>
        </div>

        {/* 認証状態 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔐</span>
            認証状態
          </h2>
          <div className="space-y-4">
            <div className="flex items-start border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-700 w-32 flex-shrink-0">
                ステータス
              </dt>
              <dd className="flex-1">
                {isLoading && (
                  <span className="text-yellow-600">読み込み中...</span>
                )}
                {!isLoading && user && (
                  <span className="text-green-600 font-semibold">
                    ログイン済み
                  </span>
                )}
                {!isLoading && !user && (
                  <span className="text-red-600 font-semibold">未ログイン</span>
                )}
              </dd>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-700 w-32 flex-shrink-0">
                ユーザーID
              </dt>
              <dd className="flex-1 text-gray-900">{user?.id || '-'}</dd>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-700 w-32 flex-shrink-0">
                LINE User ID
              </dt>
              <dd className="flex-1 text-gray-900">
                {user?.line_user_id || '-'}
              </dd>
            </div>
          </div>
        </div>

        {/* ユーザープロフィール */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            ユーザープロフィール
          </h2>
          <UserProfile />
        </div>

        {/* 環境情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            環境情報
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <InfoItem
              label="実行環境"
              value={environment.isInClient ? 'LINEアプリ内' : '外部ブラウザ'}
              highlight={environment.isInClient}
            />
            <InfoItem label="OS" value={environment.os} />
            <InfoItem label="言語" value={environment.language} />
            <InfoItem label="SDKバージョン" value={environment.version} />
          </div>
        </div>

        {/* アクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            アクション
          </h2>
          <div className="space-y-3">
            <ActionButton
              onClick={() => {
                const token = liffClient.getAccessToken()
                alert(
                  token
                    ? `アクセストークン: ${token.substring(0, 20)}...`
                    : 'アクセストークンが取得できませんでした'
                )
              }}
              label="アクセストークン確認"
            />
            <ActionButton
              onClick={() => {
                const idToken = liffClient.getDecodedIDToken()
                alert(
                  idToken
                    ? `IDトークン:\n${JSON.stringify(idToken, null, 2)}`
                    : 'IDトークンが取得できませんでした'
                )
              }}
              label="IDトークン確認"
            />
            {environment.isInClient && (
              <>
                <ActionButton
                  onClick={async () => {
                    try {
                      await liffClient.sendMessages('LIFF動作確認テスト')
                      alert('メッセージを送信しました')
                    } catch {
                      alert('メッセージ送信に失敗しました')
                    }
                  }}
                  label="テストメッセージ送信"
                  variant="primary"
                />
                <ActionButton
                  onClick={() => {
                    if (confirm('LIFFアプリを閉じますか？')) {
                      liffClient.closeWindow()
                    }
                  }}
                  label="ウィンドウを閉じる"
                />
              </>
            )}
            <div className="pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>LIFF SDK v2.26.1 | tabiji | Auth Context統合版</p>
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start border-b border-gray-100 pb-2">
      <dt className="font-medium text-gray-700 w-32 flex-shrink-0">{label}</dt>
      <dd
        className={`flex-1 ${
          highlight ? 'text-blue-600 font-semibold' : 'text-gray-900'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function ActionButton({
  onClick,
  label,
  variant = 'default',
}: {
  onClick: () => void
  label: string
  variant?: 'default' | 'primary' | 'danger'
}) {
  const baseClasses =
    'w-full py-3 px-4 rounded-lg font-medium transition-colors'

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {label}
    </button>
  )
}
