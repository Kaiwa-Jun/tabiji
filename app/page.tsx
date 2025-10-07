/**
 * LIFF トップページ
 * リダイレクト用または簡易メニュー表示
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LiffTopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // liff.stateパラメータがある場合は、そのパスにリダイレクト
    const liffState = searchParams.get('liff.state')
    if (liffState) {
      router.replace(liffState)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📱 tabiji
          </h1>
          <p className="text-sm text-gray-600">
            旅行計画・記録アプリ
          </p>
        </div>

        {/* メニュー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            メニュー
          </h2>
          <div className="space-y-3">
            <MenuLink
              href="/test"
              icon="🧪"
              title="動作確認"
              description="LIFF機能のテスト"
            />
            <MenuLink
              href="/plans"
              icon="📋"
              title="プラン一覧"
              description="作成した旅行プランを確認"
            />
            <MenuLink
              href="/plan/new"
              icon="➕"
              title="新しいプラン"
              description="旅行プランを作成"
            />
            <MenuLink
              href="/help"
              icon="❓"
              title="ヘルプ"
              description="使い方ガイド"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    </Link>
  )
}
