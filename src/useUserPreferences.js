/**
 * Drop-in replacement for your existing App.jsx top-level state block.
 *
 * Changes vs. the original:
 *  1. On mount → loadPreferences() fetches from backend (falls back to localStorage)
 *  2. setTheme / setLang wrappers persist to localStorage AND call the backend
 *  3. A tiny "prefs loading" flag prevents a light→dark flash on first render
 *
 * Everything else (Sidebar, pages, routing) stays exactly the same.
 */

import { useState, useEffect, useCallback } from "react";
import { loadPreferences, saveTheme, saveLang } from "./userPreferences"; // adjust path

export function useUserPreferences() {
  // Start with values from localStorage for instant render (no flash)
  const [theme, _setTheme] = useState(
    () => localStorage.getItem("taalimy_theme") || "light"
  );
  const [lang, _setLang] = useState(
    () => localStorage.getItem("taalimy_lang") || "fr"
  );
  const [prefsReady, setPrefsReady] = useState(false);

  // On mount: load authoritative values from backend
  useEffect(() => {
    loadPreferences().then(({ theme: t, lang: l }) => {
      _setTheme(t);
      _setLang(l);
      setPrefsReady(true);
    });
  }, []);

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  /** Call this instead of _setTheme directly */
  const setTheme = useCallback((newTheme) => {
    _setTheme(newTheme);
    localStorage.setItem("taalimy_theme", newTheme);
    saveTheme(newTheme).catch(err =>
      console.warn("Failed to save theme to backend:", err)
    );
  }, []);

  /** Call this instead of _setLang directly */
  const setLang = useCallback((newLang) => {
    _setLang(newLang);
    localStorage.setItem("taalimy_lang", newLang);
    saveLang(newLang).catch(err =>
      console.warn("Failed to save language to backend:", err)
    );
  }, []);

  return { theme, setTheme, lang, setLang, prefsReady };
}