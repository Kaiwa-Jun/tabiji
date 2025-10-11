'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

/**
 * ステップ5: 完了画面コンポーネント
 * プラン作成完了を通知し、次のアクションを案内するステップ
 */
export function CompletionStep() {
  return (
    <div className="space-y-6 text-center">
      {/* 完了アイコン */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
      </div>

      {/* メッセージ */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">🎉 プラン作成完了！</h2>
        <p className="mt-2 text-sm text-gray-600">
          旅行プランが作成されました
          <br />
          プラン一覧から確認できます
        </p>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        <Button asChild className="w-full bg-green-500 hover:bg-green-600" size="lg">
          <Link href="/liff/plans">プラン一覧を見る</Link>
        </Button>

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/liff">トップに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
