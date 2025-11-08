/**
 * @jest-environment node
 */

import { extractPrefectureFromAddress, extractAreaFromItineraries } from '@/lib/utils/area'
import type { DayItinerary } from '@/types/models'
import type { PlaceResult } from '@/lib/maps/places'

// テスト用のPlaceResultヘルパー関数
const createPlaceResult = (overrides: Partial<PlaceResult>): PlaceResult => ({
  placeId: 'test-place-id',
  name: 'Test Place',
  address: '',
  lat: 0,
  lng: 0,
  types: [],
  ...overrides,
})

describe('lib/utils/area', () => {
  describe('extractPrefectureFromAddress', () => {
    it('東京都の住所から都道府県名を抽出できる', () => {
      const address = '日本、〒100-0001 東京都千代田区千代田1-1'
      expect(extractPrefectureFromAddress(address)).toBe('東京都')
    })

    it('北海道の住所から都道府県名を抽出できる', () => {
      const address = '日本、〒060-0001 北海道札幌市中央区北一条西2丁目'
      expect(extractPrefectureFromAddress(address)).toBe('北海道')
    })

    it('大阪府の住所から都道府県名を抽出できる', () => {
      const address = '日本、〒530-0001 大阪府大阪市北区梅田1-1-1'
      expect(extractPrefectureFromAddress(address)).toBe('大阪府')
    })

    it('神奈川県の住所から都道府県名を抽出できる', () => {
      const address = '日本、〒220-0012 神奈川県横浜市西区みなとみらい2-2-1'
      expect(extractPrefectureFromAddress(address)).toBe('神奈川県')
    })

    it('沖縄県の住所から都道府県名を抽出できる', () => {
      const address = '日本、〒900-0015 沖縄県那覇市久茂地1-1-1'
      expect(extractPrefectureFromAddress(address)).toBe('沖縄県')
    })

    it('都道府県名が含まれていない場合はundefinedを返す', () => {
      const address = 'USA, New York, 5th Avenue'
      expect(extractPrefectureFromAddress(address)).toBeUndefined()
    })

    it('空文字列の場合はundefinedを返す', () => {
      expect(extractPrefectureFromAddress('')).toBeUndefined()
    })
  })

  describe('extractAreaFromItineraries', () => {
    it('単一日程・単一都道府県の場合、正しく抽出できる', () => {
      const itineraries: DayItinerary[] = [
        {
          dayNumber: 1,
          startPoint: createPlaceResult({
            name: '東京駅',
            address: '日本、〒100-0005 東京都千代田区丸の内1-9-1',
            lat: 35.6812,
            lng: 139.7671,
          }),
          spots: [
            createPlaceResult({
              name: '浅草寺',
              address: '日本、〒111-0032 東京都台東区浅草2-3-1',
              lat: 35.7148,
              lng: 139.7967,
            }),
            createPlaceResult({
              name: 'スカイツリー',
              address: '日本、〒131-0045 東京都墨田区押上1-1-2',
              lat: 35.7101,
              lng: 139.8107,
            }),
          ],
          endPoint: createPlaceResult({
            name: '新宿駅',
            address: '日本、〒160-0023 東京都新宿区西新宿1-1-1',
            lat: 35.6896,
            lng: 139.7006,
          }),
        },
      ]

      expect(extractAreaFromItineraries(itineraries)).toBe('東京都')
    })

    it('複数日程・単一都道府県の場合、正しく抽出できる', () => {
      const itineraries: DayItinerary[] = [
        {
          dayNumber: 1,
          startPoint: createPlaceResult({
            name: '京都駅',
            address: '日本、〒600-8216 京都府京都市下京区東塩小路町',
            lat: 34.9858,
            lng: 135.7587,
          }),
          spots: [
            createPlaceResult({
              name: '清水寺',
              address: '日本、〒605-0862 京都府京都市東山区清水1-294',
              lat: 34.995,
              lng: 135.785,
            }),
          ],
          endPoint: createPlaceResult({
            name: 'ホテル',
            address: '日本、〒604-8005 京都府京都市中京区河原町通四条上ル',
            lat: 35.0042,
            lng: 135.768,
          }),
        },
        {
          dayNumber: 2,
          startPoint: createPlaceResult({
            name: 'ホテル',
            address: '日本、〒604-8005 京都府京都市中京区河原町通四条上ル',
            lat: 35.0042,
            lng: 135.768,
          }),
          spots: [
            createPlaceResult({
              name: '金閣寺',
              address: '日本、〒603-8361 京都府京都市北区金閣寺町1',
              lat: 35.0394,
              lng: 135.7292,
            }),
          ],
          endPoint: createPlaceResult({
            name: '京都駅',
            address: '日本、〒600-8216 京都府京都市下京区東塩小路町',
            lat: 34.9858,
            lng: 135.7587,
          }),
        },
      ]

      expect(extractAreaFromItineraries(itineraries)).toBe('京都府')
    })

    it('複数都道府県の場合、最も多く登場する都道府県を返す', () => {
      const itineraries: DayItinerary[] = [
        {
          dayNumber: 1,
          startPoint: createPlaceResult({
            name: '東京駅',
            address: '日本、〒100-0005 東京都千代田区丸の内1-9-1',
            lat: 35.6812,
            lng: 139.7671,
          }),
          spots: [
            createPlaceResult({
              name: '浅草寺',
              address: '日本、〒111-0032 東京都台東区浅草2-3-1',
              lat: 35.7148,
              lng: 139.7967,
            }),
            createPlaceResult({
              name: 'スカイツリー',
              address: '日本、〒131-0045 東京都墨田区押上1-1-2',
              lat: 35.7101,
              lng: 139.8107,
            }),
          ],
          endPoint: createPlaceResult({
            name: 'ホテル',
            address: '日本、〒220-0012 神奈川県横浜市西区みなとみらい2-2-1',
            lat: 35.4537,
            lng: 139.6365,
          }),
        },
        {
          dayNumber: 2,
          startPoint: createPlaceResult({
            name: 'ホテル',
            address: '日本、〒220-0012 神奈川県横浜市西区みなとみらい2-2-1',
            lat: 35.4537,
            lng: 139.6365,
          }),
          spots: [
            createPlaceResult({
              name: '中華街',
              address: '日本、〒231-0023 神奈川県横浜市中区山下町',
              lat: 35.4437,
              lng: 139.6465,
            }),
          ],
          endPoint: createPlaceResult({
            name: '横浜駅',
            address: '日本、〒220-0005 神奈川県横浜市西区南幸1-1-1',
            lat: 35.4659,
            lng: 139.6220,
          }),
        },
      ]

      // 東京都: 3回(スタート、浅草寺、スカイツリー)
      // 神奈川県: 4回(ホテル×2、中華街、横浜駅)
      expect(extractAreaFromItineraries(itineraries)).toBe('神奈川県')
    })

    it('住所がない場合でもエラーにならない', () => {
      const itineraries: DayItinerary[] = [
        {
          dayNumber: 1,
          startPoint: createPlaceResult({
            name: 'カスタムスポット',
            address: '',
            lat: 35.6812,
            lng: 139.7671,
          }),
          spots: [],
          endPoint: createPlaceResult({
            name: 'カスタムゴール',
            address: '',
            lat: 35.6896,
            lng: 139.7006,
          }),
        },
      ]

      expect(extractAreaFromItineraries(itineraries)).toBe('')
    })

    it('空の日程配列の場合は空文字列を返す', () => {
      expect(extractAreaFromItineraries([])).toBe('')
    })
  })
})
