import { useEffect, useState } from "react";
import { getTeachers, getStudents, getParents, getMatieres, getLevels, getClasses } from "../api";

const STATS = [
  { key: "teachers", label: "Teachers",  page: "teachers",  icon: "🎓",
    gradient: "linear-gradient(135deg, #4F43C0 0%, #7B6FE8 100%)",
    glow: "rgba(79,67,192,0.35)", badge: "#c7c3f7" },
  { key: "students", label: "Students",  page: "students",  icon: "📚",
    gradient: "linear-gradient(135deg, #0E7E68 0%, #1AAFA0 100%)",
    glow: "rgba(14,126,104,0.35)", badge: "#a7ede3" },
  { key: "parents",  label: "Parents",   page: "parents",   icon: "👨‍👩‍👧",
    gradient: "linear-gradient(135deg, #A8641E 0%, #D4944A 100%)",
    glow: "rgba(168,100,30,0.35)", badge: "#f7d9b5" },
  { key: "matieres", label: "Subjects",  page: "matieres",  icon: "📐",
    gradient: "linear-gradient(135deg, #B83535 0%, #E07070 100%)",
    glow: "rgba(184,53,53,0.35)", badge: "#f7c3c3" },
  { key: "levels",   label: "Levels",    page: "levels",    icon: "🏷️",
    gradient: "linear-gradient(135deg, #2A7540 0%, #56C785 100%)",
    glow: "rgba(42,117,64,0.35)", badge: "#b8f0cc" },
  { key: "classes",  label: "Classes",   page: "classes",   icon: "🏫",
    gradient: "linear-gradient(135deg, #7C3FAF 0%, #C084FC 100%)",
    glow: "rgba(124,63,175,0.35)", badge: "#e5c7ff" },
];

const ACTIONS = [
  { label: "Register a Teacher",   page: "teachers",    icon: "＋", color: "#4F43C0" },
  { label: "Enroll a Student",     page: "students",    icon: "＋", color: "#0E7E68" },
  { label: "Add a Subject",        page: "matieres",    icon: "＋", color: "#B83535" },
  { label: "Approve Users",        page: "approve",     icon: "✓",  color: "#2A7540" },
  { label: "Create Assignment",    page: "assignments", icon: "📋", color: "#A8641E" },
  { label: "View Timetable",       page: "timetable",   icon: "🗓", color: "#7C3FAF" },
];

export default function DashboardHome({ setPage }) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getTeachers(), getStudents(), getParents(), getMatieres(), getLevels(), getClasses()])
      .then(([t, s, p, m, l, c]) => {
        const get = (res, paged) =>
          res.status === "fulfilled"
            ? paged
              ? res.value?.classes?.length ?? res.value?.levelDTOS?.length ?? res.value?.content?.length ?? res.value?.length ?? 0
              : res.value?.length ?? 0
            : "—";
        setCounts({ teachers: get(t), students: get(s), parents: get(p), matieres: get(m), levels: get(l, true), classes: get(c, true) });
        setLoading(false);
      });
  }, []);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-enter" style={{
      padding: "40px 44px",
      maxWidth: 1100,
      minHeight: "100%",
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Dashboard · Overview</div>
        <h1 style={{
          margin: 0, fontSize: 30,
          fontFamily: "'Instrument Serif', serif",
          color: "var(--accent)", letterSpacing: "-.03em", lineHeight: 1.2,
        }}>
          {greeting}, Admin 👋
        </h1>
        <p style={{ margin: "7px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
          Here's a live snapshot of your school system.
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        marginBottom: 36,
      }}>
        {STATS.map(({ key, label, page, icon, gradient, glow, badge }) => (
          <button
            key={key}
            onClick={() => setPage(page)}
            style={{
              padding: "24px 24px 20px",
              cursor: "pointer",
              textAlign: "left",
              border: "none",
              borderRadius: "var(--r-lg)",
              position: "relative",
              overflow: "hidden",
              background: gradient,
              boxShadow: `0 4px 20px ${glow}, 0 1px 4px rgba(0,0,0,0.12)`,
              transition: "transform .16s ease, box-shadow .18s ease",
              color: "#fff",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
              e.currentTarget.style.boxShadow = `0 12px 36px ${glow}, 0 2px 8px rgba(0,0,0,0.16)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = `0 4px 20px ${glow}, 0 1px 4px rgba(0,0,0,0.12)`;
            }}
          >
            {/* Decorative circle */}
            <div style={{
              position: "absolute", bottom: -24, right: -24,
              width: 110, height: 110, borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -44, right: 30,
              width: 70, height: 70, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              pointerEvents: "none",
            }} />

            {/* Top row: icon badge + arrow */}
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", marginBottom: 22,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>
                {icon}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.55)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7 7 17 7 17 17"/>
              </svg>
            </div>

            {/* Count */}
            <div style={{
              fontSize: 34, fontWeight: 400, letterSpacing: "-.04em",
              fontFamily: "'Instrument Serif', serif",
              color: "#fff", lineHeight: 1, marginBottom: 5,
            }}>
              {loading ? <span style={{ opacity: 0.5, fontSize: 22 }}>—</span> : counts[key]}
            </div>

            {/* Label */}
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="section-label" style={{ marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {ACTIONS.map(a => (
            <button
              key={a.page}
              onClick={() => setPage(a.page)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px", borderRadius: "var(--r-md)",
                background: "var(--bg-card)",
                border: "1.5px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                cursor: "pointer", textAlign: "left",
                transition: "background .14s, box-shadow .15s, transform .12s, border-color .14s",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--surface-hover)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.borderColor = "var(--border-md)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {/* Color dot */}
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: a.color + "1a",
                border: `1px solid ${a.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
                color: a.color,
              }}>
                {a.icon}
              </div>
              <span style={{ fontSize: 13.5, color: "var(--text-dim)", fontWeight: 500 }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}