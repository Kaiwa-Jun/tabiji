'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { SearchModalProvider, useSearchModal } from '@/contexts/search-modal-context'
import { usePlanForm } from '@/contexts/plan-form-context'
import { SearchBarTrigger } from './spot-selection/search-bar-trigger'
import { SearchModal } from './spot-selection/search-modal'
import { TabSwitcher } from './spot-selection/tab-switcher'
import { RouteListView } from '../route-list-view'
import {
  SelectedSpotsSheet,
  type SelectedSpotsSheetRef,
  type SheetState,
} from '@/components/plan/selected-spots-sheet'
import {
  addSpotMarkers,
  clearMarkers,
  panToMarkerWithOffset,
} from '@/components/map/spot-marker'

/**
 * ステップ3: スポット選択コンポーネント（内部実装）
 * useSearchModalフックを使用するため、Provider内部に配置
 */
function SpotSelectionContent() {
  const {
    openModal,
    selectedSpots,
    removeSpot,
    isOpen: isModalOpen,
    searchResults,
  } = useSearchModal()
  const { formData, updateFormData } = usePlanForm()
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const searchResultMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const detailCardsRef = useRef<HTMLElement[]>([])
  const searchResultDetailCardsRef = useRef<HTMLElement[]>([])
  const sheetRef = useRef<SelectedSpotsSheetRef>(null)
  const [sheetState, setSheetState] = useState<SheetState>('minimized')
  const [activeTab, setActiveTab] = useState<'map' | 'route-list'>('map')
  const visibleDetailCardIndexRef = useRef<number | null>(null)
  const visibleSearchResultCardIndexRef = useRef<number | null>(null)
  const planCreatedRef = useRef<boolean>(false)

  // マップ初期化完了時のコールバック
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  // 選択されたスポット数をPlanFormContextに同期
  useEffect(() => {
    updateFormData({ selectedSpotsCount: selectedSpots.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpots.length])

  // プレビューモードに切り替わったときにプラン作成処理を実行
  useEffect(() => {
    if (formData.isPreviewMode && !planCreatedRef.current && selectedSpots.length >= 2) {
      console.log('[useEffect] プレビューモードに切り替わりました')
      console.log('[useEffect] プラン作成処理を開始します')
      console.log('[useEffect] 選択されたスポット数:', selectedSpots.length)

      // Phase 3で以下の処理を実装予定:
      // 1. 訪問順序の最適化
      // 2. スポット間の移動時間取得
      // 3. 訪問時刻の自動計算
      // 4. 日ごとの配分

      // 仮実装: optimizedSpotsに選択されたスポットをそのまま設定
      updateFormData({ optimizedSpots: selectedSpots })
      planCreatedRef.current = true

      // タブをマップに戻す
      setActiveTab('map')
    }

    // プレビューモードを解除したらフラグをリセット
    if (!formData.isPreviewMode && planCreatedRef.current) {
      planCreatedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isPreviewMode, selectedSpots])

  // スポットカードのスクロール時に対応するピンを中央に表示
  const handleSpotChange = useCallback(
    (index: number) => {
      if (!mapRef.current || !selectedSpots[index]) return

      const spot = selectedSpots[index]

      // スポットカードスワイプ時は詳細カードを表示しない
      // ピンクリック時のみ詳細カードを表示する仕様のため、
      // ここでは詳細カードの表示制御は行わない

      // マップを対応するスポットの位置にスムーズに移動
      // シート状態に応じてオフセット値を変更
      // expanded（展開）: 30px（シートが高いため、オフセットを小さくしてピンを上に表示）
      // minimized（最小化）: 100px（通常のオフセット）
      const offset = sheetState === 'expanded' ? 30 : 100
      panToMarkerWithOffset(mapRef.current, spot.lat, spot.lng, offset)
    },
    [selectedSpots, sheetState]
  )

  // 選択されたスポットをカスタムデザインのマーカーとして表示
  useEffect(() => {
    if (!mapRef.current) return

    const previousSpotsCount = markersRef.current.length

    // 既存のマーカーをクリア
    clearMarkers(markersRef.current)

    // 新しいマーカーを追加（カスタムHTML要素を使用）
    const { markers, detailCards } = addSpotMarkers(
      mapRef.current,
      selectedSpots,
      (spot) => {
        // マーカークリック時: 詳細カードの表示/非表示をトグル
        const spotIndex = selectedSpots.findIndex((s) => s.placeId === spot.placeId)
        if (spotIndex !== -1) {
          // すべての詳細カードを閉じる
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // 検索結果の詳細カードも閉じる
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleDetailCardIndexRef.current === spotIndex) {
            visibleDetailCardIndexRef.current = null
            visibleSearchResultCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (detailCardsRef.current[spotIndex]) {
              detailCardsRef.current[spotIndex].style.display = 'block'
              // クリックされたマーカーのzIndexを最前面に
              markersRef.current[spotIndex].zIndex = 9999
            }
            visibleDetailCardIndexRef.current = spotIndex
            visibleSearchResultCardIndexRef.current = null
          }

          // スポットカードを中央にスクロール
          sheetRef.current?.scrollToSpot(spotIndex)
        }
      },
      '#ef4444', // 赤色
      true // スポット名ラベルを表示
    )

    markersRef.current = markers
    detailCardsRef.current = detailCards

    // 新しいスポットが追加された場合、最後に追加されたスポットにフォーカス
    if (selectedSpots.length > previousSpotsCount) {
      const latestSpot = selectedSpots[selectedSpots.length - 1]
      const latestIndex = selectedSpots.length - 1

      // ズームレベルを設定（詳細が見えるレベル）
      mapRef.current.setZoom(16)

      // マップを新しいスポットの位置にスムーズに移動
      // panTo()を使用することでアニメーション付きの移動になる
      mapRef.current.panTo({ lat: latestSpot.lat, lng: latestSpot.lng })

      // ピン上の詳細カードは使用しないため、自動表示はコメントアウト
      // 将来的に必要になった場合は、以下のコメントを解除
      // if (detailCards.length > 0) {
      //   const lastDetailCard = detailCards[detailCards.length - 1]
      //   lastDetailCard.style.display = 'block'
      // }

      // 選択済みスポットシートを最後のスポット（一番右）にスクロール
      // setTimeoutで少し遅延させることで、モーダルが閉じてシートが表示された後にスクロール・展開
      setTimeout(() => {
        sheetRef.current?.scrollToSpot(latestIndex)
        sheetRef.current?.setSheetState('expanded')
      }, 100)
    }

    // クリーンアップ
    return () => {
      clearMarkers(markersRef.current)
      markersRef.current = []
      detailCardsRef.current = []
    }
  }, [selectedSpots])

  // 検索結果スポットを青のマーカーとして表示
  useEffect(() => {
    if (!mapRef.current) return

    // 既存の検索結果マーカーをクリア
    clearMarkers(searchResultMarkersRef.current)

    // 選択済みスポットのplaceIdリストを作成（重複表示を避けるため）
    const selectedPlaceIds = new Set(selectedSpots.map((spot) => spot.placeId))

    // 選択済みでない検索結果のみをフィルタリング
    const unselectedSearchResults = searchResults.filter(
      (spot) => !selectedPlaceIds.has(spot.placeId)
    )

    // 青のマーカーを追加（詳細カード表示可能、クリックで詳細表示）
    const { markers, detailCards } = addSpotMarkers(
      mapRef.current,
      unselectedSearchResults,
      (spot) => {
        // マーカークリック時: 詳細カードの表示/非表示をトグル
        const spotIndex = unselectedSearchResults.findIndex((s) => s.placeId === spot.placeId)
        if (spotIndex !== -1) {
          // すべての検索結果詳細カードを閉じる
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // 選択済みスポットの詳細カードも閉じる
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleSearchResultCardIndexRef.current === spotIndex) {
            visibleSearchResultCardIndexRef.current = null
            visibleDetailCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (detailCards[spotIndex]) {
              detailCards[spotIndex].style.display = 'block'
              // クリックされたマーカーのzIndexを最前面に
              markers[spotIndex].zIndex = 9999
            }
            visibleSearchResultCardIndexRef.current = spotIndex
            visibleDetailCardIndexRef.current = null
          }
        }
      },
      '#3b82f6', // 青色（Tailwind blue-500相当）
      true // スポット名ラベルを表示
    )

    searchResultMarkersRef.current = markers
    searchResultDetailCardsRef.current = detailCards

    // クリーンアップ
    return () => {
      clearMarkers(searchResultMarkersRef.current)
      searchResultMarkersRef.current = []
      searchResultDetailCardsRef.current = []
    }
  }, [searchResults, selectedSpots])

  return (
    <div className="relative h-full w-full">
      {/* Google Map - 常にレンダリング（状態を保持するため） */}
      <GoogleMapWrapper
        lat={JAPAN_CENTER.lat}
        lng={JAPAN_CENTER.lng}
        zoom={JAPAN_ZOOM}
        height="100%"
        width="100%"
        onMapReady={handleMapReady}
      />

      {/* 通常モード時: 検索バー / プレビューモード時: タブ切り替え */}
      {formData.isPreviewMode ? (
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      ) : (
        <SearchBarTrigger onClick={openModal} />
      )}

      {/* 旅程リストビュー（プレビューモード時かつ旅程リストタブ選択時のみ表示） */}
      {/* モーダル形式でマップの上に重ねて表示 */}
      {formData.isPreviewMode && activeTab === 'route-list' && <RouteListView />}

      {/* 検索モーダル */}
      <SearchModal />

      {/* スライドアップシート：選択済みスポット表示（モーダルと旅程リストが閉じている時のみ表示） */}
      {!isModalOpen && activeTab === 'map' && (
        <SelectedSpotsSheet
          ref={sheetRef}
          spots={selectedSpots}
          onRemove={removeSpot}
          onSpotChange={handleSpotChange}
          onSheetStateChange={setSheetState}
          isPreviewMode={formData.isPreviewMode}
        />
      )}
    </div>
  )
}

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * マップUIを画面いっぱいに表示
 */
export function SpotSelectionStep() {
  return (
    <SearchModalProvider>
      <SpotSelectionContent />
    </SearchModalProvider>
  )
}
