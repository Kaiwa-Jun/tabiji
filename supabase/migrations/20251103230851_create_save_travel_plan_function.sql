-- ============================================================================
-- Function: save_travel_plan
-- Description: 旅行プラン全体をトランザクション処理で保存するPostgreSQL関数
-- ============================================================================

CREATE OR REPLACE FUNCTION public.save_travel_plan(
  p_user_id UUID,
  p_title TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_area TEXT,
  p_display_mode TEXT DEFAULT 'with_time',
  p_is_public BOOLEAN DEFAULT FALSE,
  p_day_itineraries JSONB DEFAULT '[]'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id UUID;
  v_day_itinerary JSONB;
  v_day_id UUID;
  v_spot JSONB;
  v_spot_id UUID;
  v_order_index INTEGER;
BEGIN
  -- ========================================
  -- 1. 認証チェック
  -- ========================================
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- ========================================
  -- 2. 入力パラメータのバリデーション
  -- ========================================
  IF p_title IS NULL OR TRIM(p_title) = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Start date and end date are required';
  END IF;

  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must be after or equal to start date';
  END IF;

  IF p_display_mode NOT IN ('order_only', 'with_time') THEN
    RAISE EXCEPTION 'Invalid display mode';
  END IF;

  -- ========================================
  -- 3. travel_plansにINSERT
  -- ========================================
  INSERT INTO public.travel_plans (
    title,
    start_date,
    end_date,
    area,
    created_by,
    display_mode,
    is_public
  ) VALUES (
    p_title,
    p_start_date,
    p_end_date,
    p_area,
    p_user_id,
    p_display_mode,
    p_is_public
  )
  RETURNING id INTO v_plan_id;

  -- ========================================
  -- 4. 各日程を処理
  -- ========================================
  FOR v_day_itinerary IN SELECT * FROM jsonb_array_elements(p_day_itineraries)
  LOOP
    -- 4-1. plan_daysにINSERT
    INSERT INTO public.plan_days (
      plan_id,
      day_number,
      date,
      start_point,
      end_point
    ) VALUES (
      v_plan_id,
      (v_day_itinerary->>'dayNumber')::INTEGER,
      (v_day_itinerary->>'date')::DATE,
      v_day_itinerary->'startPoint',
      v_day_itinerary->'endPoint'
    )
    RETURNING id INTO v_day_id;

    -- 4-2. この日のスポットを処理
    v_order_index := 0;
    FOR v_spot IN SELECT * FROM jsonb_array_elements(v_day_itinerary->'spots')
    LOOP
      -- カスタムスポットかGoogle Mapsスポットかを判定
      IF (v_spot->>'isCustom')::BOOLEAN = TRUE THEN
        -- カスタムスポットの場合: spotsテーブルには保存せず、plan_spotsに直接保存
        INSERT INTO public.plan_spots (
          plan_day_id,
          spot_id,
          order_index,
          arrival_time,
          departure_time,
          duration_minutes,
          is_custom,
          custom_name,
          custom_location
        ) VALUES (
          v_day_id,
          NULL, -- カスタムスポットはspot_idがNULL
          v_order_index,
          (v_spot->>'arrivalTime')::TIME,
          (v_spot->>'departureTime')::TIME,
          (v_spot->>'durationMinutes')::INTEGER,
          TRUE,
          v_spot->>'name',
          jsonb_build_object(
            'lat', (v_spot->>'lat')::DECIMAL,
            'lng', (v_spot->>'lng')::DECIMAL,
            'address', v_spot->>'address'
          )
        );
      ELSE
        -- Google Mapsスポットの場合: spotsテーブルにUPSERT
        INSERT INTO public.spots (
          google_place_id,
          name,
          address,
          latitude,
          longitude,
          photo_url,
          category,
          rating,
          metadata
        ) VALUES (
          v_spot->>'place_id',
          v_spot->>'name',
          v_spot->>'address',
          (v_spot->>'lat')::DECIMAL,
          (v_spot->>'lng')::DECIMAL,
          v_spot->>'photo_url',
          v_spot->>'category',
          (v_spot->>'rating')::DECIMAL,
          v_spot->'metadata'
        )
        ON CONFLICT (google_place_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          photo_url = EXCLUDED.photo_url,
          category = EXCLUDED.category,
          rating = EXCLUDED.rating,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING id INTO v_spot_id;

        -- plan_spotsにINSERT
        INSERT INTO public.plan_spots (
          plan_day_id,
          spot_id,
          order_index,
          arrival_time,
          departure_time,
          duration_minutes,
          is_custom
        ) VALUES (
          v_day_id,
          v_spot_id,
          v_order_index,
          (v_spot->>'arrivalTime')::TIME,
          (v_spot->>'departureTime')::TIME,
          (v_spot->>'durationMinutes')::INTEGER,
          FALSE
        );
      END IF;

      v_order_index := v_order_index + 1;
    END LOOP;
  END LOOP;

  -- ========================================
  -- 5. plan_membersに作成者を追加
  -- ========================================
  INSERT INTO public.plan_members (
    plan_id,
    user_id
  ) VALUES (
    v_plan_id,
    p_user_id
  );

  -- ========================================
  -- 6. プランIDを返却
  -- ========================================
  RETURN v_plan_id;

EXCEPTION
  WHEN OTHERS THEN
    -- エラー発生時は自動的にROLLBACKされる
    RAISE;
END;
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.save_travel_plan IS '旅行プラン全体をトランザクション処理で保存する関数。エラー時は自動的にロールバックされ、データ整合性が保たれます。';

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- 認証済みユーザーがこの関数を実行できるように権限を付与
GRANT EXECUTE ON FUNCTION public.save_travel_plan TO authenticated;
