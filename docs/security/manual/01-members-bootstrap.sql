-- PHASE A (manual, additive, NOT EXECUTED) — Supabase Auth member allowlist.
-- Safe only after review; no effect on current kanban until Phase B.
BEGIN;
CREATE TABLE IF NOT EXISTS ops_api.orcah_ops_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (display_name IN ('Adriel','Cesar')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ops_api.orcah_ops_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ops_api.orcah_ops_members FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE ops_api.orcah_ops_members TO authenticated;

CREATE POLICY ops_members_select_self ON ops_api.orcah_ops_members
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) AND active = true);

COMMIT;
-- Bootstrap first-party Auth users through the Supabase dashboard, then map
-- the exact IDs through a reviewed SQL Editor INSERT (do not paste passwords).
-- DO NOT open unrestricted INSERT/UPDATE to authenticated on this allowlist.
