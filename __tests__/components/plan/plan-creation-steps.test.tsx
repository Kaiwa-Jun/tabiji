/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { PlanCreationSteps } from '@/components/plan/plan-creation-steps'

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

describe('PlanCreationSteps', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('基本表示', () => {
    it('ステップインジケーターが表示される', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('日程')).toBeInTheDocument()
      expect(screen.getByText('エリア')).toBeInTheDocument()
      expect(screen.getByText('スポット')).toBeInTheDocument()
      expect(screen.getByText('プレビュー')).toBeInTheDocument()
      expect(screen.getByText('完了')).toBeInTheDocument()
    })

    it('初期状態でステップ1のコンテンツが表示される', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('旅行日程を選択')).toBeInTheDocument()
    })

    it('初期状態で次へボタンのみ表示される（戻るボタンなし）', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /戻る/ })).not.toBeInTheDocument()
    })
  })

  describe('ステップ遷移', () => {
    it('日程入力後、次へボタンをクリックするとステップ2に進む', async () => {
      const user = userEvent.setup()

      // ステップ1の状態から、日程が既に入力されている状態でスタート
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 1,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      // 次へボタンをクリック
      const nextButton = screen.getByRole('button', { name: /次へ/ })
      await user.click(nextButton)

      // ステップ2のコンテンツが表示される
      await waitFor(() => {
        expect(screen.getByText('🗾 エリアを選択')).toBeInTheDocument()
      })
    })

    it('戻るボタンをクリックすると前のステップに戻る', async () => {
      const user = userEvent.setup()

      // ステップ2の状態からスタート
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      // ステップ2のコンテンツが表示されている
      expect(screen.getByText('🗾 エリアを選択')).toBeInTheDocument()

      // 戻るボタンをクリック
      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      // ステップ1のコンテンツが表示される
      await waitFor(() => {
        expect(screen.getByText('旅行日程を選択')).toBeInTheDocument()
      })
    })
  })

  describe('各ステップのレンダリング', () => {
    it('ステップ1で日程入力が表示される', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('旅行日程を選択')).toBeInTheDocument()
    })

    it('ステップ2でエリア選択が表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('🗾 エリアを選択')).toBeInTheDocument()
    })

    it('ステップ3でスポット選択が表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('マップUI（準備中）')).toBeInTheDocument()
    })

    it('ステップ4でプレビューが表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('👀 プレビュー')).toBeInTheDocument()
    })

    it('ステップ5で完了画面が表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 5,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByText('🎉 プラン作成完了！')).toBeInTheDocument()
    })
  })

  describe('次へボタンのバリデーション', () => {
    it('ステップ1で日程が未入力の場合、次へボタンが無効', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })

    it('ステップ1で日程が入力されている場合、次へボタンが有効', async () => {
      // 日程が既に入力されている状態でスタート
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 1,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /次へ/ })
        expect(nextButton).not.toBeDisabled()
      })
    })

    it('ステップ2でエリアが未入力の場合、次へボタンが無効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })

    it('ステップ2でエリアが入力されている場合、次へボタンが有効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).not.toBeDisabled()
    })

    it('ステップ3でスポットが未選択の場合、次へボタンが無効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })

    it('ステップ3でスポットが選択されている場合、次へボタンが有効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).not.toBeDisabled()
    })

    it('ステップ4（プレビュー）では次へボタンが常に有効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      const nextButton = screen.getByRole('button', { name: /プランを保存/ })
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('ボタンのラベル', () => {
    it('ステップ1-3では「次へ」と表示される', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })

    it('ステップ4では「プランを保存」と表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /プランを保存/ })).toBeInTheDocument()
    })

    it('ステップ5では次へボタンが表示されない', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1'],
        customSpots: [],
        currentStep: 5,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.queryByRole('button', { name: /次へ/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /プランを保存/ })).not.toBeInTheDocument()
    })
  })

  describe('ボタンのレイアウト', () => {
    it('ステップ1では戻るボタンが非表示、次へボタンのみ表示', () => {
      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.queryByRole('button', { name: /戻る/ })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })

    it('ステップ2以降では戻るボタンと次へボタンが両方表示', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: null,
        prefecture: null,
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
          <PlanCreationSteps />
        </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })
  })
})
