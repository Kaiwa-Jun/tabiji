'use client'

import type { PlaceResult } from '@/lib/maps/places'

/**
 * マップをマーカー位置にスムーズに移動（詳細カード表示用にオフセット調整）
 * 詳細カードが上部に表示されるため、ピンを画面の少し下に配置することで
 * ピンと詳細カードの両方が見やすくなる
 *
 * @param map - Google Maps インスタンス
 * @param lat - マーカーの緯度
 * @param lng - マーカーの経度
 */
function panToMarkerWithOffset(
  map: google.maps.Map,
  lat: number,
  lng: number
): void {
  // 詳細カードの高さ（約150px）+ マージンを考慮して、ピンを画面の下側に配置
  // 既存ピンをタップした場合は、大きなオフセットで画面下部に表示
  const DETAIL_CARD_HEIGHT_OFFSET = 250 // ピクセル単位のオフセット

  // 現在の投影を取得
  const projection = map.getProjection()
  if (!projection) {
    // 投影が利用できない場合は通常のpanToを使用
    map.panTo({ lat, lng })
    return
  }

  // 緯度経度をピクセル座標に変換
  const scale = Math.pow(2, map.getZoom() || 0)
  const worldCoordinate = projection.fromLatLngToPoint(
    new google.maps.LatLng(lat, lng)
  )

  if (!worldCoordinate) {
    map.panTo({ lat, lng })
    return
  }

  // ピクセルオフセットを緯度に変換
  const pixelCoordinate = new google.maps.Point(
    worldCoordinate.x * scale,
    worldCoordinate.y * scale
  )

  // Y座標をオフセット（詳細カードの高さ分）
  const offsetPixelCoordinate = new google.maps.Point(
    pixelCoordinate.x,
    pixelCoordinate.y + DETAIL_CARD_HEIGHT_OFFSET
  )

  // ピクセル座標を緯度経度に変換
  const offsetWorldCoordinate = new google.maps.Point(
    offsetPixelCoordinate.x / scale,
    offsetPixelCoordinate.y / scale
  )

  const offsetLatLng = projection.fromPointToLatLng(offsetWorldCoordinate)

  if (offsetLatLng) {
    // スムーズにアニメーション移動
    map.panTo(offsetLatLng)
  } else {
    map.panTo({ lat, lng })
  }
}

/**
 * ピンアイコンのHTML要素を生成
 *
 * @returns ピンアイコンのHTML要素
 */
function createPinElement(): HTMLElement {
  const pin = document.createElement('div')
  pin.className = 'relative flex items-center justify-center cursor-pointer'
  pin.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-lg">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `
  return pin
}

/**
 * 詳細カードのHTML要素を生成
 * SpotCardと同じデザインパターンを使用
 *
 * @param spot - スポット情報
 * @returns 詳細カードのHTML要素
 */
function createDetailCard(spot: PlaceResult): HTMLElement {
  const container = document.createElement('div')
  container.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2'

  // メインカード
  const card = document.createElement('div')
  card.className =
    'w-64 overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl'

  // 画像エリア
  const imageContainer = document.createElement('div')
  imageContainer.className = 'relative h-32 w-full overflow-hidden bg-gray-200'

  if (spot.photoUrl) {
    const img = document.createElement('img')
    img.src = spot.photoUrl
    img.alt = spot.name
    img.className = 'h-full w-full object-cover'
    imageContainer.appendChild(img)
  } else {
    // 画像がない場合のプレースホルダー
    const placeholder = document.createElement('div')
    placeholder.className = 'flex h-full w-full items-center justify-center'
    placeholder.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `
    imageContainer.appendChild(placeholder)
  }

  // グラデーションオーバーレイ + 情報
  const overlay = document.createElement('div')
  overlay.className =
    'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent p-2.5 pt-6'

  // スポット名 + 評価
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between gap-2'

  const title = document.createElement('h3')
  title.className = 'truncate font-medium text-sm text-white'
  title.textContent = spot.name
  title.title = spot.name
  header.appendChild(title)

  if (spot.rating) {
    const rating = document.createElement('div')
    rating.className = 'flex flex-shrink-0 items-center gap-1'
    rating.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span class="text-xs font-medium text-white">${spot.rating}</span>
    `
    header.appendChild(rating)
  }

  overlay.appendChild(header)

  // 住所
  const address = document.createElement('p')
  address.className = 'mt-1 truncate text-xs text-white/90'
  address.textContent = spot.address
  address.title = spot.address
  overlay.appendChild(address)

  imageContainer.appendChild(overlay)
  card.appendChild(imageContainer)

  // 下向きの矢印（マーカー位置を示す）
  const arrow = document.createElement('div')
  arrow.className = 'absolute left-1/2 top-full -translate-x-1/2'
  arrow.innerHTML = `
    <div class="h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
  `

  container.appendChild(card)
  container.appendChild(arrow)

  return container
}

