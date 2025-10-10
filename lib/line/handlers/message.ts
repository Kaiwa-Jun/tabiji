import type { MessageEvent, TextMessage } from '@line/bot-sdk'

/**
 * メッセージイベントを処理
 *
 * ユーザーから送信されたメッセージを受信し、内容に応じた処理を行います。
 * 現在はログ出力のみ。メッセージ送信機能は #26 で実装予定。
 *
 * @param event - LINE Messageイベント
 *
 * @example
 * ```typescript
 * await handleMessageEvent(event)
 * ```
 */
export async function handleMessageEvent(event: MessageEvent): Promise<void> {
  const message = event.message
  const userId = event.source.userId

  if (!userId) {
    console.warn('User ID not found in message event')
    return
  }

  // テキストメッセージの処理
  if (message.type === 'text') {
    const textMessage = message as TextMessage

    console.log('Text message received:', {
      userId,
      text: textMessage.text,
      messageId: message.id,
      timestamp: event.timestamp,
    })

    // メッセージ内容に応じた処理（#26で実装）
    // 例:
    // - 「プラン作成」→ LIFF起動メッセージ送信
    // - 「ヘルプ」→ ヘルプメッセージ送信
    // - 「プラン一覧」→ プラン一覧表示

    return
  }

  // 画像メッセージの処理
  if (message.type === 'image') {
    console.log('Image message received:', {
      userId,
      messageId: message.id,
      timestamp: event.timestamp,
    })

    // 画像メッセージ処理（将来実装）
    // 例: 旅行先の写真をアップロード
    return
  }

  // スタンプメッセージの処理
  if (message.type === 'sticker') {
    console.log('Sticker message received:', {
      userId,
      packageId: message.packageId,
      stickerId: message.stickerId,
      timestamp: event.timestamp,
    })

    // スタンプメッセージ処理（将来実装）
    return
  }

  // 位置情報メッセージの処理
  if (message.type === 'location') {
    console.log('Location message received:', {
      userId,
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
      timestamp: event.timestamp,
    })

    // 位置情報メッセージ処理（将来実装）
    // 例: 旅行先として追加
    return
  }

  // ビデオメッセージの処理
  if (message.type === 'video') {
    console.log('Video message received:', {
      userId,
      messageId: message.id,
      timestamp: event.timestamp,
    })

    // ビデオメッセージ処理（将来実装）
    return
  }

  // 音声メッセージの処理
  if (message.type === 'audio') {
    console.log('Audio message received:', {
      userId,
      messageId: message.id,
      timestamp: event.timestamp,
    })

    // 音声メッセージ処理（将来実装）
    return
  }

  // ファイルメッセージの処理
  if (message.type === 'file') {
    console.log('File message received:', {
      userId,
      messageId: message.id,
      timestamp: event.timestamp,
    })

    // ファイルメッセージ処理（将来実装）
    return
  }

  // その他のメッセージタイプ
  console.log('Unsupported message type:', {
    userId,
    messageType: 'unknown',
    timestamp: event.timestamp,
  })
}
