/**
 * 日本の地方と都道府県の定数定義
 * プラン作成時のエリア選択で使用
 */

/**
 * 日本の地方一覧
 */
export const REGIONS = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄',
] as const

/**
 * 地方型
 */
export type Region = (typeof REGIONS)[number]

/**
 * 都道府県の詳細情報（座標・ズーム含む）
 */
export interface Prefecture {
  /** JIS都道府県コード */
  code: string
  /** 都道府県名 */
  name: string
  /** 中心緯度 */
  lat: number
  /** 中心経度 */
  lng: number
  /** 適切なズームレベル（1-20） */
  zoom: number
}

/**
 * 地方データ（座標付き都道府県リスト）
 */
export interface RegionData {
  /** 地方名 */
  name: Region
  /** 都道府県リスト（座標付き） */
  prefectures: Prefecture[]
}

/**
 * 地方ごとの都道府県マッピング
 */
export const PREFECTURES_BY_REGION: Record<Region, readonly string[]> = {
  北海道: ['北海道'],
  東北: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  関東: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  中部: [
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
  ],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  中国: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  四国: ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': [
    '福岡県',
    '佐賀県',
    '長崎県',
    '熊本県',
    '大分県',
    '宮崎県',
    '鹿児島県',
    '沖縄県',
  ],
}

/**
 * 全都道府県の一覧（フラット配列）
 */
export const ALL_PREFECTURES: readonly string[] = Object.values(PREFECTURES_BY_REGION).flat()

/**
 * 指定した地方の都道府県リストを取得
 *
 * @param region - 地方名
 * @returns 都道府県の配列
 *
 * @example
 * ```ts
 * const prefectures = getPrefecturesByRegion('関東')
 * // ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県']
 * ```
 */
export function getPrefecturesByRegion(region: Region): readonly string[] {
  return PREFECTURES_BY_REGION[region]
}

/**
 * 指定した都道府県が属する地方を取得
 *
 * @param prefecture - 都道府県名
 * @returns 地方名、見つからない場合はundefined
 *
 * @example
 * ```ts
 * const region = getRegionByPrefecture('東京都')
 * // '関東'
 * ```
 */
export function getRegionByPrefecture(prefecture: string): Region | undefined {
  for (const [region, prefectures] of Object.entries(PREFECTURES_BY_REGION)) {
    if (prefectures.includes(prefecture)) {
      return region as Region
    }
  }
  return undefined
}

/**
 * 指定した都道府県が指定した地方に属するかチェック
 *
 * @param prefecture - 都道府県名
 * @param region - 地方名
 * @returns 属する場合true
 *
 * @example
 * ```ts
 * isPrefectureInRegion('東京都', '関東') // true
 * isPrefectureInRegion('東京都', '関西') // false
 * ```
 */
export function isPrefectureInRegion(prefecture: string, region: Region): boolean {
  return PREFECTURES_BY_REGION[region].includes(prefecture)
}

/**
 * 地方ごとの都道府県データ（座標・ズームレベル付き）
 * 緯度経度は各都道府県の中心付近を設定
 */
