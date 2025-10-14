/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider, usePlanForm } from '@/contexts/plan-form-context'

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

// テスト用コンポーネント
function TestComponent() {
  const { formData, updateFormData, nextStep, prevStep, resetForm } = usePlanForm()

  return (
    <div>
      <div data-testid="current-step">{formData.currentStep}</div>
      <div data-testid="start-date">{formData.startDate?.toISOString() || 'null'}</div>
      <div data-testid="end-date">{formData.endDate?.toISOString() || 'null'}</div>
      <div data-testid="region">{formData.region || 'null'}</div>
      <div data-testid="prefecture">{formData.prefecture || 'null'}</div>

      <button onClick={nextStep} data-testid="next-step">
        Next
      </button>
      <button onClick={prevStep} data-testid="prev-step">
        Prev
      </button>
      <button onClick={resetForm} data-testid="reset-form">
        Reset
      </button>
      <button
        onClick={() =>
          updateFormData({
            startDate: new Date('2025-10-15'),
            endDate: new Date('2025-10-17'),
            region: '関東',
            prefecture: '東京都',
          })
        }
        data-testid="update-form"
      >
        Update
      </button>
    </div>
  )
}

describe('PlanFormContext', () => {
  beforeEach(() => {
    // 各テスト前にLocalStorageをクリア
    localStorageMock.clear()
    // コンソールログをモック（ログ出力を抑制）
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('基本動作', () => {
    it('初期値が正しく設定される', () => {
      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
      expect(screen.getByTestId('start-date')).toHaveTextContent('null')
      expect(screen.getByTestId('end-date')).toHaveTextContent('null')
      expect(screen.getByTestId('region')).toHaveTextContent('null')
      expect(screen.getByTestId('prefecture')).toHaveTextContent('null')
    })

    it('usePlanFormがProviderの外で使用された場合にエラーをスローする', () => {
      // エラーログを抑制
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('usePlanForm must be used within PlanFormProvider')

      consoleError.mockRestore()
    })
  })

  describe('フォームデータの更新', () => {
    it('updateFormDataで部分更新ができる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const updateButton = screen.getByTestId('update-form')
      await user.click(updateButton)

      await waitFor(() => {
        expect(screen.getByTestId('start-date')).toHaveTextContent('2025-10-15T00:00:00.000Z')
        expect(screen.getByTestId('end-date')).toHaveTextContent('2025-10-17T00:00:00.000Z')
        expect(screen.getByTestId('region')).toHaveTextContent('関東')
        expect(screen.getByTestId('prefecture')).toHaveTextContent('東京都')
      })
    })
  })

  describe('ステップ遷移', () => {
    it('nextStepでステップが進む', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const nextButton = screen.getByTestId('next-step')

      expect(screen.getByTestId('current-step')).toHaveTextContent('1')

      await user.click(nextButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('2')

      await user.click(nextButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('3')
    })

    it('prevStepでステップが戻る', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const nextButton = screen.getByTestId('next-step')
      const prevButton = screen.getByTestId('prev-step')

      // ステップ3まで進む
      await user.click(nextButton)
      await user.click(nextButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('3')

      // 戻る
      await user.click(prevButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('2')
    })

    it('ステップは1未満にならない', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const prevButton = screen.getByTestId('prev-step')

      expect(screen.getByTestId('current-step')).toHaveTextContent('1')

      await user.click(prevButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
    })

    it('ステップは4を超えない', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const nextButton = screen.getByTestId('next-step')

      // ステップ4まで進む
      await user.click(nextButton) // 2
      await user.click(nextButton) // 3
      await user.click(nextButton) // 4

      expect(screen.getByTestId('current-step')).toHaveTextContent('4')

      // さらに次へを押しても4のまま
      await user.click(nextButton)
      expect(screen.getByTestId('current-step')).toHaveTextContent('4')
    })
  })

  describe('フォームリセット', () => {
    it('resetFormでフォームが初期化される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      // データを更新
      const updateButton = screen.getByTestId('update-form')
      await user.click(updateButton)

      await waitFor(() => {
        expect(screen.getByTestId('region')).toHaveTextContent('関東')
      })

      // リセット
      const resetButton = screen.getByTestId('reset-form')
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('1')
        expect(screen.getByTestId('start-date')).toHaveTextContent('null')
        expect(screen.getByTestId('end-date')).toHaveTextContent('null')
        expect(screen.getByTestId('region')).toHaveTextContent('null')
        expect(screen.getByTestId('prefecture')).toHaveTextContent('null')
      })
    })
  })

  describe('LocalStorage連携', () => {
    it('フォームデータがLocalStorageに保存される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      const updateButton = screen.getByTestId('update-form')
      await user.click(updateButton)

      await waitFor(() => {
        const saved = localStorageMock.getItem('planFormData')
        expect(saved).not.toBeNull()

        if (saved) {
          const parsed = JSON.parse(saved)
          expect(parsed.region).toBe('関東')
          expect(parsed.prefecture).toBe('東京都')
          expect(parsed.startDate).toBe('2025-10-15T00:00:00.000Z')
        }
      })
    })

    it('LocalStorageからデータが復元される', async () => {
      // 事前にLocalStorageにデータを保存
      const savedData = {
        startDate: '2025-10-20T00:00:00.000Z',
        endDate: '2025-10-22T00:00:00.000Z',
        region: '関西',
        prefecture: '京都府',
        selectedSpots: [],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('3')
        expect(screen.getByTestId('region')).toHaveTextContent('関西')
        expect(screen.getByTestId('prefecture')).toHaveTextContent('京都府')
        expect(screen.getByTestId('start-date')).toHaveTextContent('2025-10-20T00:00:00.000Z')
      })
    })

    it('resetFormでLocalStorageがクリアされる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      // データを更新（LocalStorageに保存される）
      const updateButton = screen.getByTestId('update-form')
      await user.click(updateButton)

      await waitFor(() => {
        expect(localStorageMock.getItem('planFormData')).not.toBeNull()
      })

      // リセット
      const resetButton = screen.getByTestId('reset-form')
      await user.click(resetButton)

      await waitFor(() => {
        expect(localStorageMock.getItem('planFormData')).toBeNull()
      })
    })

    it('破損したLocalStorageデータがある場合でも正常に動作する', () => {
      // 不正なJSONを保存
      localStorageMock.setItem('planFormData', 'invalid json')

      render(
        <PlanFormProvider>
          <TestComponent />
        </PlanFormProvider>
      )

      // エラーが発生せず、初期値で表示される
      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
      expect(screen.getByTestId('region')).toHaveTextContent('null')
    })
  })
})
