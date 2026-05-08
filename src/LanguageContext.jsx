import React, { createContext, useContext } from "react";
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
      // Fallback to English
      val = translations.en;
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