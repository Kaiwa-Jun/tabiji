# LINE Messaging API ラッパー

LINE Messaging API を使用したBot機能のラッパーを配置します。

## ファイル構成

```
line/
├── messaging.ts        # Messaging API ラッパー
├── validate.ts         # Webhook 署名検証
├── flex-messages.ts    # Flex Message テンプレート
└── handlers/           # メッセージハンドラー
```

## 実装予定

- フェーズ2: Messaging API基盤・署名検証
- フェーズ8: Flex Message・コマンドハンドラー
