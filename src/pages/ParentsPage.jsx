import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getParents, createParent, updateParent, deactivateParent,
  getStudents,
  getChildren, addStudentToParent,
  getChildTimetable, getChildNotes, getChildBulletin,
} from "../api";
import { Field, Input, SubmitBtn } from "../components/FormComponents";
import { usePersonForm } from "../hooks/usePersonForm";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

// ── Constants ────────────────────────────────────────────────────────────────
const C_COLOR    = "var(--amber)";
const C_BG       = "var(--amber-dim)";
const PAGE_SIZE  = 12;

// ── Small reusable UI pieces ─────────────────────────────────────────────────
function BackBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, fontFamily: "'Instrument Sans', sans-serif", padding: 0, marginBottom: 28, transition: "color .13s" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      {label}
    </button>
  );
}

function PageTitle({ crumb, title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-label" style={{ marginBottom: 6 }}>{crumb}</div>
      <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>{title}</h1>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function FormPanel({ children, onSubmit }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)" }}>
      <form onSubmit={onSubmit} style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>{children}</form>
    </div>
  );
}

function SidePanel({ title, items, accentColor, accentBg, initial, sectionLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: accentBg, color: accentColor, border: `2px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 30, margin: "0 auto 14px" }}>{initial || "?"}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{title}</div>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom: 12 }}>{sectionLabel}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: C_BG, color: C_COLOR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

// ── Pagination bar ────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 0; i < totalPages; i++) pages.push(i);

  const btnStyle = (active) => ({
    minWidth: 34, height: 34, borderRadius: "var(--r-md)", border: "1.5px solid",
    borderColor: active ? C_COLOR : "var(--border-md)",
    background: active ? C_BG : "var(--bg-card)",
    color: active ? C_COLOR : "var(--text-muted)",
    fontWeight: active ? 700 : 500, fontSize: 13,
    cursor: active ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all .14s",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 }}>
      <button
        style={{ ...btnStyle(false), minWidth: 34 }}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      {pages.map(p => {
        if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 0 && p !== totalPages - 1) {
          if (p === 1 && page > 3) return <span key={p} style={{ color: "var(--text-faint)", fontSize: 13 }}>…</span>;
          if (p === totalPages - 2 && page < totalPages - 4) return <span key={p} style={{ color: "var(--text-faint)", fontSize: 13 }}>…</span>;
          if (Math.abs(p - page) > 2) return null;
        }
        return (
          <button key={p} style={btnStyle(p === page)} onClick={() => onChange(p)}>{p + 1}</button>
        );
      })}

      <button
        style={{ ...btnStyle(false), minWidth: 34 }}
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <span style={{ fontSize: 12.5, color: "var(--text-faint)", marginLeft: 8 }}>
        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
      </span>
    </div>
  );
}

// ── Parent card ───────────────────────────────────────────────────────────────
function ParentCard({ r, onClick, onEdit, onDeactivate, t }) {
  return (
    <div className="person-card" style={{ "--card-top": C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: C_BG, color: C_COLOR, border: `1.5px solid ${C_COLOR}28`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>
          {(r.firstname?.[0] ?? "?").toUpperCase()}
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.edit")}</button>
          <button onClick={() => onDeactivate(r)} className="btn-danger" style={{ padding: "5px 12px", fontSize: 12 }}>{t("parents.deactivateBtn")}</button>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{r.firstname} {r.lastname}</div>
        {r.address && <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 3 }}>📍 {r.address}</div>}
      </div>
      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 5 }}>
        {r.email && <div style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>✉ {r.email}</div>}
        {r.phone && <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>📞 {r.phone}</div>}
      </div>
      <div style={{ position: "absolute", top: 14, right: 14, width: 7, height: 7, borderRadius: "50%", background: r.isApprove ? "var(--green)" : "var(--amber)", boxShadow: r.isApprove ? "0 0 0 2px var(--green-dim)" : "0 0 0 2px var(--amber-dim)" }} />
    </div>
  );
}

// ── Detail tab: Children ──────────────────────────────────────────────────────
function ChildrenTab({ parent, toast }) {
  const [children, setChildren]       = useState(null);
  const [loadingKids, setLoadingKids] = useState(true);
  const [linking, setLinking]         = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showDropdown, setShowDropdown]   = useState(false);
  const [expanded, setExpanded]       = useState(null);
  const [childData, setChildData]     = useState({});

  const loadChildren = useCallback(() => {
    setLoadingKids(true);
    getChildren(parent.id)
      .then(d => setChildren(Array.isArray(d) ? d : []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoadingKids(false));
  }, [parent.id]);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  useEffect(() => {
    getStudents()
      .then(d => setAllStudents(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Students not already linked
  const linkedIds = useMemo(() => new Set((children ?? []).map(c => c.studentId)), [children]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    return allStudents.filter(s => {
      if (linkedIds.has(s.id)) return false;
      const name = `${s.firstname ?? ""} ${s.lastname ?? ""}`.toLowerCase();
      const reg  = (s.registrationNumber ?? "").toLowerCase();
      return !q || name.includes(q) || reg.includes(q);
    });
  }, [allStudents, linkedIds, studentSearch]);

  const handleLink = async () => {
    if (!selectedStudent) return;
    setLinking(true);
    try {
      await addStudentToParent(parent.id, selectedStudent.id);
      toast("Student linked successfully!");
      setSelectedStudent("");
      setStudentSearch("");
      loadChildren();
    } catch (err) { toast(err.message, "error"); }
    finally { setLinking(false); }
  };

  const toggleExpand = (sid) => {
    setExpanded(prev => prev === sid ? null : sid);
    if (!childData[sid]) setChildData(prev => ({ ...prev, [sid]: { tab: "timetable" } }));
  };

  const getOrLoad = async (sid, key, fetcher) => {
    if (childData[sid]?.[key]) return;
    setChildData(prev => ({ ...prev, [sid]: { ...prev[sid], [`loading_${key}`]: true } }));
    try {
      const d = await fetcher();
      setChildData(prev => ({ ...prev, [sid]: { ...prev[sid], [key]: d, [`loading_${key}`]: false } }));
    } catch (err) {
      toast(err.message, "error");
      setChildData(prev => ({ ...prev, [sid]: { ...prev[sid], [`loading_${key}`]: false } }));
    }
  };

  const switchChildTab = (sid, tab) => {
    setChildData(prev => ({ ...prev, [sid]: { ...prev[sid], tab } }));
    const trimestre = childData[sid]?.trimestre || 1;
    if (tab === "timetable") getOrLoad(sid, "timetable", () => getChildTimetable(parent.id, sid));
    if (tab === "notes")     getOrLoad(sid, `notes_${trimestre}`, () => getChildNotes(parent.id, sid, trimestre));
    if (tab === "bulletin")  getOrLoad(sid, `bulletin_${trimestre}`, () => getChildBulletin(parent.id, sid, trimestre));
  };

  const fetchWithTrimestre = (sid, tab, trimestre) => {
    setChildData(prev => ({ ...prev, [sid]: { ...prev[sid], trimestre } }));
    if (tab === "notes")    getOrLoad(sid, `notes_${trimestre}`, () => getChildNotes(parent.id, sid, trimestre));
    if (tab === "bulletin") getOrLoad(sid, `bulletin_${trimestre}`, () => getChildBulletin(parent.id, sid, trimestre));
  };

  const tabBtn = (sid, key, label, current) => (
    <button
      onClick={() => switchChildTab(sid, key)}
      style={{
        padding: "6px 14px", borderRadius: "var(--r-md)", fontSize: 12.5, fontWeight: 500,
        border: "1.5px solid", cursor: "pointer",
        borderColor: current === key ? C_COLOR : "var(--border-md)",
        background: current === key ? C_BG : "var(--surface)",
        color: current === key ? C_COLOR : "var(--text-muted)",
        transition: "all .14s",
      }}
    >{label}</button>
  );

  if (loadingKids) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="spinner" style={{ width: 22, height: 22 }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Link student */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px" }}>
        <div className="section-label" style={{ marginBottom: 12 }}>🔗 Link a Student</div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <label className="field-label">Student</label>
            {/* Selected pill or search input */}
            {selectedStudent ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r-md)", border: "1.5px solid var(--accent)", background: "var(--bg-card)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--violet-dim)", color: "var(--violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {(selectedStudent.firstname?.[0] ?? "S").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{selectedStudent.firstname} {selectedStudent.lastname}</div>
                  {selectedStudent.registrationNumber && <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{selectedStudent.registrationNumber}</div>}
                </div>
                <button
                  onClick={() => { setSelectedStudent(""); setStudentSearch(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 16, lineHeight: 1, padding: 2 }}
                >✕</button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <input
                  className="t-input"
                  placeholder="Search students…"
                  value={studentSearch}
                  onChange={e => { setStudentSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                />
                {showDropdown && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: "var(--bg-modal)", border: "1px solid var(--border-md)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", maxHeight: 220, overflowY: "auto" }}>
                    {filteredStudents.length === 0 ? (
                      <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
                        {allStudents.length === 0 ? "Loading students…" : "No unlinked students found"}
                      </div>
                    ) : filteredStudents.map(s => (
                      <div
                        key={s.id}
                        onMouseDown={() => { setSelectedStudent(s); setStudentSearch(""); setShowDropdown(false); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", transition: "background .12s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--violet-dim)", color: "var(--violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {(s.firstname?.[0] ?? "S").toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{s.firstname} {s.lastname}</div>
                          {s.registrationNumber && <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{s.registrationNumber}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleLink}
            disabled={linking || !selectedStudent}
            className="btn-primary"
            style={{ padding: "11px 20px", flexShrink: 0 }}
          >
            {linking ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Linking…</> : "Link Student"}
          </button>
        </div>
      </div>

      {/* Children list */}
      {children?.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <span style={{ fontSize: 32 }}>👶</span>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-faint)" }}>No children linked yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {children?.map(child => {
            const sid   = child.studentId;
            const cd    = childData[sid] || { tab: "timetable" };
            const isExp = expanded === sid;
            const curTab = cd.tab || "timetable";
            const trimestre = cd.trimestre || 1;

            return (
              <div key={sid} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                {/* Child header */}
                <div
                  onClick={() => toggleExpand(sid)}
                  style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background .13s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--violet-dim)", color: "var(--violet)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 17, flexShrink: 0 }}>
                      {(child.fullName?.[0] ?? "S").toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{child.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2, display: "flex", gap: 10 }}>
                        {child.className && <span>📚 {child.className}</span>}
                        {child.levelName && <span>🎓 {child.levelName}</span>}
                        {child.registrationNumber && <span>🔢 {child.registrationNumber}</span>}
                      </div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Expanded child detail */}
                {isExp && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px" }}>
                    {/* Tab bar + trimestre selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      {tabBtn(sid, "timetable", "🗓 Timetable", curTab)}
                      {tabBtn(sid, "notes",     "📝 Notes",     curTab)}
                      {tabBtn(sid, "bulletin",  "📊 Bulletin",  curTab)}

                      {(curTab === "notes" || curTab === "bulletin") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                          <label style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>Trimestre</label>
                          <input
                            type="number" min="1" max="3"
                            value={trimestre}
                            onChange={e => { const v = Number(e.target.value); fetchWithTrimestre(sid, curTab, v); }}
                            style={{ width: 52, padding: "5px 8px", borderRadius: 7, border: "1.5px solid var(--border-md)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, outline: "none" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Tab content */}
                    {curTab === "timetable" && <TimetableTabContent cd={cd} sid={sid} onLoad={() => getOrLoad(sid, "timetable", () => getChildTimetable(parent.id, sid))} />}
                    {curTab === "notes"     && <NotesTabContent cd={cd} trimestre={trimestre} />}
                    {curTab === "bulletin"  && <BulletinTabContent cd={cd} trimestre={trimestre} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimetableTabContent({ cd, sid, onLoad }) {
  useEffect(() => { if (!cd?.timetable) onLoad(); }, []);
  if (cd?.loading_timetable) return <LoadingRow />;
  const rows = cd?.timetable;
  if (!rows?.length) return <EmptyRow label="No timetable sessions found." />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Day", "Time", "Subject", "Teacher", "Room"].map(h => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 10px", color: "var(--text-dim)", fontWeight: 500 }}>{r.jour}</td>
              <td style={{ padding: "8px 10px", color: "var(--text-faint)" }}>{r.heureDebut} – {r.heureFin}</td>
              <td style={{ padding: "8px 10px", color: "var(--text)" }}>{r.matiereName}</td>
              <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{r.teacherName}</td>
              <td style={{ padding: "8px 10px", color: "var(--text-faint)" }}>{r.room || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotesTabContent({ cd, trimestre }) {
  const key  = `notes_${trimestre}`;
  const rows = cd?.[key];
  const loading = cd?.[`loading_${key}`];
  if (loading) return <LoadingRow />;
  if (!rows)   return <EmptyRow label={`Select trimestre ${trimestre} and wait for notes to load.`} />;
  if (!rows.length) return <EmptyRow label="No notes found for this trimestre." />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Subject", "Type", "Grade", "Appreciation", "Date"].map(h => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 10px", color: "var(--text)" }}>{r.matiereName}</td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: "var(--violet-dim)", color: "var(--violet)" }}>{r.typeDevoir}</span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ fontWeight: 700, color: r.valeur >= 10 ? "var(--green)" : "var(--rose)", fontSize: 14 }}>{r.valeur}</span>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>/20</span>
              </td>
              <td style={{ padding: "8px 10px", color: "var(--text-muted)", fontStyle: "italic" }}>{r.appreciation || "—"}</td>
              <td style={{ padding: "8px 10px", color: "var(--text-faint)" }}>{r.dateNote || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletinTabContent({ cd, trimestre }) {
  const key  = `bulletin_${trimestre}`;
  const data = cd?.[key];
  const loading = cd?.[`loading_${key}`];
  if (loading) return <LoadingRow />;
  if (!data)   return <EmptyRow label="Select a trimestre to load the bulletin." />;

  const avg = data.moyenneGenerale;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { icon: "🎓", label: "Student",    value: data.studentName },
          { icon: "📚", label: "Class",      value: data.className },
          { icon: "📅", label: "Trimestre",  value: data.trimestreNom },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 4 }}>{icon} {label}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 500 }}>{value || "—"}</div>
          </div>
        ))}
      </div>

      {/* Avg */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--r-md)", background: avg >= 10 ? "var(--green-dim)" : "var(--rose-dim)", border: `1px solid ${avg >= 10 ? "rgba(42,117,64,.22)" : "rgba(184,53,53,.22)"}` }}>
        <span style={{ fontSize: 24, fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: avg >= 10 ? "var(--green)" : "var(--rose)" }}>{avg?.toFixed(2) ?? "—"}</span>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: avg >= 10 ? "var(--green)" : "var(--rose)" }}>Moyenne Générale</div>
          {data.appreciation && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, fontStyle: "italic" }}>{data.appreciation}</div>}
        </div>
      </div>

      {/* Subjects table */}
      {data.matieres?.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Matière", "Coeff", "D1", "D2", "D3", "Examen", "Moy. Devoirs", "Moy. Matière"].map(h => (
                  <th key={h} style={{ padding: "7px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matieres.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 600, color: "var(--text)" }}>{m.matiereName}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-faint)", textAlign: "center" }}>{m.coefficient ?? "—"}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-dim)", textAlign: "center" }}>{m.devoir1 ?? "—"}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-dim)", textAlign: "center" }}>{m.devoir2 ?? "—"}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-dim)", textAlign: "center" }}>{m.devoir3 ?? "—"}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-dim)", textAlign: "center" }}>{m.examen ?? "—"}</td>
                  <td style={{ padding: "7px 8px", color: "var(--text-dim)", textAlign: "center" }}>{m.moyenneDevoirs?.toFixed(1) ?? "—"}</td>
                  <td style={{ padding: "7px 8px", textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: (m.moyenneMatiere ?? 0) >= 10 ? "var(--green)" : "var(--rose)" }}>{m.moyenneMatiere?.toFixed(2) ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoadingRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "24px 0", color: "var(--text-faint)", fontSize: 13 }}>
      <div className="spinner" style={{ width: 16, height: 16 }} /> Loading…
    </div>
  );
}

function EmptyRow({ label }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--text-faint)" }}>{label}</div>
  );
}

// ── Detail tabs nav ───────────────────────────────────────────────────────────
function DetailTabs({ active, onChange }) {
  const tabs = [
    { key: "info",     label: "👤 Info" },
    { key: "children", label: "👨‍👩‍👧 Children" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: "10px 18px", background: "none", border: "none", cursor: "pointer",
            fontSize: 13.5, fontWeight: active === tab.key ? 600 : 400,
            color: active === tab.key ? C_COLOR : "var(--text-muted)",
            borderBottom: active === tab.key ? `2px solid ${C_COLOR}` : "2px solid transparent",
            marginBottom: -1, transition: "all .14s",
          }}
        >{tab.label}</button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ParentsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]           = useState("list");
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [q, setQ]                 = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [detailTab, setDetailTab] = useState("info");
  const { form, set, setForm }    = usePersonForm();
  const [address, setAddress]     = useState("");
  const [editForm, setEditForm]   = useState({});
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const load = () => {
    setLoading(true);
    getParents()
      .then(setData)
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    if (!q.trim()) return arr;
    const lq = q.toLowerCase();
    return arr.filter(r =>
      `${r.firstname} ${r.lastname}`.toLowerCase().includes(lq) ||
      r.email?.toLowerCase().includes(lq) ||
      r.phone?.toLowerCase().includes(lq)
    );
  }, [data, q]);

  // Reset to first page on search change
  useEffect(() => { setCurrentPage(0); }, [q]);

  const paginated = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const goList = () => { setView("list"); setSelected(null); setDetailTab("info"); };

  const handleCreate = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await createParent({ registrationRequest: form, address });
      setForm({ firstname: "", lastname: "", email: "", phone: "", nni: "" });
      setAddress("");
      toast(t("parents.registered"));
      load();
      goList();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const openEdit = r => {
    setEditForm({ id: r.id, firstname: r.firstname ?? "", lastname: r.lastname ?? "", email: r.email ?? "", phone: r.phone ?? "", nni: r.nni ?? "", address: r.address ?? "" });
    setSelected(r);
    setView("edit");
  };

  const handleEdit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateParent(selected.id, editForm);
      toast(t("parents.updated"));
      load();
      goList();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deactivateParent(deleteTarget.userId ?? deleteTarget.id);
      setDeleteTarget(null);
      toast(t("parents.deactivated"));
      load();
      if (view !== "list") goList();
    } catch (err) { toast(err.message, "error"); }
    finally { setDeleting(false); }
  };

  // ── LIST view ───────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <PageTitle
          crumb={t("parents.crumb")}
          title={t("parents.title")}
          sub={loading
            ? t("common.loading")
            : `${filtered.length} ${t("parents.title").toLowerCase()}`}
        />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom: 32 }}>
          {t("parents.addBtn")}
        </button>
      </div>

      <div className="search-wrap" style={{ maxWidth: 300, marginBottom: 24 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input className="search-input" placeholder={t("parents.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("common.loading")}</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 36 }}>👨‍👩‍👧</span>
          <p>{q ? `${t("common.noResults")} "${q}"` : t("parents.empty")}</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
            {paginated.map((r, i) => (
              <ParentCard
                key={r.id ?? i}
                r={r}
                t={t}
                onClick={r => { setSelected(r); setDetailTab("info"); setView("detail"); }}
                onEdit={openEdit}
                onDeactivate={target => setDeleteTarget(target)}
              />
            ))}
          </div>
          <Pagination
            page={currentPage}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setCurrentPage}
          />
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("parents.deactivateTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })}
          message={t("parents.deactivateMsg")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );

  // ── CREATE view ─────────────────────────────────────────────────────────────
  if (view === "create") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("parents.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("parents.crumb")} · ${t("parents.title")}`} title={t("parents.registerTitle")} sub={t("parents.registerSub")} />
      <TwoCol
        left={
          <FormPanel onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.firstName")}><Input placeholder={t("fields.firstNamePlaceholder")} value={form.firstname} onChange={set("firstname")} required /></Field>
              <Field label={t("fields.lastName")}><Input placeholder={t("fields.lastNamePlaceholder")} value={form.lastname} onChange={set("lastname")} required /></Field>
            </div>
            <Field label={t("fields.email")}><Input type="email" placeholder={t("fields.emailPlaceholder")} value={form.email} onChange={set("email")} required /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.phone")}><Input placeholder={t("fields.phonePlaceholder")} value={form.phone} onChange={set("phone")} required minLength={8} /></Field>
              <Field label={t("fields.nni")}><Input placeholder={t("fields.nniPlaceholder")} value={form.nni} onChange={set("nni")} required minLength={8} /></Field>
            </div>
            <Field label={t("parents.address")}><Input placeholder={t("parents.addressPlaceholder")} value={address} onChange={e => setAddress(e.target.value)} /></Field>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
              <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("parents.registerBtn")} /></div>
            </div>
          </FormPanel>
        }
        right={
          <SidePanel
            title={t("parents.sideNote")}
            initial={(form.firstname?.[0] ?? "?").toUpperCase()}
            accentColor={C_COLOR} accentBg={C_BG}
            sectionLabel={t("common.notes")}
            items={[
              { icon: "🏠", text: t("parents.sideNote1") },
              { icon: "📞", text: t("parents.sideNote2") },
              { icon: "✅", text: t("parents.sideNote3") },
            ]}
          />
        }
      />
    </div>
  );

  // ── EDIT view ───────────────────────────────────────────────────────────────
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("parents.detailBack")} onClick={goList} />
      <PageTitle
        crumb={`${t("parents.crumb")} · ${t("parents.title")}`}
        title={t("parents.editTitle")}
        sub={t("parents.editSub", { name: `${selected.firstname} ${selected.lastname}` })}
      />
      <TwoCol
        left={
          <FormPanel onSubmit={handleEdit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.firstName")}><Input value={editForm.firstname} onChange={setEdit("firstname")} required /></Field>
              <Field label={t("fields.lastName")}><Input value={editForm.lastname} onChange={setEdit("lastname")} required /></Field>
            </div>
            <Field label={t("fields.email")}><Input type="email" value={editForm.email} onChange={setEdit("email")} required /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.phone")}><Input value={editForm.phone} onChange={setEdit("phone")} /></Field>
              <Field label={t("fields.nni")}><Input value={editForm.nni} onChange={setEdit("nni")} /></Field>
            </div>
            <Field label={t("parents.address")}><Input value={editForm.address} onChange={setEdit("address")} /></Field>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
              <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("parents.saveBtn")} /></div>
            </div>
          </FormPanel>
        }
        right={
          <SidePanel
            title={t("parents.editSub", { name: `${selected.firstname} ${selected.lastname}` })}
            initial={(selected.firstname?.[0] ?? "?").toUpperCase()}
            accentColor={C_COLOR} accentBg={C_BG}
            sectionLabel={t("common.notes")}
            items={[
              { icon: "💡", text: t("parents.editNote1") },
              { icon: "📧", text: t("parents.editNote2") },
            ]}
          />
        }
      />
    </div>
  );

  // ── DETAIL view ─────────────────────────────────────────────────────────────
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding: "36px 44px" }}>
        <BackBtn label={t("parents.detailBack")} onClick={goList} />

        {/* Profile hero */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: 90, background: `linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding: "0 36px 28px", marginTop: -36 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: C_BG, color: C_COLOR, border: "3px solid var(--bg-card)", boxShadow: `0 0 0 2px ${C_COLOR}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 32, flexShrink: 0 }}>
                  {(v.firstname?.[0] ?? "P").toUpperCase()}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.025em" }}>
                    {v.firstname} {v.lastname}
                  </h2>
                  <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: v.isApprove ? "var(--green-dim)" : "var(--amber-dim)", color: v.isApprove ? "var(--green)" : "var(--amber)", border: `1px solid ${v.isApprove ? "rgba(42,117,64,.25)" : "rgba(168,100,30,.25)"}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.isApprove ? "var(--green)" : "var(--amber)" }} />
                      {v.isApprove ? t("common.approved") : t("common.pending")}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding: "10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding: "10px 20px" }}>{t("parents.deactivateBtn")}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <DetailTabs active={detailTab} onChange={setDetailTab} />

        {/* Info tab */}
        {detailTab === "info" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <StatBox icon="✉️" label={t("parents.fields.email")}   value={v.email} />
            <StatBox icon="📞" label={t("parents.fields.phone")}   value={v.phone} />
            <StatBox icon="🪪" label={t("parents.fields.nni")}     value={v.nni} />
            <StatBox icon="🏠" label={t("parents.fields.address")} value={v.address} />
            <StatBox icon="🎂" label={t("parents.fields.dob")}     value={v.dateOfBrith} />
            <StatBox icon="🆔" label={t("parents.fields.userId")}  value={v.userId} />
          </div>
        )}

        {/* Children tab */}
        {detailTab === "children" && (
          <ChildrenTab parent={v} toast={toast} />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title={t("parents.deactivateTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })}
            message={t("parents.deactivateDetailMsg")}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </div>
    );
  }

  return null;
}