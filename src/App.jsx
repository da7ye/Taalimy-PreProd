import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";
import { LanguageProvider } from "./LanguageContext";
import LoginPage from "./pages/LoginPage";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import ParentsPage from "./pages/ParentsPage";
import MatieresPage from "./pages/MatieresPage";
import LevelsPage from "./pages/LevelsPage";
import ClassesPage from "./pages/ClassesPage";
import ApprovePage from "./pages/ApprovePage";
import DashboardHome from "./pages/DashboardHome";
import TimetablePage from "./pages/TimetablePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AbsencePage from "./pages/AbsencePage";
import PaymentsPage from "./pages/Paymentspage";
import NotesPage from "./pages/NotesPage";

export const ThemeContext = React.createContext("light");

// const BASE_URL = "http://144.91.85.23/api/v1";
const BASE_URL = "/api/v1";
const USER_ID  = 73;

async function apiFetch(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function apiPut(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${path}`, { method: "PUT", headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export default function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(() => localStorage.getItem("taalimy_token") || null);
  const [theme, setThemeState] = useState(() => localStorage.getItem("taalimy_theme") || "light");
  const [lang,  setLangState]  = useState(() => localStorage.getItem("taalimy_lang")  || "fr");

  useEffect(() => {
    if (!token) return;
    apiFetch("/staffs", token)
      .then((staffs) => {
        if (!Array.isArray(staffs)) return;
        const me = staffs.find((s) => s.userId === USER_ID);
        if (!me) return;
        const savedTheme = me.mode === "Dark" ? "dark" : "light";
        const savedLang  = (me.langue || "FR").toLowerCase();
        setThemeState(savedTheme);
        setLangState(savedLang);
        localStorage.setItem("taalimy_theme", savedTheme);
        localStorage.setItem("taalimy_lang",  savedLang);
      })
      .catch(() => {});
  }, [token]);

  function handleLogin(newToken, newRole) {
    localStorage.setItem("taalimy_token", newToken);
    localStorage.setItem("taalimy_role", newRole);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("taalimy_token");
    localStorage.removeItem("taalimy_role");
    setToken(null);
    setPage("home");
  }

  function setTheme(newTheme) {
    setThemeState(newTheme);
    localStorage.setItem("taalimy_theme", newTheme);
    apiPut(`/users/${USER_ID}/mode?mode=${newTheme === "dark" ? "Dark" : "light"}`, token).catch(() => {});
  }

  function setLang(newLang) {
    setLangState(newLang);
    localStorage.setItem("taalimy_lang", newLang);
    apiPut(`/users/${USER_ID}/langue?langue=${newLang.toUpperCase()}`, token).catch(() => {});
  }

  if (!token) {
    return (
      <ThemeContext.Provider value={theme}>
        <div className={theme === "dark" ? "dark" : ""}>
          <LoginPage
            onLogin={handleLogin}
            isDark={theme === "dark"}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
      </ThemeContext.Provider>
    );
  }

  const pages = {
    home:        <DashboardHome setPage={setPage} />,
    teachers:    <TeachersPage />,
    students:    <StudentsPage />,
    parents:     <ParentsPage />,
    matieres:    <MatieresPage />,
    levels:      <LevelsPage />,
    classes:     <ClassesPage />,
    absences:    <AbsencePage />,
    assignments: <AssignmentsPage />,
    timetable:   <TimetablePage />,
    payments:    <PaymentsPage />,
    notes:       <NotesPage />,
    approve:     <ApprovePage />,
  };

  return (
    <ThemeContext.Provider value={theme}>
      <LanguageProvider lang={lang} setLang={setLang}>
        <ToastProvider>
          <div
            className={theme === "dark" ? "dark" : ""}
            style={{
              display: "flex", height: "100vh", overflow: "hidden",
              background: "var(--bg-base)", color: "var(--text)",
            }}
          >
            <Sidebar
              active={page}
              setPage={setPage}
              theme={theme}
              setTheme={setTheme}
              onLogout={handleLogout}
            />
            <main style={{ flex: 1, overflowY: "auto" }}>
              {pages[page]}
            </main>
          </div>
        </ToastProvider>
      </LanguageProvider>
    </ThemeContext.Provider>
  );
}