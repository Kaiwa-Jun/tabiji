-- ============================================================================
-- Table: line_groups
-- Description: LINEグループ情報を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.line_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_group_id VARCHAR(50) UNIQUE NOT NULL,
  group_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_line_groups_line_group_id
  ON public.line_groups(line_group_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.line_groups IS 'LINEグループ情報を管理するテーブル';
COMMENT ON COLUMN public.line_groups.id IS 'グループID';
COMMENT ON COLUMN public.line_groups.line_group_id IS 'LINEグループID（一意）';
COMMENT ON COLUMN public.line_groups.group_name IS 'グループ名';
COMMENT ON COLUMN public.line_groups.created_at IS '作成日時';
COMMENT ON COLUMN public.line_groups.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_line_groups_updated_at
  BEFORE UPDATE ON public.line_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
