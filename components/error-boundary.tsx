'use client'

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントでのエラーをキャッチして適切に処理
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>エラーが発生しました</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-red-700 mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            {this.state.error && (
              <details className="text-sm text-red-600">
                <summary className="cursor-pointer font-medium mb-2">
                  エラー詳細
                </summary>
                <pre className="whitespace-pre-wrap break-words bg-red-100 p-2 rounded">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
