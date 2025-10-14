import { searchPlacesByArea } from '@/lib/maps/places'
import type { PlaceResult } from '@/lib/maps/places'
import type { Region } from '@/lib/constants/areas'

/**
 * キーワードとエリアでスポット検索
 * @param keyword - 検索キーワード
 * @param prefecture - 都道府県名（オプション）
 * @returns 検索結果のスポット配列
 */
export async function searchSpotsByKeyword(
  keyword: string,
  prefecture?: string
): Promise<PlaceResult[]> {
  if (!keyword.trim()) return []

  try {
    // エリア指定がある場合は「都道府県名 + キーワード」で検索
    // ない場合は「日本 + キーワード」で検索
    const searchQuery = prefecture ? `${prefecture} ${keyword}` : `日本 ${keyword}`

    const results = await searchPlacesByArea(searchQuery, { limit: 20 })
    return results
  } catch (error) {
    console.error('[searchSpotsByKeyword] Error:', error)
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
