(() => {
  "use strict";

  const SESSION_KEY = "operacao-orcah-access-v1";
  const SESSION_DAYS = 30;

  const USERS = {
    "4e8a288e5178fc8cd9f12b1fc66ea6b27bf7af7c8bff92b3be3be14c34844596": "Adriel",
    "b70dff3bdd2f1761da253ea342b7fb84e3de644f0d51cb38e94050d3cc209f49": "Cesar"
  };

  const $ = selector => document.querySelector(selector);

  async function sha256(value) {
    const data = new TextEncoder().encode(value.trim());
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function validSession() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.user || !session?.expiresAt || Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function exposeUser(user) {
    window.ORCAH_ACCESS_USER = user;
    document.documentElement.dataset.orcahUser = user;
    window.dispatchEvent(new CustomEvent("orcah:access", { detail: { user } }));
  }

  function openApp(user) {
    const gate = $("#accessGate");
    if (gate) gate.hidden = true;
    exposeUser(user);
  }

  function lockApp() {
    localStorage.removeItem(SESSION_KEY);
    window.ORCAH_ACCESS_USER = null;
    const gate = $("#accessGate");
    if (gate) gate.hidden = false;
    const input = $("#accessCode");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 50);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const input = $("#accessCode");
    const error = $("#accessError");
    const code = input?.value || "";

    if (error) error.hidden = true;

    try {
      const hash = await sha256(code);
      const user = USERS[hash];
      if (!user) {
        if (error) error.hidden = false;
        input?.select();
        return;
      }

      const session = {
        user,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      openApp(user);
    } catch {
      if (error) {
        error.textContent = "Não foi possível validar o código.";
        error.hidden = false;
      }
    }
  }

  function boot() {
    $("#accessForm")?.addEventListener("submit", submit);
    $("#logoutBtn")?.addEventListener("click", () => {
      const topMenu = $("#topMenu");
      if (topMenu) topMenu.hidden = true;
      lockApp();
    });

    const session = validSession();
    if (session) {
      openApp(session.user);
    } else {
      lockApp();
    }
  }

  boot();
})();