/**
 * LIFFアプリ用レイアウト
 * /liff配下のすべてのページで自動的にLIFF SDKを初期化
 */

import { LiffProvider } from './liff-provider'

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LiffProvider>{children}</LiffProvider>
}
