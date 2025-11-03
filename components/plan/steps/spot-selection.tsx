'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { differenceInDays } from 'date-fns'
import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'
import { JAPAN_CENTER, JAPAN_ZOOM } from '@/lib/maps/constants'
import { useSearchModal } from '@/contexts/search-modal-context'
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
import { generatePlan } from '@/lib/itinerary/plan-generator'
import { generatePlanWithEndpoints } from '@/lib/itinerary/plan-generator-with-endpoints'
import { decodePolylineToLatLngs } from '@/lib/maps/polyline-decoder'
import type { PlaceResult } from '@/lib/maps/places'
import { debugLog } from '@/lib/debug-logger'

/**
 * ステップ3: スポット選択コンポーネント
 * useSearchModalフックを使用
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
  const endpointMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const detailCardsRef = useRef<HTMLElement[]>([])
  const searchResultDetailCardsRef = useRef<HTMLElement[]>([])
  const endpointDetailCardsRef = useRef<HTMLElement[]>([])
  const sheetRef = useRef<SelectedSpotsSheetRef>(null)
  const [sheetState, setSheetState] = useState<SheetState>('minimized')
  const [activeTab, setActiveTab] = useState<'map' | 'route-list'>('route-list')
  const [isMapReady, setIsMapReady] = useState(false)
  const visibleDetailCardIndexRef = useRef<number | null>(null)
  const visibleSearchResultCardIndexRef = useRef<number | null>(null)
  const visibleEndpointCardIndexRef = useRef<number | null>(null)
  const planCreatedRef = useRef<boolean>(false)
  const selectedDayIndexRef = useRef<number | null>(null) // 選択された日のインデックス
  const polylineDayMapRef = useRef<number[]>([]) // 各Polylineがどの日に属するかのマップ

  // マップ初期化完了時のコールバック
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    setIsMapReady(true)
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

      const createPlan = async () => {
        try {
          // 日程チェック
          if (!formData.startDate || !formData.endDate) {
            console.error('[createPlan] 日程が未設定です')
            updateFormData({ isPreviewMode: false })
            return
          }

          // 旅行日数を計算
          const numberOfDays = differenceInDays(formData.endDate, formData.startDate) + 1
          console.log(`[createPlan] 旅行日数: ${numberOfDays}日`)

          // プラン生成処理を実行
          // エンドポイントの有無で処理を分岐
          if (
            formData.endpoints &&
            (formData.endpoints.tripStart ||
              formData.endpoints.accommodations.length > 0 ||
              formData.endpoints.tripEnd)
          ) {
            console.log('[createPlan] エンドポイント対応版プラン生成を実行')
            // エンドポイント対応版
            // 1. 各日のスタート/ゴールを考慮した訪問順序の最適化
            // 2. スポット間の移動時間取得
            // 3. 訪問時刻の自動計算
            // 4. 日ごとの旅程生成
            const plan = await generatePlanWithEndpoints(
              selectedSpots,
              formData.startDate,
              numberOfDays,
              formData.endpoints
            )

            // PlanFormContextに結果を保存
            updateFormData({
              dayItineraries: plan.dayItineraries,
              // 互換性のため既存フィールドも保持
              optimizedSpots: plan.dayItineraries.flatMap((day) => day.spots),
              routeInfo: plan.dayItineraries.flatMap((day) => day.routeInfo || []),
              timeSlots: mergeDayTimeSlots(plan.dayItineraries),
              dayPlan: null, // dayItinerariesを使用するため不要
            })
          } else {
            console.log('[createPlan] 従来版プラン生成を実行')
            // 従来版（エンドポイントなし）
            // 1. 訪問順序の最適化 (issue#42)
            // 2. スポット間の移動時間取得 (issue#43)
            // 3. 訪問時刻の自動計算 (issue#44)
            // 4. 日ごとの配分
            const plan = await generatePlan(selectedSpots, formData.startDate, numberOfDays)

            // PlanFormContextに結果を保存
            updateFormData({
              optimizedSpots: plan.optimizedSpots,
              routeInfo: plan.routeInfo,
              timeSlots: plan.timeSlots,
              dayPlan: plan.dayPlan,
              dayItineraries: null, // エンドポイントなしの場合は不要
            })
          }

          planCreatedRef.current = true

          // タブを旅程リストに設定（プラン作成後は旅程リストを表示）
          setActiveTab('route-list')
        } catch (error) {
          console.error('[createPlan] プラン生成に失敗しました:', error)
          // エラー時はプレビューモードを解除
          updateFormData({ isPreviewMode: false })
        }
      }

      createPlan()
    }

    // プレビューモードを解除したらフラグをリセット
    if (!formData.isPreviewMode && planCreatedRef.current) {
      planCreatedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isPreviewMode, selectedSpots])

  // プレビューモード時に日ごとのスポット順序を計算
  const spotsWithDays = useMemo(() => {
    if (!formData.isPreviewMode) {
      return undefined
    }

    // エンドポイント対応版の場合
    if (formData.dayItineraries && formData.dayItineraries.length > 0) {
      const result: Array<{ spot: PlaceResult; dayNumber: number }> = []
      
      formData.dayItineraries.forEach((dayItinerary) => {
        // 各日のスポットを訪問順に追加（エンドポイントは除外）
        dayItinerary.spots.forEach((spot) => {
          result.push({
            spot,
            dayNumber: dayItinerary.dayNumber,
          })
        })
      })

      debugLog('エンドポイント対応版で計算', {
        tag: 'spotsWithDays',
        data: {
          totalSpots: result.length,
          selectedSpotsCount: selectedSpots.length,
          selectedSpots: selectedSpots.map((spot, idx) => ({
            index: idx,
            name: spot.name,
            placeId: spot.placeId,
          })),
          dayItineraries: formData.dayItineraries.map((day) => ({
            dayNumber: day.dayNumber,
            spotsCount: day.spots.length,
            spots: day.spots.map((spot) => ({
              name: spot.name,
              placeId: spot.placeId,
            })),
            startPoint: day.startPoint?.name,
            endPoint: day.endPoint?.name,
          })),
          spots: result.map((item, idx) => ({
            index: idx,
            name: item.spot.name,
            dayNumber: item.dayNumber,
            placeId: item.spot.placeId,
          })),
        },
      })

      return result
    }

    // 従来版の場合（dayPlanを使用）
    if (formData.dayPlan && formData.dayPlan.size > 0) {
      const result: Array<{ spot: PlaceResult; dayNumber: number }> = []
      
      // dayPlanは日付順にソートされていると仮定
      const sortedDays = Array.from(formData.dayPlan.entries()).sort((a, b) => a[0] - b[0])
      
      sortedDays.forEach(([dayNumber, optimizedSpots]) => {
        // optimizedSpotsからPlaceResultを取得
        optimizedSpots.forEach((optimizedSpot) => {
          const placeResult = formData.optimizedSpots?.find(
            (spot) => spot.placeId === optimizedSpot.id
          )
          if (placeResult) {
            result.push({
              spot: placeResult,
              dayNumber,
            })
          }
        })
      })

      debugLog('従来版で計算', {
        tag: 'spotsWithDays',
        data: {
          totalSpots: result.length,
          spots: result.map((item, idx) => ({
            index: idx,
            name: item.spot.name,
            dayNumber: item.dayNumber,
            placeId: item.spot.placeId,
          })),
        },
      })

      return result
    }

    // フォールバック: optimizedSpotsを使用（日付情報なし）
    if (formData.optimizedSpots && formData.optimizedSpots.length > 0) {
      const result = formData.optimizedSpots.map((spot) => ({
        spot,
        dayNumber: undefined,
      }))
      debugLog('フォールバック版で計算', {
        tag: 'spotsWithDays',
        data: {
          totalSpots: result.length,
          spots: result.map((item, idx) => ({
            index: idx,
            name: item.spot.name,
            dayNumber: item.dayNumber,
            placeId: item.spot.placeId,
          })),
        },
      })
      return result
    }

    return undefined
  }, [
    formData.isPreviewMode,
    formData.dayItineraries,
    formData.dayPlan,
    formData.optimizedSpots,
  ])

  // スポットカードのスクロール時に対応するピンを中央に表示
  const handleSpotChange = useCallback(
    (index: number) => {
      if (!mapRef.current) return

      debugLog('呼び出されました', {
        tag: 'handleSpotChange',
        data: {
          index,
          isPreviewMode: formData.isPreviewMode,
          spotsWithDaysLength: spotsWithDays?.length,
          selectedSpotsLength: selectedSpots.length,
        },
      })

      // プレビューモード時はspotsWithDaysからスポットを取得、通常モード時はselectedSpotsから取得
      let spot: PlaceResult | undefined
      
      if (formData.isPreviewMode && spotsWithDays && index < spotsWithDays.length) {
        // プレビューモード: spotsWithDaysから取得
        spot = spotsWithDays[index].spot
        debugLog('プレビューモード: spotsWithDaysから取得', {
          tag: 'handleSpotChange',
          data: {
            index,
            spotName: spot.name,
            spotPlaceId: spot.placeId,
            dayNumber: spotsWithDays[index].dayNumber,
          },
        })
      } else if (index < selectedSpots.length) {
        // 通常モード: selectedSpotsから取得
        spot = selectedSpots[index]
        debugLog('通常モード: selectedSpotsから取得', {
          tag: 'handleSpotChange',
          data: {
            index,
            spotName: spot.name,
            spotPlaceId: spot.placeId,
          },
        })
      }

      if (!spot) {
        debugLog('スポットが見つかりませんでした', {
          tag: 'handleSpotChange',
          level: 'warn',
          data: { index },
        })
        return
      }

      // スポットカードスワイプ時は詳細カードを表示しない
      // ピンクリック時のみ詳細カードを表示する仕様のため、
      // ここでは詳細カードの表示制御は行わない

      // マップを対応するスポットの位置にスムーズに移動
      // シート状態に応じてオフセット値を変更
      // expanded（展開）: 30px（シートが高いため、オフセットを小さくしてピンを上に表示）
      // minimized（最小化）: 100px（通常のオフセット）
      const offset = sheetState === 'expanded' ? 30 : 100
      debugLog('マップを移動', {
        tag: 'handleSpotChange',
        data: {
          spotName: spot.name,
          lat: spot.lat,
          lng: spot.lng,
          offset,
        },
      })
      panToMarkerWithOffset(mapRef.current, spot.lat, spot.lng, offset)
    },
    [selectedSpots, sheetState, formData.isPreviewMode, spotsWithDays]
  )

  // 選択されたスポットをカスタムデザインのマーカーとして表示
  useEffect(() => {
    if (!mapRef.current) return

    // プレビューモード時はspotsWithDaysからスポットを抽出して使用、通常モード時は選択順序
    // spotsWithDaysは日ごとにグループ化された順序で、プラン候補の表示順序と一致している
    const spotsToDisplay = formData.isPreviewMode && spotsWithDays
      ? spotsWithDays.map(item => item.spot)
      : selectedSpots

    debugLog('spotsToDisplay vs spotsWithDays 比較', {
      tag: 'マーカー表示',
      data: {
        isPreviewMode: formData.isPreviewMode,
        spotsToDisplayCount: spotsToDisplay.length,
        spotsWithDaysCount: spotsWithDays?.length || 0,
        spotsToDisplay: spotsToDisplay.map((spot, idx) => ({
          index: idx,
          name: spot.name,
          placeId: spot.placeId,
        })),
        spotsWithDays: spotsWithDays?.map((item, idx) => ({
          index: idx,
          name: item.spot.name,
          placeId: item.spot.placeId,
          dayNumber: item.dayNumber,
        })) || [],
        // 順序の比較
        orderMatch: spotsWithDays ? spotsToDisplay.every((spot, idx) => {
          const corresponding = spotsWithDays[idx]
          return corresponding && spot.placeId === corresponding.spot.placeId
        }) : true,
      },
    })

    const previousSpotsCount = markersRef.current.length

    // 既存のマーカーをクリア
    clearMarkers(markersRef.current)

    // 新しいマーカーを追加（カスタムHTML要素を使用）
    const { markers, detailCards } = addSpotMarkers(
      mapRef.current,
      spotsToDisplay,
      (spot) => {
        // マーカークリック時: 詳細カードの表示/非表示をトグル
        const spotIndex = spotsToDisplay.findIndex((s) => s.placeId === spot.placeId)
        if (spotIndex !== -1) {
          // すべての詳細カードを閉じる
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // 検索結果の詳細カードも閉じる
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // エンドポイントの詳細カードも閉じる
          endpointDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          endpointMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleDetailCardIndexRef.current === spotIndex) {
            visibleDetailCardIndexRef.current = null
            visibleSearchResultCardIndexRef.current = null
            visibleEndpointCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (detailCardsRef.current[spotIndex]) {
              detailCardsRef.current[spotIndex].style.display = 'block'
              // クリックされたマーカーのzIndexを最前面に
              markersRef.current[spotIndex].zIndex = 9999
            }
            visibleDetailCardIndexRef.current = spotIndex
            visibleSearchResultCardIndexRef.current = null
            visibleEndpointCardIndexRef.current = null
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
    // ※プレビューモード時はスポットの追加はないため、通常モード時のみ実行
    if (!formData.isPreviewMode && spotsToDisplay.length > previousSpotsCount) {
      const latestSpot = spotsToDisplay[spotsToDisplay.length - 1]
      const latestIndex = spotsToDisplay.length - 1

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
  }, [selectedSpots, formData.isPreviewMode, spotsWithDays])

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

          // エンドポイントの詳細カードも閉じる
          endpointDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          endpointMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleSearchResultCardIndexRef.current === spotIndex) {
            visibleSearchResultCardIndexRef.current = null
            visibleDetailCardIndexRef.current = null
            visibleEndpointCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (detailCards[spotIndex]) {
              detailCards[spotIndex].style.display = 'block'
              // クリックされたマーカーのzIndexを最前面に
              markers[spotIndex].zIndex = 9999
            }
            visibleSearchResultCardIndexRef.current = spotIndex
            visibleDetailCardIndexRef.current = null
            visibleEndpointCardIndexRef.current = null
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

  // エンドポイント（出発地・宿泊施設・目的地）を色分けして表示
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !formData.endpoints) {
      return
    }

    // 既存のエンドポイントマーカーをクリア
    clearMarkers(endpointMarkersRef.current)
    endpointMarkersRef.current = []
    endpointDetailCardsRef.current = []

    const allMarkers: google.maps.marker.AdvancedMarkerElement[] = []
    const allDetailCards: HTMLElement[] = []
    let currentIndex = 0

    // 1. 出発地を緑で表示
    if (formData.endpoints.tripStart) {
      const spotIndex = currentIndex
      const { markers, detailCards } = addSpotMarkers(
        mapRef.current,
        [formData.endpoints.tripStart],
        (spot) => {
          // すべての詳細カードを閉じる
          endpointDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          endpointMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleEndpointCardIndexRef.current === spotIndex) {
            visibleEndpointCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (endpointDetailCardsRef.current[spotIndex]) {
              endpointDetailCardsRef.current[spotIndex].style.display = 'block'
              endpointMarkersRef.current[spotIndex].zIndex = 9999
            }
            visibleEndpointCardIndexRef.current = spotIndex
          }
          visibleDetailCardIndexRef.current = null
          visibleSearchResultCardIndexRef.current = null

          // マップを対応する位置に移動
          panToMarkerWithOffset(mapRef.current!, spot.lat, spot.lng, 100)
        },
        '#10b981', // 緑（Tailwind green-500）
        true
      )
      allMarkers.push(...markers)
      allDetailCards.push(...detailCards)
      currentIndex++
    }

    // 2. 宿泊施設を青で表示
    formData.endpoints.accommodations.forEach((accommodation) => {
      const spotIndex = currentIndex
      const { markers, detailCards } = addSpotMarkers(
        mapRef.current!,
        [accommodation],
        (spot) => {
          // すべての詳細カードを閉じる
          endpointDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          endpointMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleEndpointCardIndexRef.current === spotIndex) {
            visibleEndpointCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (endpointDetailCardsRef.current[spotIndex]) {
              endpointDetailCardsRef.current[spotIndex].style.display = 'block'
              endpointMarkersRef.current[spotIndex].zIndex = 9999
            }
            visibleEndpointCardIndexRef.current = spotIndex
          }
          visibleDetailCardIndexRef.current = null
          visibleSearchResultCardIndexRef.current = null

          // マップを対応する位置に移動
          panToMarkerWithOffset(mapRef.current!, spot.lat, spot.lng, 100)
        },
        '#3b82f6', // 青（Tailwind blue-500）
        true
      )
      allMarkers.push(...markers)
      allDetailCards.push(...detailCards)
      currentIndex++
    })

    // 3. 目的地を赤で表示（出発地と異なる場合のみ）
    if (formData.endpoints.tripEnd && formData.endpoints.tripEnd !== formData.endpoints.tripStart) {
      const spotIndex = currentIndex
      const { markers, detailCards } = addSpotMarkers(
        mapRef.current,
        [formData.endpoints.tripEnd],
        (spot) => {
          // すべての詳細カードを閉じる
          endpointDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          detailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })
          searchResultDetailCardsRef.current.forEach((card) => {
            card.style.display = 'none'
          })

          // すべてのマーカーのzIndexをリセット
          endpointMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          markersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })
          searchResultMarkersRef.current.forEach((marker) => {
            marker.zIndex = 1
          })

          // 同じピンをクリックした場合は非表示（トグル）
          if (visibleEndpointCardIndexRef.current === spotIndex) {
            visibleEndpointCardIndexRef.current = null
          } else {
            // 別のピンをクリックした場合は、そのピンの詳細カードを表示
            if (endpointDetailCardsRef.current[spotIndex]) {
              endpointDetailCardsRef.current[spotIndex].style.display = 'block'
              endpointMarkersRef.current[spotIndex].zIndex = 9999
            }
            visibleEndpointCardIndexRef.current = spotIndex
          }
          visibleDetailCardIndexRef.current = null
          visibleSearchResultCardIndexRef.current = null

          // マップを対応する位置に移動
          panToMarkerWithOffset(mapRef.current!, spot.lat, spot.lng, 100)
        },
        '#ef4444', // 赤（Tailwind red-500）
        true
      )
      allMarkers.push(...markers)
      allDetailCards.push(...detailCards)
      currentIndex++
    }

    endpointMarkersRef.current = allMarkers
    endpointDetailCardsRef.current = allDetailCards

    // エンドポイントが表示される範囲にマップをフィット
    if (allMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds()

      // すべてのエンドポイントをバウンディングボックスに追加
      if (formData.endpoints.tripStart) {
        bounds.extend({ lat: formData.endpoints.tripStart.lat, lng: formData.endpoints.tripStart.lng })
      }
      formData.endpoints.accommodations.forEach((accommodation) => {
        bounds.extend({ lat: accommodation.lat, lng: accommodation.lng })
      })
      if (formData.endpoints.tripEnd && formData.endpoints.tripEnd !== formData.endpoints.tripStart) {
        bounds.extend({ lat: formData.endpoints.tripEnd.lat, lng: formData.endpoints.tripEnd.lng })
      }

      // 余白を持たせてフィット
      // 下部に選択済みスポットシートがあるため、topを大きくして上寄りに表示
      mapRef.current.fitBounds(bounds, {
        top: 200,  // 上部余白を大きくして上寄りに
        right: 50,
        bottom: 50,
        left: 50,
      })
    }

    // クリーンアップ
    return () => {
      clearMarkers(endpointMarkersRef.current)
      endpointMarkersRef.current = []
      endpointDetailCardsRef.current = []
    }
  }, [isMapReady, formData.endpoints])

  // プレビューモード時: 最適化された経路をPolylineで描画
  useEffect(() => {
    if (!mapRef.current || !formData.isPreviewMode || formData.routeInfo.length === 0) {
      return
    }

    console.log('[useEffect] 経路を描画します', {
      routeCount: formData.routeInfo.length,
      isPreviewMode: formData.isPreviewMode,
      hasDayItineraries: !!formData.dayItineraries,
    })

    // 既存のPolylineをクリア
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    polylinesRef.current = []

    // エンドポイント対応プラン（dayItinerariesがある場合）: 日ごとに色分けして描画
    if (formData.dayItineraries && formData.dayItineraries.length > 0) {
      // 日ごとの色を定義
      const dayColors = [
        '#ef4444', // 1日目: 赤（Tailwind red-500）
        '#3b82f6', // 2日目: 青（Tailwind blue-500）
        '#10b981', // 3日目: 緑（Tailwind green-500）
        '#f59e0b', // 4日目: オレンジ（Tailwind amber-500）
        '#8b5cf6', // 5日目: 紫（Tailwind violet-500）
        '#ec4899', // 6日目: ピンク（Tailwind pink-500）
        '#06b6d4', // 7日目: シアン（Tailwind cyan-500）
      ]

      formData.dayItineraries.forEach((dayItinerary, dayIndex) => {
        const color = dayColors[dayIndex % dayColors.length]
        const routeInfo = dayItinerary.routeInfo || []

        console.log(`[useEffect] ${dayItinerary.dayNumber}日目のルートを描画`, {
          routeCount: routeInfo.length,
          color,
        })

        routeInfo.forEach((route, routeIndex) => {
          if (route.polyline) {
            try {
              // エンコードされたポリライン文字列をデコード
              const path = decodePolylineToLatLngs(route.polyline)

              // Polylineを作成
              const polyline = new google.maps.Polyline({
                path,
                strokeColor: color,
                strokeWeight: 6,
                strokeOpacity: 0.8,
                map: mapRef.current,
                clickable: true,
              })

              // このPolylineのインデックスと対応する日を記録
              const polylineIndex = polylinesRef.current.length

              // クリックイベントリスナーを追加（日単位で操作）
              polyline.addListener('click', () => {
                const clickedDayIndex = polylineDayMapRef.current[polylineIndex]

                // 既に選択されている日の場合は選択解除
                if (selectedDayIndexRef.current === clickedDayIndex) {
                  // 全てのPolylineを元の状態に戻す
                  polylinesRef.current.forEach((p) => {
                    p.setOptions({ strokeOpacity: 0.8, strokeWeight: 6 })
                  })
                  selectedDayIndexRef.current = null
                } else {
                  // クリックされた日のルート全体を強調表示、その他を薄く表示
                  polylinesRef.current.forEach((p, idx) => {
                    const pDayIndex = polylineDayMapRef.current[idx]
                    if (pDayIndex === clickedDayIndex) {
                      // 同じ日のルート：強調表示
                      p.setOptions({ strokeOpacity: 1.0, strokeWeight: 8 })
                    } else {
                      // 他の日のルート：薄く表示
                      p.setOptions({ strokeOpacity: 0.3, strokeWeight: 6 })
                    }
                  })
                  selectedDayIndexRef.current = clickedDayIndex

                  // プラン候補をその日の1スポット目にスクロール
                  if (formData.dayItineraries && formData.dayItineraries.length > clickedDayIndex) {
                    const clickedDayItinerary = formData.dayItineraries[clickedDayIndex]
                    const dayNumber = clickedDayItinerary.dayNumber

                    // spotsWithDaysからその日の最初のスポットのインデックスを見つける
                    if (spotsWithDays) {
                      const firstSpotIndex = spotsWithDays.findIndex(
                        (item) => item.dayNumber === dayNumber
                      )
                      if (firstSpotIndex !== -1 && sheetRef.current) {
                        // 少し遅延を入れてスクロール（アニメーションが完了してから）
                        setTimeout(() => {
                          sheetRef.current?.scrollToSpot(firstSpotIndex)
                        }, 100)
                      }
                    }
                  }
                }
              })

              polylinesRef.current.push(polyline)
              polylineDayMapRef.current.push(dayIndex) // このPolylineは何日目か記録

              console.log(
                `[useEffect] ${dayItinerary.dayNumber}日目 ルート${routeIndex + 1}を描画しました`,
                {
                  pointCount: path.length,
                  distance: `${(route.distance / 1000).toFixed(1)}km`,
                }
              )
            } catch (error) {
              console.error(
                `[useEffect] ${dayItinerary.dayNumber}日目 ルート${routeIndex + 1}の描画に失敗しました:`,
                error
              )
            }
          }
        })
      })
    } else {
      // 従来版プラン（エンドポイントなし）: すべて同じ色で描画
      formData.routeInfo.forEach((route, index) => {
        if (route.polyline) {
          try {
            // エンコードされたポリライン文字列をデコード
            const path = decodePolylineToLatLngs(route.polyline)

            // Polylineを作成
            const polyline = new google.maps.Polyline({
              path,
              strokeColor: '#ef4444', // 赤色（Tailwind red-500相当）
              strokeWeight: 6,
              strokeOpacity: 0.8,
              map: mapRef.current,
              clickable: true, // クリック可能にする
            })

            const polylineIndex = polylinesRef.current.length
            const dayIndex = 0 // traditional版は全て1日として扱う

            // クリックイベント: すべてのルートを一括で強調/薄暗く表示
            polyline.addListener('click', () => {
              const clickedDayIndex = polylineDayMapRef.current[polylineIndex]

              if (selectedDayIndexRef.current === clickedDayIndex) {
                // 既に選択されている場合: すべてをデフォルトに戻す
                polylinesRef.current.forEach((p) => {
                  p.setOptions({ strokeOpacity: 0.8, strokeWeight: 6 })
                })
                selectedDayIndexRef.current = null
              } else {
                // 新しく選択: 同じ日のルート全体を強調、他を薄く
                polylinesRef.current.forEach((p, idx) => {
                  const pDayIndex = polylineDayMapRef.current[idx]
                  if (pDayIndex === clickedDayIndex) {
                    p.setOptions({ strokeOpacity: 1.0, strokeWeight: 8 })
                  } else {
                    p.setOptions({ strokeOpacity: 0.3, strokeWeight: 6 })
                  }
                })
                selectedDayIndexRef.current = clickedDayIndex

                // 従来版の場合もプラン候補をスクロール（dayPlanから最初のスポットを取得）
                if (formData.dayPlan && formData.dayPlan.size > 0) {
                  const sortedDays = Array.from(formData.dayPlan.entries()).sort((a, b) => a[0] - b[0])
                  if (sortedDays.length > clickedDayIndex) {
                    const [dayNumber, optimizedSpots] = sortedDays[clickedDayIndex]
                    if (optimizedSpots.length > 0 && spotsWithDays) {
                      const firstSpotIndex = spotsWithDays.findIndex(
                        (item) => item.dayNumber === dayNumber
                      )
                      if (firstSpotIndex !== -1 && sheetRef.current) {
                        setTimeout(() => {
                          sheetRef.current?.scrollToSpot(firstSpotIndex)
                        }, 100)
                      }
                    }
                  }
                }
              }
            })

            polylinesRef.current.push(polyline)
            polylineDayMapRef.current.push(dayIndex) // traditional版は全て同じ日として記録

            console.log(`[useEffect] ルート${index + 1}を描画しました`, {
              pointCount: path.length,
              distance: `${(route.distance / 1000).toFixed(1)}km`,
            })
          } catch (error) {
            console.error(`[useEffect] ルート${index + 1}の描画に失敗しました:`, error)
          }
        }
      })
    }

    // クリーンアップ: プレビューモード解除時にPolylineを削除
    return () => {
      console.log('[useEffect] Polylineをクリーンアップします')
      polylinesRef.current.forEach((polyline) => polyline.setMap(null))
      polylinesRef.current = []
      polylineDayMapRef.current = []
      selectedDayIndexRef.current = null
    }
  }, [formData.isPreviewMode, formData.routeInfo, formData.dayItineraries, spotsWithDays])

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
          spotsWithDays={spotsWithDays}
        />
      )}
    </div>
  )
}

/**
 * 日ごとのTimeSlotsをマージして1つのMapにする
 */
function mergeDayTimeSlots(
  dayItineraries: Array<{ timeSlots?: Map<string, import('@/lib/itinerary/time-calculator').TimeSlot> }>
): Map<string, import('@/lib/itinerary/time-calculator').TimeSlot> | null {
  const mergedMap = new Map<string, import('@/lib/itinerary/time-calculator').TimeSlot>()

  for (const day of dayItineraries) {
    if (day.timeSlots) {
      day.timeSlots.forEach((value, key) => {
        mergedMap.set(key, value)
      })
    }
  }

  return mergedMap.size > 0 ? mergedMap : null
}

/**
 * ステップ3: スポット選択コンポーネント
 * 訪問するスポットを選択・追加するステップ
 * マップUIを画面いっぱいに表示
 */
export function SpotSelectionStep() {
  return <SpotSelectionContent />
}
