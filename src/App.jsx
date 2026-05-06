import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";
import { LanguageProvider } from "./LanguageContext";
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

export default function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState("light");

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
      <LanguageProvider>
        <ToastProvider>
          <div
            className={theme === "dark" ? "dark" : ""}
            style={{
              display: "flex", height: "100vh", overflow: "hidden",
              background: "var(--bg-base)", color: "var(--text)",
            }}
          >
            <Sidebar active={page} setPage={setPage} theme={theme} setTheme={setTheme} />
            <main style={{ flex: 1, overflowY: "auto" }}>
              {pages[page]}
            </main>
          </div>
        </ToastProvider>
      </LanguageProvider>
    </ThemeContext.Provider>
  );
}