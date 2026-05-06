import React, { createContext, useContext, useState } from "react";
import { translations, interpolate } from "./i18n";

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // "en" | "fr" | "ar"

  /**
   * t("teachers.title")            → looks up translations[lang].teachers.title
   * t("teachers.editSub", {name})  → interpolates {{name}}
   */
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
      <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: isRTL ? "'Noto Naskh Arabic', 'Cairo', sans-serif" : undefined }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}