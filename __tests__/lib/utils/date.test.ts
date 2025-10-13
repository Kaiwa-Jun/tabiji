/**
 * 日付ユーティリティ関数のテスト
 */

import {
  formatDuration,
  formatJapaneseDate,
  formatJapaneseDateWithWeekday,
  formatShortJapaneseDate,
  isToday,
  isSameDay,
} from '@/lib/utils/date'

describe('formatDuration', () => {
  it('日帰り旅行（同じ日付）は「日帰り」を返す', () => {
    const date = new Date('2025-10-13')
    expect(formatDuration(date, date)).toBe('日帰り')
  })

  it('1泊2日の旅行を正しくフォーマットする', () => {
    const start = new Date('2025-10-13')
    const end = new Date('2025-10-14')
    expect(formatDuration(start, end)).toBe('1泊2日')
  })

  it('2泊3日の旅行を正しくフォーマットする', () => {
    const start = new Date('2025-10-13')
    const end = new Date('2025-10-15')
    expect(formatDuration(start, end)).toBe('2泊3日')
  })

  it('長期旅行（10泊11日）を正しくフォーマットする', () => {
    const start = new Date('2025-10-01')
    const end = new Date('2025-10-11')
    expect(formatDuration(start, end)).toBe('10泊11日')
  })
})

describe('formatJapaneseDate', () => {
  it('日付を「yyyy年M月d日」形式でフォーマットする', () => {
    const date = new Date('2025-10-13')
    expect(formatJapaneseDate(date)).toBe('2025年10月13日')
  })

  it('1桁の月日を0埋めせずにフォーマットする', () => {
    const date = new Date('2025-01-05')
    expect(formatJapaneseDate(date)).toBe('2025年1月5日')
  })
})

describe('formatJapaneseDateWithWeekday', () => {
  it('日付を「yyyy年M月d日（曜日）」形式でフォーマットする', () => {
    const date = new Date('2025-10-13') // 月曜日
    expect(formatJapaneseDateWithWeekday(date)).toBe('2025年10月13日（月）')
  })

  it('別の曜日も正しくフォーマットする', () => {
    const date = new Date('2025-10-15') // 水曜日
    expect(formatJapaneseDateWithWeekday(date)).toBe('2025年10月15日（水）')
  })
})

describe('formatShortJapaneseDate', () => {
  it('日付を「M月d日」形式でフォーマットする', () => {
    const date = new Date('2025-10-13')
    expect(formatShortJapaneseDate(date)).toBe('10月13日')
  })

  it('1桁の月日を0埋めせずにフォーマットする', () => {
    const date = new Date('2025-01-05')
    expect(formatShortJapaneseDate(date)).toBe('1月5日')
  })
})

describe('isToday', () => {
  it('今日の日付はtrueを返す', () => {
    const today = new Date()
    expect(isToday(today)).toBe(true)
  })

  it('過去の日付はfalseを返す', () => {
    const past = new Date('2020-01-01')
    expect(isToday(past)).toBe(false)
  })

  it('未来の日付はfalseを返す', () => {
    const future = new Date('2099-12-31')
    expect(isToday(future)).toBe(false)
  })

  it('時刻が違っても同じ日ならtrueを返す', () => {
    const now = new Date()
    const sameDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    expect(isToday(sameDay)).toBe(true)
  })
})

describe('isSameDay', () => {
  it('同じ日付はtrueを返す', () => {
    const date1 = new Date('2025-10-13')
    const date2 = new Date('2025-10-13')
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('時刻が違っても同じ日ならtrueを返す', () => {
    const date1 = new Date('2025-10-13T10:00:00')
    const date2 = new Date('2025-10-13T15:30:00')
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('異なる日付はfalseを返す', () => {
    const date1 = new Date('2025-10-13')
    const date2 = new Date('2025-10-14')
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('同じ月日でも年が違えばfalseを返す', () => {
    const date1 = new Date('2024-10-13')
    const date2 = new Date('2025-10-13')
    expect(isSameDay(date1, date2)).toBe(false)
  })
})
