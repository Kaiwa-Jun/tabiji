import {
  REGIONS,
  REGION_DATA,
  getPrefectureByName,
  getPrefecturesByRegionName,
  getPrefecturesByRegion,
  getRegionByPrefecture,
  isPrefectureInRegion,
} from '@/lib/constants/areas'

describe('areas.ts - エリア定数とユーティリティ関数', () => {
  describe('REGIONS', () => {
    it('8つの地方が定義されている', () => {
      expect(REGIONS).toHaveLength(8)
    })

    it('正しい地方名が含まれている', () => {
      expect(REGIONS).toContain('北海道')
      expect(REGIONS).toContain('東北')
      expect(REGIONS).toContain('関東')
      expect(REGIONS).toContain('中部')
      expect(REGIONS).toContain('近畿')
      expect(REGIONS).toContain('中国')
      expect(REGIONS).toContain('四国')
      expect(REGIONS).toContain('九州・沖縄')
    })
  })

  describe('REGION_DATA', () => {
    it('8つの地方データが定義されている', () => {
      expect(REGION_DATA).toHaveLength(8)
    })

    it('合計47都道府県が定義されている', () => {
      const totalPrefectures = REGION_DATA.reduce(
        (sum, region) => sum + region.prefectures.length,
        0
      )
      expect(totalPrefectures).toBe(47)
    })

    it('すべての都道府県に座標とズームレベルが設定されている', () => {
      REGION_DATA.forEach((region) => {
        region.prefectures.forEach((prefecture) => {
          expect(prefecture.code).toBeDefined()
          expect(prefecture.name).toBeDefined()
          expect(typeof prefecture.lat).toBe('number')
          expect(typeof prefecture.lng).toBe('number')
          expect(typeof prefecture.zoom).toBe('number')
          expect(prefecture.zoom).toBeGreaterThanOrEqual(1)
          expect(prefecture.zoom).toBeLessThanOrEqual(20)
        })
      })
    })

    it('都道府県コードが01-47の範囲内である', () => {
      REGION_DATA.forEach((region) => {
        region.prefectures.forEach((prefecture) => {
          const code = parseInt(prefecture.code, 10)
          expect(code).toBeGreaterThanOrEqual(1)
          expect(code).toBeLessThanOrEqual(47)
        })
      })
    })
  })

  describe('getPrefectureByName', () => {
    it('東京都の座標データを取得できる', () => {
      const tokyo = getPrefectureByName('東京都')
      expect(tokyo).toBeDefined()
      expect(tokyo?.name).toBe('東京都')
      expect(tokyo?.code).toBe('13')
      expect(tokyo?.lat).toBe(35.6812)
      expect(tokyo?.lng).toBe(139.7671)
      expect(tokyo?.zoom).toBe(11)
    })

    it('北海道の座標データを取得できる', () => {
      const hokkaido = getPrefectureByName('北海道')
      expect(hokkaido).toBeDefined()
      expect(hokkaido?.name).toBe('北海道')
      expect(hokkaido?.code).toBe('01')
    })

    it('沖縄県の座標データを取得できる', () => {
      const okinawa = getPrefectureByName('沖縄県')
      expect(okinawa).toBeDefined()
      expect(okinawa?.name).toBe('沖縄県')
      expect(okinawa?.code).toBe('47')
    })

    it('存在しない都道府県名の場合undefinedを返す', () => {
      const invalid = getPrefectureByName('存在しない県')
      expect(invalid).toBeUndefined()
    })
  })

  describe('getPrefecturesByRegionName', () => {
    it('関東地方の都道府県リスト（座標付き）を取得できる', () => {
      const kantoPrefs = getPrefecturesByRegionName('関東')
      expect(kantoPrefs).toHaveLength(7)
      expect(kantoPrefs[0].name).toBe('茨城県')
      expect(kantoPrefs[6].name).toBe('神奈川県')
      // 座標データが含まれていることを確認
      expect(kantoPrefs[0].lat).toBeDefined()
      expect(kantoPrefs[0].lng).toBeDefined()
      expect(kantoPrefs[0].zoom).toBeDefined()
    })

    it('北海道地方の都道府県リストを取得できる', () => {
      const hokkaidoPrefs = getPrefecturesByRegionName('北海道')
      expect(hokkaidoPrefs).toHaveLength(1)
      expect(hokkaidoPrefs[0].name).toBe('北海道')
    })

    it('東北地方の都道府県リストを取得できる', () => {
      const tohokuPrefs = getPrefecturesByRegionName('東北')
      expect(tohokuPrefs).toHaveLength(6)
    })

    it('九州・沖縄地方の都道府県リストを取得できる', () => {
      const kyushuPrefs = getPrefecturesByRegionName('九州・沖縄')
      expect(kyushuPrefs).toHaveLength(8)
      expect(kyushuPrefs[7].name).toBe('沖縄県')
    })
  })

  describe('getPrefecturesByRegion (既存関数)', () => {
    it('関東地方の都道府県名リストを取得できる', () => {
      const kantoPrefs = getPrefecturesByRegion('関東')
      expect(kantoPrefs).toHaveLength(7)
      expect(kantoPrefs).toContain('東京都')
      expect(kantoPrefs).toContain('神奈川県')
    })
  })

  describe('getRegionByPrefecture (既存関数)', () => {
    it('東京都が関東地方に属することを確認できる', () => {
      const region = getRegionByPrefecture('東京都')
      expect(region).toBe('関東')
    })

    it('北海道が北海道地方に属することを確認できる', () => {
      const region = getRegionByPrefecture('北海道')
      expect(region).toBe('北海道')
    })

    it('存在しない都道府県名の場合undefinedを返す', () => {
      const region = getRegionByPrefecture('存在しない県')
      expect(region).toBeUndefined()
    })
  })

  describe('isPrefectureInRegion (既存関数)', () => {
    it('東京都が関東地方に属する', () => {
      expect(isPrefectureInRegion('東京都', '関東')).toBe(true)
    })

    it('東京都が近畿地方に属さない', () => {
      expect(isPrefectureInRegion('東京都', '近畿')).toBe(false)
    })

    it('大阪府が近畿地方に属する', () => {
      expect(isPrefectureInRegion('大阪府', '近畿')).toBe(true)
    })
  })
})
