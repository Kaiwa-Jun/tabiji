'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

  // onMapReadyをメモ化してメモリリークを防止
  const stableOnMapReady = useCallback(
    (map: google.maps.Map) => {
      onMapReady?.(map)
    },
    [onMapReady]
  )

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

        // 既にマップインスタンスが存在する場合は再利用して座標のみ更新
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
          // Advanced Markers APIを使用するためにMap IDが必要
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          // マップのUIオプション
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          // POI（Points of Interest）のアイコンをクリック不可にする
          clickableIcons: false,
          // マップスタイル: POIのラベルとアイコンを非表示
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        if (isMounted) {
          mapInstanceRef.current = map
          setIsLoading(false)
          // マップ初期化完了を通知
          stableOnMapReady(map)
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

    // クリーンアップ関数: マップインスタンスを明示的に破棄
    return () => {
      isMounted = false
      // Google Maps インスタンスのクリーンアップ
      if (mapInstanceRef.current) {
        // Google Maps API にはdestroy()メソッドがないため、
        // 参照を削除してガベージコレクションに任せる
        // google.maps.eventが存在する場合のみクリーンアップ
        if (typeof google !== 'undefined' && google.maps?.event?.clearInstanceListeners) {
          google.maps.event.clearInstanceListeners(mapInstanceRef.current)
        }
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, zoom, stableOnMapReady])

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
