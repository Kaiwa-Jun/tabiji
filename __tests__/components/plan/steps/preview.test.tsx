/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { PreviewStep } from '@/components/plan/steps/preview'

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('PreviewStep', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('基本表示', () => {
    it('タイトルと説明が表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('👀 プレビュー')).toBeInTheDocument()
      expect(screen.getByText('入力内容を確認してください')).toBeInTheDocument()
    })

    it('実装予定メッセージが表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(
        screen.getByText(/詳細なプレビュー表示（地図・ルート等）は別issueで実装予定です/)
      ).toBeInTheDocument()
    })

    it('各セクションのヘッダーが表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('📅 日程')).toBeInTheDocument()
      expect(screen.getByText('🗾 エリア')).toBeInTheDocument()
      expect(screen.getByText('📍 スポット')).toBeInTheDocument()
    })
  })

  describe('日程の表示', () => {
    it('日程が未設定の場合、「未設定」と表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      const sections = screen.getAllByText('未設定')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('日程が設定されている場合、日付が表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      // 日付が表示される
      expect(screen.getByText(/2025\/12\/1/)).toBeInTheDocument()
      expect(screen.getByText(/2025\/12\/5/)).toBeInTheDocument()
    })
  })

  describe('エリアの表示', () => {
    it('エリアが未設定の場合、「未設定」と表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      const sections = screen.getAllByText('未設定')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('エリアが設定されている場合、地方と都道府県が表示される', () => {
      const savedData = {
        startDate: null,
        endDate: null,
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(screen.getByText(/kanto - 東京都/)).toBeInTheDocument()
    })
  })

  describe('スポットの表示', () => {
    it('スポットが未設定の場合、0件と表示される', () => {
      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(screen.getByText(/選択済み: 0件/)).toBeInTheDocument()
      expect(screen.getByText(/カスタム: 0件/)).toBeInTheDocument()
    })

    it('スポットが設定されている場合、件数が表示される', () => {
      const savedData = {
        startDate: null,
        endDate: null,
        region: null,
        prefecture: null,
        selectedSpots: ['spot1', 'spot2', 'spot3'],
        customSpots: ['custom1'],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PreviewStep />
        </PlanFormProvider>
      )

      expect(screen.getByText(/選択済み: 3件/)).toBeInTheDocument()
      expect(screen.getByText(/カスタム: 1件/)).toBeInTheDocument()
    })
  })
})
