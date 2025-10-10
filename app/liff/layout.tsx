/**
 * LIFFアプリ用レイアウト
 * /liff配下のすべてのページで自動的にLIFF SDKを初期化し、認証情報を提供
 */

import { LiffProvider } from './liff-provider'
import { AuthProvider } from '@/contexts/auth-context'

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LiffProvider>
      <AuthProvider>{children}</AuthProvider>
    </LiffProvider>
  )
}
