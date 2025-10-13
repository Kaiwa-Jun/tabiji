'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMapsSafely } from '@/lib/maps/loader'

export interface GoogleMapProps {
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
 * Google Map 基本コンポーネント
 * Google Maps JavaScript APIを使用して地図を表示
 *
 * @example
 * ```tsx
 * <GoogleMap
 *   lat={35.6812}
 *   lng={139.7671}
 *   zoom={15}
 *   height="500px"
 * />
 * ```
 */
export function GoogleMap({
  lat,
  lng,
  zoom = 12,
  height = '400px',
  width = '100%',
  className = '',
  onMapReady,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // マップの初期化
    async function initMap() {
      try {
        if (!isMounted) return

        setIsLoading(true)
        setError(null)

        // Google Maps APIを読み込み
        const google = await loadGoogleMapsSafely()

        if (!isMounted) return

        if (!google) {
          throw new Error('Google Maps APIの読み込みに失敗しました')
        }

        // 既にマップインスタンスが存在する場合は再利用
        if (mapInstanceRef.current && mapRef.current && isMounted) {
          // 中心座標を更新
          mapInstanceRef.current.setCenter({ lat, lng })
          mapInstanceRef.current.setZoom(zoom)
          setIsLoading(false)
          return
        }

        // マップコンテナが存在するか確認
        if (!mapRef.current) {
          // React Strict Modeでアンマウント→再マウントされた場合は処理をスキップ
          if (!isMounted) return
          throw new Error('マップコンテナが見つかりません')
        }

        // マップインスタンスを作成
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom,
          // マップのUIオプション
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        })

        if (isMounted) {
          mapInstanceRef.current = map
          setIsLoading(false)
          // マップ初期化完了を通知
          onMapReady?.(map)
        }
      } catch (err) {
        if (isMounted) {
          console.error('[GoogleMap] Failed to initialize map:', err)
          setError(
            err instanceof Error ? err.message : '地図の初期化に失敗しました'
          )
          setIsLoading(false)
        }
      }
    }

    initMap()

    // クリーンアップ関数
    return () => {
      isMounted = false
    }
    // onMapReadyは関数なので依存配列に含めない（親で useCallback を使うべき）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, zoom])

  // マップコンテナは常にレンダリング（ローディング/エラーはオーバーレイで表示）
  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* マップコンテナ（常に存在） */}
      <div
        ref={mapRef}
        className="h-full w-full"
        data-testid="google-map"
      />

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-600">地図を読み込んでいます...</p>
          </div>
        </div>
      )}

      {/* エラーオーバーレイ */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-sm text-red-600">地図の読み込みに失敗しました</p>
            <p className="mt-1 text-xs text-gray-500">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
