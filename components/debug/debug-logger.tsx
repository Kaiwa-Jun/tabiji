'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface LogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

/**
 * 画面上にデバッグログを表示するコンポーネント
 * スマホでのデバッグ用
 */
export function DebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // console.logをインターセプトしてログを保存
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      originalLog(...args)
      const message = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ')
      const data = args.find((arg) => typeof arg === 'object')

      // 特定のログのみキャプチャ（検索関連）
      if (
        message.includes('[useSearchSpots]') ||
        message.includes('[searchSpotsByKeyword]') ||
        message.includes('[searchPlacesByArea]') ||
        message.includes('[EndpointInput]')
      ) {
        setLogs((prev) => [
          ...prev.slice(-19), // 最新20件を保持
          {
            timestamp: new Date(),
            level: 'info',
            message,
            data,
          },
        ])
      }
    }

    console.warn = (...args) => {
      originalWarn(...args)
      const message = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ')
      const data = args.find((arg) => typeof arg === 'object')

      setLogs((prev) => [
        ...prev.slice(-19),
        {
          timestamp: new Date(),
          level: 'warn',
          message,
          data,
        },
      ])
    }

    console.error = (...args) => {
      originalError(...args)
      const message = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ')
      const data = args.find((arg) => typeof arg === 'object')

      setLogs((prev) => [
        ...prev.slice(-19),
        {
          timestamp: new Date(),
          level: 'error',
          message,
          data,
        },
      ])
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  /**
   * ログをテキスト形式でクリップボードにコピー
   */
  const handleCopy = async () => {
    try {
      // ログをテキスト形式に変換
      const text = logs
        .map((log) => {
          const timestamp = log.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          const dataText = log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''
          return `[${timestamp}] ${log.message}${dataText}`
        })
        .join('\n\n---\n\n')

      // クリップボードにコピー
      await navigator.clipboard.writeText(text)

      // コピー成功のフィードバック
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error)
      alert('コピーに失敗しました')
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-500 px-4 py-2 text-xs text-white shadow-lg"
      >
        デバッグログを表示
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-lg border border-gray-300 bg-white shadow-2xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 hover:bg-gray-200"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
          <span className="text-sm font-medium">
            デバッグログ ({logs.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={logs.length === 0}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
            title="ログをコピー"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-green-600">コピー済み</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>コピー</span>
              </>
            )}
          </button>
          <button
            onClick={() => setLogs([])}
            className="rounded px-2 py-1 text-xs hover:bg-gray-200"
          >
            クリア
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="rounded p-1 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ログ一覧 */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto p-2">
          {logs.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-500">
              ログはまだありません
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`rounded border p-2 text-xs ${
                    log.level === 'error'
                      ? 'border-red-200 bg-red-50'
                      : log.level === 'warn'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 font-mono">
                      <div className="font-semibold">{log.message}</div>
                      {log.data && (
                        <pre className="mt-1 whitespace-pre-wrap break-all text-[10px]">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-[10px] text-gray-500">
                      {log.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
