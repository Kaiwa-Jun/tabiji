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