/**
 * マーカーのカスタムHTML要素を生成
 * ピンアイコンと詳細カード（初期非表示）を含む
 *
 * @param spot - スポット情報
 * @returns マーカー用のHTML要素と詳細カードの要素
 */
function createMarkerContent(spot: PlaceResult): {
  container: HTMLElement
  detailCard: HTMLElement
} {
  const container = document.createElement('div')
  container.className = 'relative'

  // ピンアイコン
  const pin = createPinElement()

  // 詳細カード（初期非表示）
  const detailCard = createDetailCard(spot)
  detailCard.style.display = 'none'

  container.appendChild(detailCard)
  container.appendChild(pin)

  return { container, detailCard }
}

/**
 * スポットマーカーを地図上に追加する（Advanced Markers API + カスタムHTML）
 * 初期状態はピンアイコン、クリックで詳細カード表示、再クリックで閉じる
 *
 * @param map - Google Maps インスタンス
 * @param spots - 表示するスポット配列
 * @param onMarkerClick - マーカークリック時のコールバック（オプション）
 * @returns 作成されたマーカー配列と詳細カード要素の配列
 *
 * @example
 * ```tsx
 * const { markers, detailCards } = addSpotMarkers(map, selectedSpots, (spot) => {
 *   console.log('Clicked:', spot.name)
 * })
 * // 最後のスポットの詳細カードを自動表示
 * if (detailCards.length > 0) {
 *   detailCards[detailCards.length - 1].style.display = 'block'
 * }
 * ```
 */
export function addSpotMarkers(
  map: google.maps.Map,
  spots: PlaceResult[],
  onMarkerClick?: (spot: PlaceResult) => void
): {
  markers: google.maps.marker.AdvancedMarkerElement[]
  detailCards: HTMLElement[]
} {
  const markers: google.maps.marker.AdvancedMarkerElement[] = []
  const detailCards: HTMLElement[] = []

  spots.forEach((spot) => {
    // カスタムHTML要素を作成
    const { container, detailCard } = createMarkerContent(spot)

    // Advanced Marker Elementを作成（contentにカスタムHTML要素を指定）
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: spot.lat, lng: spot.lng },
      content: container,
      title: spot.name,
    })

    // ピンクリック時の処理: 詳細カードの表示/非表示を切り替え
    container.addEventListener('click', () => {
      const isCardVisible = detailCard.style.display !== 'none'

      // 他のすべての詳細カードを閉じる
      detailCards.forEach((card) => {
        card.style.display = 'none'
      })

      // このカードの表示を切り替え
      if (isCardVisible) {
        // 既に開いている場合は閉じる
        detailCard.style.display = 'none'
      } else {
        // 閉じている場合は開く
        detailCard.style.display = 'block'

        // マップをピンの位置にスムーズに移動（詳細カード表示時のみ）
        // 詳細カードが上部に表示されるため、少し下にオフセットして中央に配置
        panToMarkerWithOffset(map, spot.lat, spot.lng)
      }

      // コールバックがあれば実行
      onMarkerClick?.(spot)
    })

    markers.push(marker)
    detailCards.push(detailCard)
  })

  return { markers, detailCards }
}

/**
 * 既存のマーカーをすべて地図から削除する
 *
 * @param markers - 削除するマーカー配列
 *
 * @example
 * ```tsx
 * // コンポーネントのクリーンアップ時に使用
 * useEffect(() => {
 *   return () => {
 *     clearMarkers(markersRef.current)
 *   }
 * }, [])
 * ```
 */
export function clearMarkers(
  markers: google.maps.marker.AdvancedMarkerElement[]
): void {
  markers.forEach((marker) => {
    marker.map = null // Advanced Markersの削除方法
  })
}
