/**
 * 旅程最適化ロジックの型定義
 */

/**
 * スポット情報の型定義
 */
export interface Spot {
  /** スポットID */
  id: string
  /** スポット名 */
  name: string
  /** 緯度 */
  lat: number
  /** 経度 */
  lng: number
}

/**
 * 最適化されたスポット情報（日番号・訪問順序付き）
 */
export interface OptimizedSpot extends Spot {
  /** 日番号（1始まり） */
  dayNumber: number
  /** その日の訪問順序（1始まり） */
  orderIndex: number
}
