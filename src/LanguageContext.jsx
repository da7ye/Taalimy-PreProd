import React, { createContext, useContext, useState, useCallback } from "react";
import { translations, interpolate } from "./i18n";

export const LanguageContext = createContext(null);

// lang and setLang now come from App.jsx (which syncs with the backend)
// LanguageProvider no longer owns its own lang state
export function LanguageProvider({ children, lang, setLang }) {

  function t(path, vars) {
    const parts = path.split(".");
    let val = translations[lang];
    for (const p of parts) {
      if (val == null) break;
      val = val[p];
    }
    if (val == null) {
      // Fallback to French (default language now that English has been removed)
      val = translations.fr;
      for (const p of parts) {
        if (val == null) break;
        val = val[p];
      }
    }
    if (typeof val !== "string") return path;
    return vars ? interpolate(val, vars) : val;
  }

  const isRTL = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{ fontFamily: isRTL ? "'Noto Naskh Arabic', 'Cairo', sans-serif" : undefined }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// ── Standalone language hook ──────────────────────────────────────────────
// The pre-login screens (AuthPage, LoginPage, SetupAccountPage) render
// outside of App.jsx's LanguageProvider tree (there's no logged-in user yet,
// so there's nothing for App.jsx to sync a language preference against).
// useLanguage() returns null there. This hook gives those screens their own
// self-contained language state, persisted locally so the choice sticks
// across reloads, without needing a provider above them in the tree.
const STANDALONE_LANG_KEY = "taalimy_lang";

export function useStandaloneLanguage() {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STANDALONE_LANG_KEY);
      if (stored && translations[stored]) return stored;
    } catch (_) { /* localStorage unavailable */ }
    return "fr";
  });

  const setLang = useCallback((l) => {
    if (!translations[l]) return;
    setLangState(l);
    try { localStorage.setItem(STANDALONE_LANG_KEY, l); } catch (_) { /* ignore */ }
  }, []);

  const t = useCallback((path, vars) => {
    const parts = path.split(".");
    let val = translations[lang];
    for (const p of parts) {
      if (val == null) break;
      val = val[p];
    }
    if (val == null) {
      val = translations.fr;
      for (const p of parts) {
        if (val == null) break;
        val = val[p];
      }
    }
    if (typeof val !== "string") return path;
    return vars ? interpolate(val, vars) : val;
  }, [lang]);

  const isRTL = lang === "ar";

  return { lang, setLang, t, isRTL };
}