export const REGION_DATA: RegionData[] = [
  {
    name: '北海道',
    prefectures: [
      { code: '01', name: '北海道', lat: 43.0642, lng: 141.3469, zoom: 7 },
    ],
  },
  {
    name: '東北',
    prefectures: [
      { code: '02', name: '青森県', lat: 40.8244, lng: 140.74, zoom: 9 },
      { code: '03', name: '岩手県', lat: 39.7036, lng: 141.1527, zoom: 9 },
      { code: '04', name: '宮城県', lat: 38.2682, lng: 140.8719, zoom: 9 },
      { code: '05', name: '秋田県', lat: 39.7186, lng: 140.1024, zoom: 9 },
      { code: '06', name: '山形県', lat: 38.2404, lng: 140.3633, zoom: 9 },
      { code: '07', name: '福島県', lat: 37.7503, lng: 140.4676, zoom: 9 },
    ],
  },
  {
    name: '関東',
    prefectures: [
      { code: '08', name: '茨城県', lat: 36.3418, lng: 140.4468, zoom: 9 },
      { code: '09', name: '栃木県', lat: 36.5658, lng: 139.8836, zoom: 9 },
      { code: '10', name: '群馬県', lat: 36.3911, lng: 139.0608, zoom: 9 },
      { code: '11', name: '埼玉県', lat: 35.8569, lng: 139.6489, zoom: 10 },
      { code: '12', name: '千葉県', lat: 35.6047, lng: 140.1233, zoom: 10 },
      { code: '13', name: '東京都', lat: 35.6812, lng: 139.7671, zoom: 11 },
      { code: '14', name: '神奈川県', lat: 35.4478, lng: 139.6425, zoom: 10 },
    ],
  },
  {
    name: '中部',
    prefectures: [
      { code: '15', name: '新潟県', lat: 37.9026, lng: 139.0236, zoom: 9 },
      { code: '16', name: '富山県', lat: 36.6953, lng: 137.2113, zoom: 10 },
      { code: '17', name: '石川県', lat: 36.5946, lng: 136.6256, zoom: 10 },
      { code: '18', name: '福井県', lat: 36.0652, lng: 136.2216, zoom: 10 },
      { code: '19', name: '山梨県', lat: 35.6642, lng: 138.5684, zoom: 10 },
      { code: '20', name: '長野県', lat: 36.6513, lng: 138.1809, zoom: 9 },
      { code: '21', name: '岐阜県', lat: 35.3912, lng: 136.7223, zoom: 9 },
      { code: '22', name: '静岡県', lat: 34.9769, lng: 138.3831, zoom: 9 },
      { code: '23', name: '愛知県', lat: 35.1802, lng: 136.9066, zoom: 10 },
    ],
  },
  {
    name: '近畿',
    prefectures: [
      { code: '24', name: '三重県', lat: 34.7303, lng: 136.5086, zoom: 9 },
      { code: '25', name: '滋賀県', lat: 35.0045, lng: 135.8686, zoom: 10 },
      { code: '26', name: '京都府', lat: 35.0211, lng: 135.7556, zoom: 10 },
      { code: '27', name: '大阪府', lat: 34.6863, lng: 135.52, zoom: 11 },
      { code: '28', name: '兵庫県', lat: 34.6913, lng: 135.183, zoom: 9 },
      { code: '29', name: '奈良県', lat: 34.6851, lng: 135.8329, zoom: 10 },
      { code: '30', name: '和歌山県', lat: 34.2261, lng: 135.1675, zoom: 9 },
    ],
  },
  {
    name: '中国',
    prefectures: [
      { code: '31', name: '鳥取県', lat: 35.5014, lng: 134.2381, zoom: 10 },
      { code: '32', name: '島根県', lat: 35.4723, lng: 133.0505, zoom: 9 },
      { code: '33', name: '岡山県', lat: 34.6617, lng: 133.9349, zoom: 10 },
      { code: '34', name: '広島県', lat: 34.3963, lng: 132.4596, zoom: 9 },
      { code: '35', name: '山口県', lat: 34.186, lng: 131.4714, zoom: 9 },
    ],
  },
  {
    name: '四国',
    prefectures: [
      { code: '36', name: '徳島県', lat: 34.0658, lng: 134.5594, zoom: 10 },
      { code: '37', name: '香川県', lat: 34.3401, lng: 134.0434, zoom: 10 },
      { code: '38', name: '愛媛県', lat: 33.8416, lng: 132.7657, zoom: 9 },
      { code: '39', name: '高知県', lat: 33.5597, lng: 133.5311, zoom: 9 },
    ],
  },
  {
    name: '九州・沖縄',
    prefectures: [
      { code: '40', name: '福岡県', lat: 33.6064, lng: 130.4181, zoom: 10 },
      { code: '41', name: '佐賀県', lat: 33.2494, lng: 130.2989, zoom: 10 },
      { code: '42', name: '長崎県', lat: 32.7503, lng: 129.8777, zoom: 9 },
      { code: '43', name: '熊本県', lat: 32.7898, lng: 130.7417, zoom: 9 },
      { code: '44', name: '大分県', lat: 33.2382, lng: 131.6126, zoom: 9 },
      { code: '45', name: '宮崎県', lat: 31.9077, lng: 131.4202, zoom: 9 },
      { code: '46', name: '鹿児島県', lat: 31.5602, lng: 130.5581, zoom: 8 },
      { code: '47', name: '沖縄県', lat: 26.2124, lng: 127.6809, zoom: 9 },
    ],
  },
]

/**
 * 都道府県名から座標データを取得
 *
 * @param name - 都道府県名
 * @returns 都道府県データ、見つからない場合はundefined
 *
 * @example
 * ```ts
 * const prefecture = getPrefectureByName('東京都')
 * // { code: '13', name: '東京都', lat: 35.6812, lng: 139.7671, zoom: 11 }
 * ```
 */
export function getPrefectureByName(name: string): Prefecture | undefined {
  for (const region of REGION_DATA) {
    const prefecture = region.prefectures.find((p) => p.name === name)
    if (prefecture) return prefecture
  }
  return undefined
}

/**
 * 地方名から都道府県リスト（座標付き）を取得
 *
 * @param regionName - 地方名
 * @returns 都道府県データの配列
 *
 * @example
 * ```ts
 * const prefectures = getPrefecturesByRegionName('関東')
 * // [{ code: '08', name: '茨城県', ... }, ...]
 * ```
 */
export function getPrefecturesByRegionName(regionName: Region): Prefecture[] {
  const region = REGION_DATA.find((r) => r.name === regionName)
  return region ? region.prefectures : []
}
