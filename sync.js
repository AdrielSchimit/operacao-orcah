(() => {
  "use strict";

  const SUPABASE_URL = "https://qpecvanlbxoxhgjkjrvc.supabase.co";
  const SUPABASE_KEY = "sb_publishable_B-zo-9xI5HFUAHeKbAAt0g_DLj5L5jr";
  const WORKSPACE_ID = "operacao-orcah";
  const CLIENT_KEY = "operacao-orcah-client-id-v1";
  const LAST_REV_KEY = "operacao-orcah-revisions-v1";

  const $ = selector => document.querySelector(selector);
  const clientId = (() => {
    let value = localStorage.getItem(CLIENT_KEY);
    if (!value) {
      value = crypto.randomUUID ? crypto.randomUUID() : `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, value);
    }
    return value;
  })();

  const revisions = (() => {
    try { return JSON.parse(localStorage.getItem(LAST_REV_KEY) || "{}"); }
    catch { return {}; }
  })();

  const timers = new Map();
  let channel = null;
  let sb = null;
  let connected = false;

  const docs = {
    kanban: {
      get: () => window.ORCAH_KANBAN_API?.getCards?.(),
      apply: payload => window.ORCAH_KANBAN_API?.replaceCards?.(payload)
    },
    mindmap: {
      get: () => window.ORCAH_KANBAN_API?.getMindState?.(),
      apply: payload => window.ORCAH_KANBAN_API?.replaceMindState?.(payload)
    },
    ux: {
      get: () => window.ORCAH_UX_API?.getState?.(),
      apply: payload => window.ORCAH_UX_API?.replaceState?.(payload)
    },
    columns: {
      get: () => window.ORCAH_KANBAN_API?.getColumns?.(),
      apply: payload => window.ORCAH_KANBAN_API?.replaceColumns?.(payload)
    }
  };

  function currentUser() {
    return window.ORCAH_ACCESS_USER || "Equipe";
  }

  function setStatus(mode, label) {
    const badge = $("#syncBadge");
    if (!badge) return;
    badge.classList.remove("online","offline","syncing");
    badge.classList.add(mode);
    const text = badge.querySelector("span");
    if (text) text.textContent = label;
  }

  function persistRevision(key, revision) {
    revisions[key] = Number(revision || 0);
    localStorage.setItem(LAST_REV_KEY, JSON.stringify(revisions));
  }

  function isEmptyPayload(value) {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  }

  async function bootstrapDocument(key) {
    const adapter = docs[key];
    if (!adapter) return;

    const { data, error } = await sb
      .from("orcah_ops_shared_documents")
      .select("payload, revision, updated_client_id")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("document_key", key)
      .maybeSingle();

    if (error) throw error;

    if (data && !isEmptyPayload(data.payload)) {
      adapter.apply(data.payload);
      persistRevision(key, data.revision);
      return;
    }

    const localPayload = adapter.get();
    if (localPayload == null) return;

    const { data: created, error: upsertError } = await sb
      .from("orcah_ops_shared_documents")
      .upsert({
        workspace_id: WORKSPACE_ID,
        document_key: key,
        payload: localPayload,
        updated_by: currentUser(),
        updated_client_id: clientId
      }, { onConflict: "workspace_id,document_key" })
      .select("revision")
      .single();

    if (upsertError) throw upsertError;
    persistRevision(key, created?.revision || 0);
  }

  async function pushDocument(key) {
    const adapter = docs[key];
    if (!adapter || !connected) return;
    const payload = adapter.get();
    if (payload == null) return;

    setStatus("syncing","Sincronizando");

    const { data, error } = await sb
      .from("orcah_ops_shared_documents")
      .upsert({
        workspace_id: WORKSPACE_ID,
        document_key: key,
        payload,
        updated_by: currentUser(),
        updated_client_id: clientId
      }, { onConflict: "workspace_id,document_key" })
      .select("revision")
      .single();

    if (error) {
      console.error("ORÇAH sync write failed", error);
      setStatus("offline","Erro ao salvar");
      return;
    }

    persistRevision(key, data?.revision || revisions[key] || 0);
    setStatus("online","Compartilhado");
  }

  function schedulePush(key) {
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => pushDocument(key), key === "mindmap" ? 220 : 160));
  }

  function applyRemoteRow(row) {
    if (!row || row.workspace_id !== WORKSPACE_ID) return;
    const key = row.document_key;
    const adapter = docs[key];
    if (!adapter) return;
    if (row.updated_client_id && row.updated_client_id === clientId) {
      persistRevision(key, row.revision);
      return;
    }
    if (Number(row.revision || 0) <= Number(revisions[key] || -1)) return;

    adapter.apply(row.payload);
    persistRevision(key, row.revision);
    setStatus("online", row.updated_by ? `Atualizado por ${row.updated_by}` : "Compartilhado");
  }

  function subscribeRealtime() {
    channel = sb
      .channel("orcah-ops-shared-workspace")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orcah_ops_shared_documents",
        filter: `workspace_id=eq.${WORKSPACE_ID}`
      }, payload => {
        if (payload.eventType === "DELETE") return;
        applyRemoteRow(payload.new);
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") {
          connected = true;
          setStatus("online","Compartilhado");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          connected = false;
          setStatus("offline","Offline");
        }
      });
  }

  async function connect() {
    if (sb || !window.supabase?.createClient) return;
    setStatus("syncing","Conectando");

    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    try {
      await Promise.all(Object.keys(docs).map(bootstrapDocument));
      connected = true;
      subscribeRealtime();
      setStatus("online","Compartilhado");
    } catch (error) {
      console.error("ORÇAH sync bootstrap failed", error);
      connected = false;
      setStatus("offline","Somente local");
    }
  }

  window.addEventListener("orcah:shared-change", event => {
    const key = event.detail?.document;
    if (docs[key]) schedulePush(key);
  });

  window.addEventListener("orcah:access", () => {
    if (!sb) connect();
  });

  window.addEventListener("online", () => {
    if (!sb) connect();
    else setStatus("syncing","Reconectando");
  });
  window.addEventListener("offline", () => setStatus("offline","Offline"));

  if (window.ORCAH_ACCESS_USER) connect();
  else setStatus("syncing","Aguardando acesso");

  window.ORCAH_SYNC = {
    pushAll() {
      Object.keys(docs).forEach(schedulePush);
    },
    clientId
  };
})();