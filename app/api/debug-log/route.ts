import { NextRequest, NextResponse } from 'next/server'

/**
 * 開発用デバッグログAPIエンドポイント
 * クライアント側からのログをサーバー側に表示するために使用
 * 本番環境では無効化することを推奨
 */
export async function POST(request: NextRequest) {
  // 開発環境でのみ動作
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { level = 'log', tag, message, data } = body

    // サーバー側のコンソールに出力
    const logMessage = `[${tag || 'DEBUG'}] ${message || ''}`
    
    switch (level) {
      case 'error':
        console.error(logMessage, data || '')
        break
      case 'warn':
        console.warn(logMessage, data || '')
        break
      default:
        console.log(logMessage, data || '')
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[debug-log] Error processing log:', error)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
