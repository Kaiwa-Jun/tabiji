-- ============================================================================
-- Table: spots
-- Description: Google Maps APIから取得したスポット情報のキャッシュ
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id VARCHAR(100) UNIQUE,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  photo_url TEXT,
  category VARCHAR(50),
  rating DECIMAL(2,1),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: 緯度は-90〜90の範囲
  CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
  -- 制約: 経度は-180〜180の範囲
  CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180),
  -- 制約: 評価は0〜5の範囲
  CONSTRAINT check_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_spots_google_place_id
  ON public.spots(google_place_id);

CREATE INDEX IF NOT EXISTS idx_spots_location
  ON public.spots(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_spots_category
  ON public.spots(category);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.spots IS 'Google Maps APIから取得したスポット情報のキャッシュ';
COMMENT ON COLUMN public.spots.id IS 'スポットID';
COMMENT ON COLUMN public.spots.google_place_id IS 'Google Place ID（一意）';
COMMENT ON COLUMN public.spots.name IS 'スポット名';
COMMENT ON COLUMN public.spots.address IS '住所';
COMMENT ON COLUMN public.spots.latitude IS '緯度（-90〜90）';
COMMENT ON COLUMN public.spots.longitude IS '経度（-180〜180）';
COMMENT ON COLUMN public.spots.photo_url IS '写真URL';
COMMENT ON COLUMN public.spots.category IS 'カテゴリ（レストラン、観光地など）';
COMMENT ON COLUMN public.spots.rating IS '評価（0.0〜5.0）';
COMMENT ON COLUMN public.spots.metadata IS 'その他のメタデータ（JSON形式）';
COMMENT ON COLUMN public.spots.created_at IS '作成日時';
COMMENT ON COLUMN public.spots.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON public.spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
