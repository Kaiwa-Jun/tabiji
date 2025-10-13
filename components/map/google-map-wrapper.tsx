'use client'

import dynamic from 'next/dynamic'

/**
 * Google Mapコンポーネントを動的にインポート
 * SSR無効化 + ローディング表示を提供
 */
const GoogleMapComponent = dynamic(
  () => import('./google-map').then((mod) => ({ default: mod.GoogleMap })),
  {
    ssr: false, // サーバーサイドレンダリング無効（ブラウザAPIのため）
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">地図を準備しています...</p>
        </div>
      </div>
    ),
  }
)

export interface GoogleMapWrapperProps {
  /** 中心座標の緯度 */
  lat: number
  /** 中心座標の経度 */
  lng: number
  /** ズームレベル（1-20、デフォルト: 12） */
  zoom?: number
  /** マップの高さ（CSS値、デフォルト: '400px'） */
  height?: string
  /** マップの幅（CSS値、デフォルト: '100%'） */
  width?: string
  /** カスタムクラス名 */
  className?: string
  /** マップ初期化完了時のコールバック */
  onMapReady?: (map: google.maps.Map) => void
}

/**
 * Google Map ラッパーコンポーネント
 * 動的インポートでパフォーマンスを最適化
 *
 * 【使い方】
 * このコンポーネントを使用することで：
 * - 必要なページでのみGoogle Maps APIを読み込み（約200KBの削減）
 * - SSR時のエラーを防止
 * - ローディング状態を自動表示
 *
 * @example
 * ```tsx
 * // プラン詳細ページなど、マップが必要なページで使用
 * <GoogleMapWrapper
 *   lat={35.6812}  // 東京駅
 *   lng={139.7671}
 *   zoom={15}
 *   height="500px"
 * />
 * ```
 */
export function GoogleMapWrapper({
  lat,
  lng,
  zoom = 12,
  height = '400px',
  width = '100%',
  className = '',
  onMapReady,
}: GoogleMapWrapperProps) {
  return (
    <div style={{ height, width }} className={className}>
      <GoogleMapComponent
        lat={lat}
        lng={lng}
        zoom={zoom}
        height="100%"
        width="100%"
        onMapReady={onMapReady}
      />
    </div>
  )
}
