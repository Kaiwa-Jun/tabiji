/**
 * LIFFアプリ用レイアウト
 * /liff配下のすべてのページで自動的にLIFF SDKを初期化し、認証情報を提供
 */

import { LiffProvider } from './liff-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <LiffProvider>
        <AuthProvider>{children}</AuthProvider>
      </LiffProvider>
    </ErrorBoundary>
  )
}
