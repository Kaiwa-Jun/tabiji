/**
 * プランバリデーションヘルパー関数のテスト
 */

import {
  validateDateInput,
  validateAreaSelection,
  validateSpotSelection,
  validatePlan,
  calculateDays,
  formatDuration,
  isValidDateRange,
  formatDateToString,
  generateDateRange,
  getTotalSpotCount,
  hasSelectedSpots,
} from '@/lib/validators/plan'

describe('validateDateInput', () => {
  it('正常な日程でバリデーションが成功する', () => {
    const result = validateDateInput({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date)
      expect(result.data.endDate).toBeInstanceOf(Date)
    }
  })

  it('無効な日程でエラーが返される', () => {
    const result = validateDateInput({
      startDate: new Date('2025-01-03'),
      endDate: new Date('2025-01-01'),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.endDate).toBeDefined()
    }
  })
})

describe('validateAreaSelection', () => {
  it('正常なエリアでバリデーションが成功する', () => {
    const result = validateAreaSelection({
      region: '関東',
      prefecture: '東京都',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.region).toBe('関東')
      expect(result.data.prefecture).toBe('東京都')
    }
  })

  it('地方と都道府県が不一致でエラーが返される', () => {
    const result = validateAreaSelection({
      region: '関東',
      prefecture: '大阪府',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.prefecture).toBeDefined()
    }
  })
})

describe('validateSpotSelection', () => {
  it('スポットが選択されている場合バリデーションが成功する', () => {
    const result = validateSpotSelection({
      selectedSpots: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '東京タワー',
          latitude: 35.6586,
          longitude: 139.7454,
        },
      ],
      customSpots: [],
    })

    expect(result.success).toBe(true)
  })

  it('スポットが未選択の場合エラーが返される', () => {
    const result = validateSpotSelection({
      selectedSpots: [],
      customSpots: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.selectedSpots).toBeDefined()
    }
  })
})

describe('validatePlan', () => {
  it('完全なプランデータでバリデーションが成功する', () => {
    const result = validatePlan({
      title: '北海道旅行',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-05'),
      region: '北海道',
      prefecture: '北海道',
      selectedSpots: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '札幌時計台',
          latitude: 43.0622,
          longitude: 141.3545,
        },
      ],
      customSpots: [],
    })

    expect(result.success).toBe(true)
  })
})

describe('calculateDays', () => {
  it('2泊3日の場合、3を返す', () => {
    const days = calculateDays(new Date('2025-01-01'), new Date('2025-01-03'))
    expect(days).toBe(3)
  })

  it('日帰りの場合、1を返す', () => {
    const days = calculateDays(new Date('2025-01-01'), new Date('2025-01-01'))
    expect(days).toBe(1)
  })

  it('1週間の場合、8を返す', () => {
    const days = calculateDays(new Date('2025-01-01'), new Date('2025-01-08'))
    expect(days).toBe(8)
  })
})

describe('formatDuration', () => {
  it('2泊3日の場合、「2泊3日」を返す', () => {
    const duration = formatDuration(new Date('2025-01-01'), new Date('2025-01-03'))
    expect(duration).toBe('2泊3日')
  })

  it('日帰りの場合、「日帰り」を返す', () => {
    const duration = formatDuration(new Date('2025-01-01'), new Date('2025-01-01'))
    expect(duration).toBe('日帰り')
  })

  it('1泊2日の場合、「1泊2日」を返す', () => {
    const duration = formatDuration(new Date('2025-01-01'), new Date('2025-01-02'))
    expect(duration).toBe('1泊2日')
  })

  it('3泊4日の場合、「3泊4日」を返す', () => {
    const duration = formatDuration(new Date('2025-01-01'), new Date('2025-01-04'))
    expect(duration).toBe('3泊4日')
  })
})

describe('isValidDateRange', () => {
  it('終了日が開始日以降の場合、trueを返す', () => {
    expect(isValidDateRange(new Date('2025-01-01'), new Date('2025-01-03'))).toBe(true)
  })

  it('同じ日付の場合、trueを返す', () => {
    expect(isValidDateRange(new Date('2025-01-01'), new Date('2025-01-01'))).toBe(true)
  })

  it('終了日が開始日より前の場合、falseを返す', () => {
    expect(isValidDateRange(new Date('2025-01-03'), new Date('2025-01-01'))).toBe(false)
  })
})

describe('formatDateToString', () => {
  it('正しくYYYY-MM-DD形式に変換される', () => {
    const dateStr = formatDateToString(new Date('2025-01-01'))
    expect(dateStr).toBe('2025-01-01')
  })

  it('月と日が1桁の場合、0埋めされる', () => {
    const dateStr = formatDateToString(new Date('2025-03-05'))
    expect(dateStr).toBe('2025-03-05')
  })

  it('12月31日が正しく変換される', () => {
    const dateStr = formatDateToString(new Date('2025-12-31'))
    expect(dateStr).toBe('2025-12-31')
  })
})

describe('generateDateRange', () => {
  it('3日間の日付配列を生成する', () => {
    const dates = generateDateRange(new Date('2025-01-01'), new Date('2025-01-03'))

    expect(dates).toHaveLength(3)
    expect(formatDateToString(dates[0])).toBe('2025-01-01')
    expect(formatDateToString(dates[1])).toBe('2025-01-02')
    expect(formatDateToString(dates[2])).toBe('2025-01-03')
  })

  it('日帰りの場合、1つの日付を返す', () => {
    const dates = generateDateRange(new Date('2025-01-01'), new Date('2025-01-01'))

    expect(dates).toHaveLength(1)
    expect(formatDateToString(dates[0])).toBe('2025-01-01')
  })

  it('1週間の日付配列を生成する', () => {
    const dates = generateDateRange(new Date('2025-01-01'), new Date('2025-01-07'))

    expect(dates).toHaveLength(7)
    expect(formatDateToString(dates[0])).toBe('2025-01-01')
    expect(formatDateToString(dates[6])).toBe('2025-01-07')
  })

  it('月をまたぐ日付配列を正しく生成する', () => {
    const dates = generateDateRange(new Date('2025-01-30'), new Date('2025-02-02'))

    expect(dates).toHaveLength(4)
    expect(formatDateToString(dates[0])).toBe('2025-01-30')
    expect(formatDateToString(dates[1])).toBe('2025-01-31')
    expect(formatDateToString(dates[2])).toBe('2025-02-01')
    expect(formatDateToString(dates[3])).toBe('2025-02-02')
  })
})

describe('getTotalSpotCount', () => {
  it('選択スポットのみの場合、正しい数を返す', () => {
    const count = getTotalSpotCount([{}, {}], [])
    expect(count).toBe(2)
  })

  it('カスタムスポットのみの場合、正しい数を返す', () => {
    const count = getTotalSpotCount([], [{}, {}, {}])
    expect(count).toBe(3)
  })

  it('両方ある場合、合計数を返す', () => {
    const count = getTotalSpotCount([{}, {}], [{}, {}, {}])
    expect(count).toBe(5)
  })

  it('両方空の場合、0を返す', () => {
    const count = getTotalSpotCount([], [])
    expect(count).toBe(0)
  })
})

describe('hasSelectedSpots', () => {
  it('スポットが選択されている場合、trueを返す', () => {
    expect(hasSelectedSpots([{}], [])).toBe(true)
    expect(hasSelectedSpots([], [{}])).toBe(true)
    expect(hasSelectedSpots([{}], [{}])).toBe(true)
  })

  it('スポットが選択されていない場合、falseを返す', () => {
    expect(hasSelectedSpots([], [])).toBe(false)
  })
})
