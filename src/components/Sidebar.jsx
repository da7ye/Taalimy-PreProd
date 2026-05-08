import { useLanguage } from "../LanguageContext";
import { useState, useEffect, useRef } from "react";

function Icon({ d, d2, d3, viewBox = "0 0 24 24" }) {
  return (
    <svg width="15" height="15" viewBox={viewBox} fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d  && <path d={d}/>}
      {d2 && <path d={d2}/>}
      {d3 && <path d={d3}/>}
    </svg>
  );
}
function IconHome()    { return <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10"/>; }
function IconGrad()    { return <Icon d="M22 10v6M2 10l10-5 10 5-10 5z" d2="M6 12v5c3 3 9 3 12 0v-5"/>; }
function IconBook()    { return <Icon d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" d2="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>; }
function IconUsers()   { return <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" d2="M9 7m-4 0a4 4 0 108 0 4 4 0 10-8 0"/>; }
function IconLayers()  { return <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>; }
function IconTag()     { return <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" d2="M7 7h.01"/>; }
function IconSchool()  { return <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10"/>; }
function IconClip()    { return <Icon d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" d2="M9 2h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z"/>; }
function IconCal()     { return <Icon d="M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z" d2="M16 2v4M8 2v4M3 10h18"/>; }
function IconAlert()   { return <Icon d="M12 22a10 10 0 110-20 10 10 0 010 20zM12 8v4M12 16h.01"/>; }
function IconCheck()   { return <Icon d="M22 11.08V12a10 10 0 11-5.93-9.14" d2="M22 4L12 14.01l-3-3"/>; }
function IconPayment() { return <Icon d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z" d2="M1 10h22"/>; }
function IconNote()    { return <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" d2="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>; }

function IconGlobe() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

const LANGS = [
  { id: "en", label: "English", native: "English" },
  { id: "fr", label: "Français", native: "Français" },
  { id: "ar", label: "عربي",    native: "عربي" },
];

/** Globe button + dropdown that opens above the logo */
function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.id === lang);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Change language"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 8px", borderRadius: 8,
          background: open ? "var(--accent-dim)" : "var(--surface)",
          border: `1px solid ${open ? "var(--border-md)" : "var(--border)"}`,
          color: open ? "var(--accent)" : "var(--text-muted)",
          cursor: "pointer",
          transition: "background .14s, color .14s, border-color .14s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = "var(--surface-hover)"; e.currentTarget.style.color = "var(--text-dim)"; }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-muted)"; }}}
      >
        <IconGlobe />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
        }}>
          {lang}
        </span>
        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform .18s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown panel — opens downward below the logo bar */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 200,
            background: "var(--bg-card)",
            border: "1px solid var(--border-md)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            minWidth: 148,
            animation: "fadeUp .15s ease-out both",
          }}
        >
          {LANGS.map(l => {
            const isActive = lang === l.id;
            return (
              <button
                key={l.id}
                onClick={() => { setLang(l.id); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "9px 14px",
                  border: "none", borderBottom: "1px solid var(--border)",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-dim)",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  transition: "background .12s",
                  gap: 10,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface-hover)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  fontFamily: l.id === "ar" ? "'Cairo','Noto Naskh Arabic',sans-serif" : "'Instrument Sans',sans-serif",
                }}>
                  {l.native}
                </span>
                {isActive && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ active, setPage, theme, setTheme, onLogout }) {
  const { t, lang, setLang } = useLanguage();
  const isDark = theme === "dark";

  const NAV = [
    { section: t("sections.overview"),   items: [{ id: "home",      label: t("nav.dashboard"),    icon: IconHome }] },
    { section: t("sections.people"),     items: [
      { id: "teachers",  label: t("nav.teachers"),  icon: IconGrad },
      { id: "students",  label: t("nav.students"),  icon: IconBook },
      { id: "parents",   label: t("nav.parents"),   icon: IconUsers },
    ]},
    { section: t("sections.academics"),  items: [
      { id: "matieres",    label: t("nav.subjects"),    icon: IconLayers },
      { id: "levels",      label: t("nav.levels"),      icon: IconTag },
      { id: "classes",     label: t("nav.classes"),     icon: IconSchool },
      { id: "assignments", label: t("nav.assignments"), icon: IconClip },
      { id: "timetable",   label: t("nav.timetable"),   icon: IconCal },
      { id: "notes",       label: t("nav.grades"),      icon: IconNote },
    ]},
    { section: t("sections.attendance"), items: [{ id: "absences", label: t("nav.absences"), icon: IconAlert }] },
    { section: t("sections.finance"),    items: [{ id: "payments", label: t("nav.payments"), icon: IconPayment }] },
    { section: t("sections.admin"),      items: [{ id: "approve",  label: t("nav.approveUsers"), icon: IconCheck }] },
  ];

  return (
    <aside style={{
      width: "var(--sidebar-w)", flexShrink: 0,
      display: "flex", flexDirection: "column",
      background: "var(--bg-panel)",
      borderRight: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Logo + Language dropdown */}
      <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Instrument Serif', serif",
              fontSize: 17, color: "#fff",
              boxShadow: "0 2px 10px var(--accent-glow)",
            }}>T</div>
            <div>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 17, color: "var(--text)",
                letterSpacing: "-.01em", lineHeight: 1.1,
              }}>Taalimy</div>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: ".12em",
                textTransform: "uppercase", color: "var(--text-faint)",
                marginTop: 1,
              }}>Staff Portal</div>
            </div>
          </div>

          {/* Language dropdown */}
          <LangDropdown lang={lang} setLang={setLang} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 18 }}>
            <div className="section-label" style={{ padding: "0 10px 8px" }}>
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = active === item.id;
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    position: "relative", width: "100%",
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 12px", borderRadius: 9,
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: isActive ? "var(--accent-dim)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400,
                    marginBottom: 1,
                    transition: "background .14s, color .14s",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--surface-hover)";
                      e.currentTarget.style.color = "var(--text-dim)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  {isActive && <div className="nav-active-bar" />}
                  <span style={{ marginLeft: isActive ? 6 : 0, display: "flex", alignItems: "center" }}>
                    <ItemIcon />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 14px 18px", borderTop: "1px solid var(--border)" }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px", borderRadius: 10,
            background: "var(--surface)", border: "1px solid var(--border)",
            cursor: "pointer", marginBottom: 12,
            fontFamily: "'Instrument Sans', sans-serif",
            transition: "background .14s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-muted)" }}>
            {isDark ? <IconMoon /> : <IconSun />}
            {isDark ? t("theme.dark") : t("theme.light")}
          </span>
          <div style={{
            width: 38, height: 21, borderRadius: 999,
            background: isDark ? "var(--accent)" : "var(--border-lg)",
            position: "relative", transition: "background .22s",
          }}>
            <div style={{
              position: "absolute", top: 2.5,
              left: isDark ? 19 : 2.5,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left .22s",
              boxShadow: "0 1px 4px rgba(0,0,0,.25)",
            }} />
          </div>
        </button>

        {/* User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--accent-dim)",
            border: "1px solid var(--border-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Instrument Serif', serif",
            fontSize: 14, color: "var(--accent)",
            flexShrink: 0,
          }}>S</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)" }}>Staff Admin</div>
            <div style={{ fontSize: 10.5, color: "var(--text-faint)" }}>{t("user.role")}</div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text-faint)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .14s, color .14s, border-color .14s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--rose-dim)";
                e.currentTarget.style.color = "var(--rose)";
                e.currentTarget.style.borderColor = "rgba(184,53,53,.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text-faint)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}