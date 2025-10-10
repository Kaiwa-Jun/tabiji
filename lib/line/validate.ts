import crypto from 'crypto'

/**
 * LINE Webhookの署名を検証
 *
 * LINE Platformから送信されるWebhookリクエストが正規のものかを検証します。
 * リクエストボディとチャネルシークレットからHMAC-SHA256ハッシュを生成し、
 * x-line-signatureヘッダーの値と比較します。
 *
 * @param body - リクエストボディ（文字列形式）
 * @param signature - x-line-signatureヘッダーの値
 * @param channelSecret - LINEチャネルのシークレット
 * @returns 署名が有効な場合true、無効な場合false
 *
 * @example
 * ```typescript
 * const body = await request.text()
 * const signature = request.headers.get('x-line-signature')
 * const isValid = validateSignature(body, signature, process.env.LINE_CHANNEL_SECRET)
 * ```
 *
 * @see https://developers.line.biz/ja/reference/messaging-api/#signature-validation
 */
export function validateSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  // チャネルシークレットまたは署名が空の場合は無効
  if (!channelSecret || !signature) {
    return false
  }

  try {
    // HMAC-SHA256でハッシュを生成
    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64')

    // 生成したハッシュと署名を比較
    return hash === signature
  } catch (error) {
    // ハッシュ生成エラーの場合は無効
    console.error('Signature validation error:', error)
    return false
  }
}
