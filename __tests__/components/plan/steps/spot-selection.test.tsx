/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { SpotSelectionStep } from '@/components/plan/steps/spot-selection'

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

describe('SpotSelectionStep', () => {
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
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('📍 スポットを選択')).toBeInTheDocument()
      expect(screen.getByText('訪問したいスポットを選択してください')).toBeInTheDocument()
    })

    it('プレースホルダーメッセージが表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('スポット選択UIは準備中です')).toBeInTheDocument()
    })

    it('実装予定メッセージが表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(
        screen.getByText(/スポット検索・地図選択UIは別issueで実装予定です/)
      ).toBeInTheDocument()
    })
  })

  describe('スポット数の表示', () => {
    it('初期状態では選択済みスポット数が0件と表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText(/選択済みスポット: 0件/)).toBeInTheDocument()
      expect(screen.getByText(/カスタムスポット: 0件/)).toBeInTheDocument()
    })

    it('LocalStorageにスポットデータがある場合、件数が表示される', () => {
      // 事前にスポットデータを保存
      const savedData = {
        startDate: null,
        endDate: null,
        region: null,
        prefecture: null,
        selectedSpots: ['spot1', 'spot2'],
        customSpots: ['custom1'],
        currentStep: 3,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText(/選択済みスポット: 2件/)).toBeInTheDocument()
      expect(screen.getByText(/カスタムスポット: 1件/)).toBeInTheDocument()
    })
  })
})
