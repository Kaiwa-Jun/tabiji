/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { AreaSelectionStep } from '@/components/plan/steps/area-selection'

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

describe('AreaSelectionStep', () => {
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
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('🗾 エリアを選択')).toBeInTheDocument()
      expect(screen.getByText('旅行先の地方と都道府県を選択してください')).toBeInTheDocument()
    })

    it('地方と都道府県の入力フィールドが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByLabelText(/地方/)).toBeInTheDocument()
      expect(screen.getByLabelText(/都道府県/)).toBeInTheDocument()
    })

    it('必須マークが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const requiredMarks = screen.getAllByText('*')
      expect(requiredMarks).toHaveLength(2) // 地方と都道府県
    })

    it('実装予定メッセージが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(
        screen.getByText(/地図ベースのエリア選択UIは別issueで実装予定です/)
      ).toBeInTheDocument()
    })
  })

  describe('地方選択', () => {
    it('地方のドロップダウンが選択できる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const regionSelect = screen.getByLabelText(/地方/) as HTMLSelectElement

      // デフォルトは空
      expect(regionSelect.value).toBe('')

      // 関東を選択
      await user.selectOptions(regionSelect, 'kanto')
      expect(regionSelect.value).toBe('kanto')
    })

    it('すべての地方が選択肢に含まれる', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByRole('option', { name: '北海道' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '東北' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '関東' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '中部' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '近畿' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '中国' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '四国' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '九州' })).toBeInTheDocument()
    })
  })

  describe('都道府県入力', () => {
    it('都道府県を入力できる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const prefectureInput = screen.getByLabelText(/都道府県/) as HTMLInputElement
      await user.type(prefectureInput, '東京都')

      expect(prefectureInput.value).toBe('東京都')
    })

    it('プレースホルダーが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const prefectureInput = screen.getByLabelText(/都道府県/) as HTMLInputElement
      expect(prefectureInput.placeholder).toBe('例: 東京都')
    })
  })

  describe('データの永続化', () => {
    it('入力した地方がコンテキストに保存される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const regionSelect = screen.getByLabelText(/地方/) as HTMLSelectElement
      await user.selectOptions(regionSelect, 'kinki')

      await waitFor(() => {
        const saved = localStorageMock.getItem('planFormData')
        expect(saved).not.toBeNull()

        if (saved) {
          const parsed = JSON.parse(saved)
          expect(parsed.region).toBe('kinki')
        }
      })
    })

    it('入力した都道府県がコンテキストに保存される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const prefectureInput = screen.getByLabelText(/都道府県/) as HTMLInputElement
      await user.type(prefectureInput, '京都府')

      await waitFor(() => {
        const saved = localStorageMock.getItem('planFormData')
        expect(saved).not.toBeNull()

        if (saved) {
          const parsed = JSON.parse(saved)
          expect(parsed.prefecture).toBe('京都府')
        }
      })
    })
  })
})
