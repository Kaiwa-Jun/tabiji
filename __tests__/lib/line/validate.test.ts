import crypto from 'crypto'
import { validateSignature } from '@/lib/line/validate'

describe('validateSignature', () => {
  const channelSecret = 'test-channel-secret'
  const body = '{"events":[{"type":"message","message":{"type":"text","text":"hello"}}]}'

  // 正しい署名を生成するヘルパー関数
  const generateSignature = (requestBody: string, secret: string): string => {
    return crypto.createHmac('SHA256', secret).update(requestBody).digest('base64')
  }

  describe('正常系', () => {
    it('正しい署名で検証が通る', () => {
      const signature = generateSignature(body, channelSecret)
      const result = validateSignature(body, signature, channelSecret)
      expect(result).toBe(true)
    })

    it('空のボディでも正しい署名なら検証が通る', () => {
      const emptyBody = ''
      const signature = generateSignature(emptyBody, channelSecret)
      const result = validateSignature(emptyBody, signature, channelSecret)
      expect(result).toBe(true)
    })

    it('日本語を含むボディでも正しい署名なら検証が通る', () => {
      const japaneseBody = '{"events":[{"type":"message","message":{"type":"text","text":"こんにちは"}}]}'
      const signature = generateSignature(japaneseBody, channelSecret)
      const result = validateSignature(japaneseBody, signature, channelSecret)
      expect(result).toBe(true)
    })
  })

  describe('異常系', () => {
    it('不正な署名で検証が失敗する', () => {
      const invalidSignature = 'invalid-signature-string'
      const result = validateSignature(body, invalidSignature, channelSecret)
      expect(result).toBe(false)
    })

    it('空の署名で検証が失敗する', () => {
      const result = validateSignature(body, '', channelSecret)
      expect(result).toBe(false)
    })

    it('異なるチャネルシークレットで検証が失敗する', () => {
      const signature = generateSignature(body, channelSecret)
      const differentSecret = 'different-channel-secret'
      const result = validateSignature(body, signature, differentSecret)
      expect(result).toBe(false)
    })

    it('ボディが改ざんされている場合、検証が失敗する', () => {
      const signature = generateSignature(body, channelSecret)
      const tamperedBody = '{"events":[{"type":"message","message":{"type":"text","text":"hacked"}}]}'
      const result = validateSignature(tamperedBody, signature, channelSecret)
      expect(result).toBe(false)
    })

    it('空のチャネルシークレットで検証が失敗する', () => {
      const signature = generateSignature(body, channelSecret)
      const result = validateSignature(body, signature, '')
      expect(result).toBe(false)
    })
  })
})
