/**
 * 開発用デバッグログユーティリティ
 * クライアント側のログをサーバー側（Next.js開発サーバー）に表示するために使用
 */

type LogLevel = 'log' | 'warn' | 'error'

interface LogOptions {
  level?: LogLevel
  tag?: string
  data?: unknown
}

/**
 * サーバー側にログを送信
 * 開発環境でのみ動作し、本番環境では何もしない
 */
async function sendLogToServer(
  message: string,
  options: LogOptions = {}
): Promise<void> {
  // 開発環境でのみ動作
  if (process.env.NODE_ENV === 'production') {
    return
  }

  try {
    await fetch('/api/debug-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: options.level || 'log',
        tag: options.tag,
        message,
        data: options.data,
      }),
    })
  } catch (error) {
    // エラーが発生しても無視（サーバーにログが送れない場合でも動作を止めない）
    // console.error('[debug-logger] Failed to send log:', error)
  }
}

/**
 * ログを出力（ブラウザコンソール + サーバー側）
 */
export function debugLog(message: string, options: LogOptions = {}): void {
  const { tag, data } = options
  
  // ブラウザコンソールにも出力（開発時に便利）
  const logMessage = tag ? `[${tag}] ${message}` : message
  if (options.level === 'error') {
    console.error(logMessage, data || '')
  } else if (options.level === 'warn') {
    console.warn(logMessage, data || '')
  } else {
    console.log(logMessage, data || '')
  }

  // サーバー側にも送信
  sendLogToServer(message, options).catch(() => {
    // エラーは無視
  })
}
