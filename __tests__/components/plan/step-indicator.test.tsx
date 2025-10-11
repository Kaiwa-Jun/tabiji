/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { StepIndicator } from '@/components/plan/step-indicator'

describe('StepIndicator', () => {
  describe('基本表示', () => {
    it('すべてのステップが表示される', () => {
      render(<StepIndicator currentStep={1} />)

      expect(screen.getByText('日程')).toBeInTheDocument()
      expect(screen.getByText('エリア')).toBeInTheDocument()
      expect(screen.getByText('スポット')).toBeInTheDocument()
      expect(screen.getByText('プレビュー')).toBeInTheDocument()
      expect(screen.getByText('完了')).toBeInTheDocument()
    })

    it('5つのステップ番号が表示される', () => {
      render(<StepIndicator currentStep={1} />)

      // ステップ1が数字で表示
      expect(screen.getByText('1')).toBeInTheDocument()
      // ステップ2-5も数字で表示
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('現在のステップの強調表示', () => {
    it('ステップ1が現在のステップとして表示される', () => {
      const { container } = render(<StepIndicator currentStep={1} />)

      // 最初のステップサークルを取得（数字「1」の親要素）
      const step1Circle = screen.getByText('1').closest('div')
      expect(step1Circle).toHaveClass('border-primary')
    })

    it('ステップ3が現在のステップとして表示される', () => {
      const { container } = render(<StepIndicator currentStep={3} />)

      // ステップ3のサークルを取得
      const step3Circle = screen.getByText('3').closest('div')
      expect(step3Circle).toHaveClass('border-primary')
    })
  })

  describe('完了済みステップの表示', () => {
    it('現在がステップ3の場合、ステップ1と2にチェックマークが表示される', () => {
      const { container } = render(<StepIndicator currentStep={3} />)

      // SVG要素（Check アイコン）が2つ表示される
      const checkIcons = container.querySelectorAll('svg.lucide-check')
      expect(checkIcons).toHaveLength(2)
    })

    it('現在がステップ5の場合、ステップ1-4にチェックマークが表示される', () => {
      const { container } = render(<StepIndicator currentStep={5} />)

      // SVG要素（Check アイコン）が4つ表示される
      const checkIcons = container.querySelectorAll('svg.lucide-check')
      expect(checkIcons).toHaveLength(4)

      // ステップ5は数字で表示される
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('ステップ1では完了ステップがない', () => {
      const { container } = render(<StepIndicator currentStep={1} />)

      // チェックマークアイコンが表示されない
      const checkIcons = container.querySelectorAll('svg.lucide-check')
      expect(checkIcons).toHaveLength(0)

      // すべてのステップ番号が表示される
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('エッジケース', () => {
    it('currentStepが1未満の場合でもレンダリングされる', () => {
      render(<StepIndicator currentStep={0} />)

      expect(screen.getByText('日程')).toBeInTheDocument()
    })

    it('currentStepが5を超える場合でもレンダリングされる', () => {
      render(<StepIndicator currentStep={10} />)

      expect(screen.getByText('完了')).toBeInTheDocument()
    })
  })
})
