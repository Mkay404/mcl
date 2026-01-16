-- 1. Update the Search Function logic
CREATE OR REPLACE FUNCTION search_resources_fts(search_term text)
RETURNS SETOF resources AS $$
DECLARE
  formatted_query text;
BEGIN
  -- 1. Check if search_term is empty or just spaces
  IF trim(search_term) = '' THEN
    RETURN;
  END IF;

  -- 2. This creates the 'ILIKE' behavior for multiple words
  SELECT string_agg(lexeme || ':*', ' & ') INTO formatted_query
  FROM unnest(to_tsvector('english', search_term));

  RETURN QUERY
  SELECT *
  FROM resources
  WHERE is_approved = TRUE
    AND (
      -- Primary: Smart search (handles phrases, quotes, etc.)
      search_vector @@ websearch_to_tsquery('english', search_term)
      OR 
      -- Secondary: Prefix matching (the 'ILIKE' behavior)
      search_vector @@ to_tsquery('english', formatted_query)
    )
  ORDER BY 
    ts_rank_cd(search_vector, websearch_to_tsquery('english', search_term)) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;


-- 2. Update the resource update function
CREATE OR REPLACE FUNCTION resources_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.keyword_string, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update the keywords resource function
CREATE OR REPLACE FUNCTION update_resource_search_vector_from_keywords()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources
    SET keyword_string = (
        SELECT STRING_AGG(keyword, ' ') 
        FROM resource_keywords 
        WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    )
    WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-apply the Trigger to Resources (Dropping first to be safe)
DROP TRIGGER IF EXISTS trigger_resources_update_search_vector ON resources;
CREATE TRIGGER trigger_resources_update_search_vector
BEFORE INSERT OR UPDATE OF title, description, keyword_string ON resources
FOR EACH ROW EXECUTE FUNCTION resources_update_search_vector();

-- 5. Force update existing data so everything is searchable NOW
UPDATE resources SET updated_at = NOW();
