import { searchPlacesByArea } from '@/lib/maps/places'
import type { PlaceResult } from '@/lib/maps/places'
import type { Region } from '@/lib/constants/areas'

/**
 * キーワードとエリアでスポット検索
 * @param keyword - 検索キーワード
 * @param prefecture - 都道府県名（オプション）
 * @param types - スポットタイプでフィルタリング（オプション）
 * @param nearLocation - 検索の中心位置（位置ベース検索用、オプション）
 * @param radius - 検索半径（メートル単位、デフォルト: 5000m）
 * @returns 検索結果のスポット配列
 */
export async function searchSpotsByKeyword(
  keyword: string,
  prefecture?: string,
  types?: string[],
  nearLocation?: { lat: number; lng: number },
  radius: number = 5000
): Promise<PlaceResult[]> {
  if (!keyword.trim()) return []

  try {
    // 駅・空港検索の場合、キーワードの強化
    let enhancedKeyword = keyword
    if (types && types.length > 0) {
      // 駅・空港を検索する場合
      const isStationSearch = types.some((type) =>
        ['train_station', 'transit_station', 'subway_station', 'airport'].includes(type)
      )

      // 宿泊施設を検索する場合
      const isAccommodationSearch = types.some((type) =>
        ['lodging', 'hotel', 'resort_hotel'].includes(type)
      )

      if (isStationSearch) {
        // 駅・空港検索の場合、「駅 空港」を追加して広く検索
        // 例: "仙台" → "仙台 駅 空港"
        if (!keyword.includes('駅') && !keyword.includes('空港')) {
          enhancedKeyword = `${keyword} 駅 空港`
        }
      } else if (isAccommodationSearch && !keyword.includes('ホテル') && !keyword.includes('旅館')) {
        // 宿泊施設の場合、「ホテル」を追加（ただし既に含まれていない場合のみ）
        enhancedKeyword = `${keyword}ホテル`
      }
    }

    // エリア指定がある場合は「都道府県名 + キーワード」で検索
    // ない場合はキーワードのみで検索（「日本」プレフィックスを削除）
    const searchQuery = prefecture ? `${prefecture} ${enhancedKeyword}` : enhancedKeyword

    // typesが指定されている場合（駅・空港・宿泊施設など）は「観光地」キーワードを付けない
    const appendTouristKeyword = !types || types.length === 0

    console.log('[searchSpotsByKeyword] 🔍 クエリ構築:', {
      originalKeyword: keyword,
      enhancedKeyword,
      prefecture,
      types,
      searchQuery,
      appendTouristKeyword,
      nearLocation,
      radius,
    })

    const results = await searchPlacesByArea(searchQuery, {
      limit: 20,
      types,
      appendTouristKeyword,
      ...(nearLocation && { location: nearLocation, radius }),
    })

    console.log('[searchSpotsByKeyword] ✅ 検索完了:', {
      resultCount: results.length,
    })

    return results
  } catch (error) {
    console.error('[searchSpotsByKeyword] ❌ Error:', error)
    return []
  }
}

/**
 * エリア別人気スポット検索
 * @param prefecture - 都道府県名
 * @returns 検索結果のスポット配列
 */
export async function searchPopularSpotsByArea(
  prefecture: string
): Promise<PlaceResult[]> {
  if (!prefecture) return []

  try {
    // 「都道府県名 + 観光地」で人気スポットを検索
    const searchQuery = `${prefecture} 観光地`

    const results = await searchPlacesByArea(searchQuery, { limit: 20 })
    return results
  } catch (error) {
    console.error('[searchPopularSpotsByArea] Error:', error)
    return []
  }
}

/**
 * 地域別人気スポット検索
 * @param region - 地域名（例: "関東", "東北"）
 * @returns 検索結果のスポット配列
 */
export async function searchPopularSpotsByRegion(
  region: Region
): Promise<PlaceResult[]> {
  if (!region) return []

  try {
    // 「地域名 + 観光地」で人気スポットを検索
    const searchQuery = `${region} 観光地`

    const results = await searchPlacesByArea(searchQuery, { limit: 20 })
    return results
  } catch (error) {
    console.error('[searchPopularSpotsByRegion] Error:', error)
    return []
  }
}

/**
 * おすすめスポット検索（ハイブリッドアプローチ）
 * 選択済みスポットがない場合: 日本の人気観光地
 * 選択済みスポットがある場合: 最後に選択したスポットと同じエリアの人気スポット
 * @param selectedSpots - 選択済みスポット配列
 * @returns 検索結果のスポット配列
 */
export async function searchRecommendedSpots(
  selectedSpots: PlaceResult[]
): Promise<PlaceResult[]> {
  try {
    if (selectedSpots.length === 0) {
      // 初回: 日本の人気観光地を取得
      const results = await searchPlacesByArea('日本 観光地', { limit: 20 })
      return results
    } else {
      // 2回目以降: 最後に選択したスポットの都道府県から推薦
      const lastSpot = selectedSpots[selectedSpots.length - 1]
      const prefecture = extractPrefectureFromAddress(lastSpot.address)

      if (prefecture) {
        const results = await searchPopularSpotsByArea(prefecture)
        return results
      } else {
        // 都道府県を抽出できない場合は日本全体から
        const results = await searchPlacesByArea('日本 観光地', { limit: 20 })
        return results
      }
    }
  } catch (error) {
    console.error('[searchRecommendedSpots] Error:', error)
    return []
  }
}

/**
 * 住所から都道府県名を抽出
 * @param address - 住所文字列
 * @returns 都道府県名（例: "東京都", "京都府"）
 */
function extractPrefectureFromAddress(address: string): string | null {
  // 都道府県のパターンマッチング
  const prefecturePattern = /(北海道|.+?[都道府県])/
  const match = address.match(prefecturePattern)
  return match ? match[1] : null
}
