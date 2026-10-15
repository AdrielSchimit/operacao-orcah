-- PHASE B (manual, breaking until Auth UI is deployed; NOT EXECUTED).
-- Apply ONLY after both Adriel/Cesar can sign in with Supabase Auth on Preview.
-- Requires >=2 active rows in ops_api.orcah_ops_members; no anonymous writes.
BEGIN;
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM ops_api.orcah_ops_members WHERE active) < 2 THEN
    RAISE EXCEPTION 'ORCAH: members not ready; refuse to change current kanban grants';
  END IF;
END
$$;

DROP POLICY IF EXISTS "orcah ops read shared workspace" ON ops_api.orcah_ops_shared_documents;
DROP POLICY IF EXISTS "orcah ops insert shared workspace" ON ops_api.orcah_ops_shared_documents;
DROP POLICY IF EXISTS "orcah ops update shared workspace" ON ops_api.orcah_ops_shared_documents;

REVOKE ALL ON ops_api.orcah_ops_shared_documents FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON ops_api.orcah_ops_shared_documents TO authenticated;
ALTER TABLE ops_api.orcah_ops_shared_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ops_members_read" ON ops_api.orcah_ops_shared_documents
FOR SELECT TO authenticated
USING (
  workspace_id = 'operacao-orcah'
  AND EXISTS (
    SELECT 1 FROM ops_api.orcah_ops_members m
    WHERE m.user_id = (SELECT auth.uid()) AND m.active
  )
);
CREATE POLICY "ops_members_insert" ON ops_api.orcah_ops_shared_documents
FOR INSERT TO authenticated
WITH CHECK (
  workspace_id = 'operacao-orcah'
  AND document_key IN ('kanban','mindmap','ux','columns')
  AND EXISTS (
    SELECT 1 FROM ops_api.orcah_ops_members m
    WHERE m.user_id = (SELECT auth.uid()) AND m.active
  )
);
CREATE POLICY "ops_members_update" ON ops_api.orcah_ops_shared_documents
FOR UPDATE TO authenticated
USING (
  workspace_id = 'operacao-orcah'
  AND EXISTS (
    SELECT 1 FROM ops_api.orcah_ops_members m
    WHERE m.user_id = (SELECT auth.uid()) AND m.active
  )
)
WITH CHECK (
  workspace_id = 'operacao-orcah'
  AND document_key IN ('kanban','mindmap','ux','columns')
  AND EXISTS (
    SELECT 1 FROM ops_api.orcah_ops_members m
    WHERE m.user_id = (SELECT auth.uid()) AND m.active
  )
);
COMMIT;

-- Postflight: anon can no longer update or read the board.
-- SELECT has_table_privilege('anon','ops_api.orcah_ops_shared_documents','UPDATE');
-- SELECT ... policies from pg_policies WHERE schemaname='ops_api';
