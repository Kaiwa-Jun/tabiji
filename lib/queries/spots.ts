import { searchPlacesByArea } from '@/lib/maps/places'
import type { PlaceResult } from '@/lib/maps/places'

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
