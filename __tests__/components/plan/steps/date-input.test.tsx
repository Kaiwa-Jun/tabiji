/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { DateInputStep } from '@/components/plan/steps/date-input'

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

describe('DateInputStep', () => {
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
          <DateInputStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('📅 旅行日程を選択')).toBeInTheDocument()
      expect(screen.getByText('旅行の開始日と終了日を入力してください')).toBeInTheDocument()
    })

    it('出発日と帰着日の入力フィールドが表示される', () => {
      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      expect(screen.getByLabelText(/出発日/)).toBeInTheDocument()
      expect(screen.getByLabelText(/帰着日/)).toBeInTheDocument()
    })

    it('必須マークが表示される', () => {
      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const requiredMarks = screen.getAllByText('*')
      expect(requiredMarks).toHaveLength(2) // 出発日と帰着日
    })
  })

  describe('日付入力', () => {
    it('出発日を入力できる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      await user.type(startDateInput, '2025-12-01')

      expect(startDateInput.value).toBe('2025-12-01')
    })

    it('帰着日を入力できる', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement
      await user.type(endDateInput, '2025-12-05')

      expect(endDateInput.value).toBe('2025-12-05')
    })

    it('両方の日付を入力すると旅程概要が表示される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement

      await user.type(startDateInput, '2025-12-01')
      await user.type(endDateInput, '2025-12-05')

      await waitFor(() => {
        expect(screen.getByText('旅程概要')).toBeInTheDocument()
        expect(screen.getByText(/日数:/)).toBeInTheDocument()
      })
    })
  })

  describe('旅程概要の計算', () => {
    it('日数が正しく計算される（1泊2日）', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement

      await user.type(startDateInput, '2025-12-01')
      await user.type(endDateInput, '2025-12-02')

      await waitFor(() => {
        expect(screen.getByText(/2日間/)).toBeInTheDocument()
      })
    })

    it('日数が正しく計算される（2泊3日）', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement

      await user.type(startDateInput, '2025-12-01')
      await user.type(endDateInput, '2025-12-03')

      await waitFor(() => {
        expect(screen.getByText(/3日間/)).toBeInTheDocument()
      })
    })

    it('日数が正しく計算される（日帰り）', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement

      await user.type(startDateInput, '2025-12-01')
      await user.type(endDateInput, '2025-12-01')

      await waitFor(() => {
        expect(screen.getByText(/1日間/)).toBeInTheDocument()
      })
    })
  })

  describe('バリデーション', () => {
    it('帰着日の最小値が出発日に設定される', async () => {
      const user = userEvent.setup()

      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      const startDateInput = screen.getByLabelText(/出発日/) as HTMLInputElement
      await user.type(startDateInput, '2025-12-01')

      const endDateInput = screen.getByLabelText(/帰着日/) as HTMLInputElement
      expect(endDateInput).toHaveAttribute('min', '2025-12-01')
    })
  })

  describe('初期値の表示', () => {
    it('日付が未入力の場合、旅程概要が表示されない', () => {
      render(
        <PlanFormProvider>
          <DateInputStep />
        </PlanFormProvider>
      )

      expect(screen.queryByText('旅程概要')).not.toBeInTheDocument()
    })
  })
})
