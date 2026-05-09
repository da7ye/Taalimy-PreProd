import { BASE_URL } from "../api";

const USER_ID  = 73; // hardcoded until auth is wired up

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Save theme to backend.
 * API accepts "light" | "Dark"  (capital D — matches the enum)
 */
export async function saveTheme(theme) {
  const mode = theme === "dark" ? "Dark" : "light";
  return request(`/users/${USER_ID}/mode?mode=${mode}`, { method: "PUT" });
}

/**
 * Save language to backend.
 * API accepts "AR" | "EN" | "FR"
 */
export async function saveLang(lang) {
  const langue = lang.toUpperCase(); // "en"→"EN", "fr"→"FR", "ar"→"AR"
  return request(`/users/${USER_ID}/langue?langue=${langue}`, { method: "PUT" });
}

/**
 * Load preferences from backend.
 * GET /staffs returns a list of staff objects each with a userId field.
 * We find the entry whose userId === USER_ID and read its langue & mode.
 * Falls back to localStorage if the request fails or user not found.
 */
export async function loadPreferences() {
  try {
    const staffs = await request("/staffs");
    const me = Array.isArray(staffs)
      ? staffs.find(s => s.userId === USER_ID)
      : null;

    if (me) {
      // Backend stores "Dark" (capital D) and "light"; lang as "FR"/"EN"/"AR"
      const theme = me.mode === "Dark" ? "dark" : "light";
      const lang  = (me.langue || "FR").toLowerCase(); // "FR" → "fr"

      // Keep localStorage in sync as a fast cache
      localStorage.setItem("taalimy_theme", theme);
      localStorage.setItem("taalimy_lang",  lang);
      return { theme, lang };
    }
  } catch (e) {
    console.warn("Could not load preferences from backend, using cache:", e);
  }

  // Fallback to localStorage cache or hard defaults
  return {
    theme: localStorage.getItem("taalimy_theme") || "light",
    lang:  localStorage.getItem("taalimy_lang")  || "fr",
  };
}