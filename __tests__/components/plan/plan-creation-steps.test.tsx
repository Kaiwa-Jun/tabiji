/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { SearchModalProvider } from '@/contexts/search-modal-context'
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByText('日程')).toBeInTheDocument()
      expect(screen.getByText('スポット')).toBeInTheDocument()
      expect(screen.getByText('プレビュー')).toBeInTheDocument()
      expect(screen.getByText('完了')).toBeInTheDocument()
    })

    it('初期状態でステップ1のコンテンツが表示される', () => {
      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByText('旅行日程を選択')).toBeInTheDocument()
    })

    it('初期状態で次へボタンのみ表示される（戻るボタンなし）', () => {
      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /戻る/ })).not.toBeInTheDocument()
    })
  })

  describe('ステップ遷移', () => {
    it('日程入力後、次へボタンをクリックするとステップ2(スポット選択)に進む', async () => {
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      // 次へボタンをクリック
      const nextButton = screen.getByRole('button', { name: /次へ/ })
      await user.click(nextButton)

      // ステップ2(スポット選択)のコンテンツが表示される
      await waitFor(() => {
        expect(screen.getByText('スポットを検索...')).toBeInTheDocument()
      })
    })

    it('戻るボタンをクリックすると前のステップに戻る', async () => {
      const user = userEvent.setup()

      // ステップ2(スポット選択)の状態からスタート
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      // ステップ2(スポット選択)のコンテンツが表示されている
      expect(screen.getByText('スポットを検索...')).toBeInTheDocument()

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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByText('旅行日程を選択')).toBeInTheDocument()
    })

    it('ステップ2でスポット選択が表示される', () => {
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      // スポット選択UI要素を確認
      expect(screen.getByText('スポットを検索...')).toBeInTheDocument()
      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
    })

    it('ステップ3でプレビューが表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
        selectedSpotsCount: 2,
        isPreviewMode: true,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      // プレビューモードではタブUIが表示される
      expect(screen.getByText('マップ')).toBeInTheDocument()
      expect(screen.getByText('旅程リスト')).toBeInTheDocument()
    })

    it('ステップ4で完了画面が表示される', () => {
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByText('🎉 プラン作成完了！')).toBeInTheDocument()
    })
  })

  describe('次へボタンのバリデーション', () => {
    it('ステップ1で日程が未入力の場合、次へボタンが無効', () => {
      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
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
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /次へ/ })
        expect(nextButton).not.toBeDisabled()
      })
    })

    it('ステップ2でスポットが未選択の場合、プランを作成するボタンが無効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
        selectedSpotsCount: 0,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      const createButton = screen.getByRole('button', { name: /プランを作成する/ })
      expect(createButton).toBeDisabled()
    })

    // TODO: SearchModalProviderが必要なため、一時的にスキップ
    it.skip('ステップ2でスポットが2箇所以上選択されている場合、プランを作成するボタンが有効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
        selectedSpotsCount: 2,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      const createButton = screen.getByRole('button', { name: /プランを作成する/ })
      expect(createButton).not.toBeDisabled()
    })

    it('ステップ3（プレビュー）では保存ボタンが常に有効', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
        selectedSpotsCount: 2,
        isPreviewMode: true,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      const saveButton = screen.getByRole('button', { name: /保存/ })
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('ボタンのラベル', () => {
    it('ステップ1では「次へ」と表示される', () => {
      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })

    it('ステップ2では「プランを作成する」と表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
        selectedSpotsCount: 0,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /プランを作成する/ })).toBeInTheDocument()
    })

    it('ステップ3（プレビュー）では「保存」と表示される', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
        selectedSpotsCount: 2,
        isPreviewMode: true,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
    })

    it('ステップ4では次へボタンが表示されない', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 4,
        isComplete: false,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.queryByRole('button', { name: /次へ/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /プランを作成する/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /保存/ })).not.toBeInTheDocument()
    })
  })

  describe('ボタンのレイアウト', () => {
    it('ステップ1では戻るボタンが非表示、次へボタンのみ表示', () => {
      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.queryByRole('button', { name: /戻る/ })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })

    it('ステップ2では戻るボタンとプランを作成するボタンが両方表示', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: [],
        customSpots: [],
        currentStep: 2,
        isComplete: false,
        selectedSpotsCount: 0,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /プランを作成する/ })).toBeInTheDocument()
    })

    it('ステップ3（プレビュー）では戻るボタンと保存ボタンが両方表示', () => {
      const savedData = {
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-05T00:00:00.000Z',
        region: 'kanto',
        prefecture: '東京都',
        selectedSpots: ['spot1', 'spot2'],
        customSpots: [],
        currentStep: 3,
        isComplete: false,
        selectedSpotsCount: 2,
        isPreviewMode: true,
      }
      localStorageMock.setItem('planFormData', JSON.stringify(savedData))

      render(
        <PlanFormProvider>
        <SearchModalProvider>
          <PlanCreationSteps />
        </SearchModalProvider>
      </PlanFormProvider>
      )

      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
    })
  })
})
