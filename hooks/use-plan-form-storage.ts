import { useEffect } from 'react'

/**
 * LocalStorageのキー定義
 */
const STORAGE_KEY = 'planFormData'

/**
 * プランフォームデータをLocalStorageに保存・復元するフック
 *
 * @template T - 保存するデータの型
 * @param data - 保存するデータ
 * @param enabled - LocalStorageへの保存を有効にするか（デフォルト: true）
 * @returns LocalStorage操作関数
 *
 * @example
 * ```tsx
 * const { restore, clear } = usePlanFormStorage(formData)
 *
 * // 復元
 * const savedData = restore()
 *
 * // クリア
 * clear()
 * ```
 */
export function usePlanFormStorage<T>(data: T, enabled = true) {
  /**
   * データをLocalStorageに保存
   * useEffectで自動的に実行される
   */
  useEffect(() => {
    if (!enabled) return

    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(STORAGE_KEY, serialized)
      console.log('[usePlanFormStorage] Data saved to localStorage')
    } catch (error) {
      console.error('[usePlanFormStorage] Failed to save to localStorage:', error)
      // QuotaExceededError（容量超過）やその他のエラーをキャッチ
      // ユーザー体験を損なわないため、エラーは握りつぶす
    }
  }, [data, enabled])

  /**
   * LocalStorageからデータを復元
   *
   * @returns 復元されたデータ、または復元失敗時はnull
   */
  function restore(): T | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        console.log('[usePlanFormStorage] No saved data found')
        return null
      }

      const parsed = JSON.parse(saved) as T
      console.log('[usePlanFormStorage] Data restored from localStorage')
      return parsed
    } catch (error) {
      console.error('[usePlanFormStorage] Failed to restore from localStorage:', error)
      // パースエラーなどをキャッチ
      // 破損したデータは無視してnullを返す
      return null
    }
  }

  /**
   * LocalStorageからデータを削除
   */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[usePlanFormStorage] Data cleared from localStorage')
    } catch (error) {
      console.error('[usePlanFormStorage] Failed to clear localStorage:', error)
    }
  }

  return { restore, clear }
}
