/**
 * エラーハンドリングユーティリティ
 * 空のオブジェクトやfalsyな値を適切に処理する
 */

/**
 * エラー値が有効なエラーかどうかを判定
 * @param error - エラー値（string | null | object | undefined）
 * @returns 有効なエラーの場合true
 */
export function isValidError(error: unknown): error is string | Error | object {
  // null、undefined、falsyな値の場合はfalse
  if (!error || error === null || error === undefined) {
    return false
  }

  // 文字列の場合
  if (typeof error === 'string') {
    const trimmed = error.trim()
    // 空文字列または"{}"の場合はfalse
    return trimmed.length > 0 && trimmed !== '{}'
  }

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return true
  }

  // オブジェクトの場合、空でないか確認
  if (typeof error === 'object') {
    // 空のオブジェクトかどうかを確認（最優先チェック）
    try {
      const jsonString = JSON.stringify(error)
      // 空のオブジェクト`{}`の場合はfalse
      if (jsonString === '{}') {
        return false
      }
    } catch {
      // シリアライズできない場合は、通常のオブジェクトチェックにフォールバック
    }

    // キーが存在するか確認
    const keys = Object.keys(error)
    if (keys.length === 0) {
      return false
    }

    // すべてのプロパティ値をチェックし、有効な値が1つでもあるかを確認
    const errorObj = error as Record<string, unknown>
    for (const key of keys) {
      const value = errorObj[key]

      // 有効な値の条件:
      // 1. null、undefined、空文字列でない
      if (value === null || value === undefined || value === '') {
        continue
      }

      // 2. 空のオブジェクトでない
      if (typeof value === 'object' && !Array.isArray(value)) {
        try {
          if (JSON.stringify(value) === '{}') {
            continue
          }
        } catch {
          // シリアライズできない場合は有効とみなす
          return true
        }
      }

      // 3. 空配列でない
      if (Array.isArray(value) && value.length === 0) {
        continue
      }

      // 有効な値が見つかった
      return true
    }

    // すべてのプロパティが無効な値だった
    return false
  }

  return false
}

/**
 * エラー値を文字列に変換
 * @param error - エラー値
 * @returns エラーメッセージ文字列（空のオブジェクトの場合は空文字列）
 */
export function errorToString(error: unknown): string {
  if (!error || error === null || error === undefined) {
    return ''
  }

  if (typeof error === 'string') {
    const trimmed = error.trim()
    // 空文字列または"{}"の場合は空文字列を返す
    // より厳密なチェック: 元の文字列もチェック
    if (trimmed === '' || trimmed === '{}' || error === '{}') {
      return ''
    }
    return trimmed
  }

  if (error instanceof Error) {
    return error.message || 'エラーが発生しました'
  }

  if (typeof error === 'object') {
    // 空のオブジェクトかどうかを最初にチェック（最優先）
    try {
      const jsonString = JSON.stringify(error)
      // 空のオブジェクト`{}`の場合は空文字列を返す
      if (jsonString === '{}') {
        return ''
      }
    } catch {
      // シリアライズできない場合は通常の処理に進む
    }

    // Object.keysでも確認
    if (Object.keys(error).length === 0) {
      return ''
    }

    const errorObj = error as Record<string, unknown>

    // Supabaseエラーの場合、優先順位に従ってメッセージを取得
    // ただし、メッセージが`{}`の場合は空文字列を返す
    if (errorObj.message) {
      const message = String(errorObj.message).trim()
      if (message !== '' && message !== '{}') {
        return message
      }
    }
    if (errorObj.details) {
      const details = String(errorObj.details).trim()
      if (details !== '' && details !== '{}') {
        return details
      }
    }
    if (errorObj.hint) {
      const hint = String(errorObj.hint).trim()
      if (hint !== '' && hint !== '{}') {
        return hint
      }
    }
    if (errorObj.code) {
      const code = String(errorObj.code).trim()
      if (code !== '' && code !== '{}') {
        return `エラーコード: ${code}`
      }
    }

    // それ以外の場合はJSON文字列化を試みる
    try {
      const json = JSON.stringify(error)
      // 空のオブジェクト`{}`の場合は空文字列を返す
      if (json === '{}') {
        return ''
      }
      // 結果が`{}`という文字列の場合も空文字列を返す
      const trimmed = json.trim()
      if (trimmed === '{}' || trimmed === '"{}"') {
        return ''
      }
      // さらに、結果が`{}`という文字列を含む場合は空文字列を返す
      if (json === '{}' || json.trim() === '{}') {
        return ''
      }
      // 最終チェック: 結果が`{}`でないことを確認
      if (trimmed === '{}') {
        return ''
      }
      return json
    } catch {
      // シリアライズできない場合は空文字列を返す（エラーとして扱わない）
      return ''
    }
  }

  // その他の型の場合は文字列化を試みる
  const stringValue = String(error)
  // `{}`という文字列の場合は空文字列を返す
  // より厳密なチェック
  const trimmedStringValue = stringValue.trim()
  if (stringValue === '{}' || trimmedStringValue === '{}') {
    return ''
  }
  // 最終チェック: 結果が`{}`でないことを確認
  if (trimmedStringValue === '{}') {
    return ''
  }
  return stringValue
}
