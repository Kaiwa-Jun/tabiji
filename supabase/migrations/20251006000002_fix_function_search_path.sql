-- update_updated_at_column関数のsearch_path問題を修正
-- セキュリティ警告を解決するため、SET search_path = ''を追加

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 関数のコメントを追加
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column to the current timestamp';
