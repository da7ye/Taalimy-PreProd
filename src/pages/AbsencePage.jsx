import { useState, useMemo, useEffect } from "react";
import { markAbsences, getAbsencesByTimetable, getAbsencesByStudent, getParentAbsences, getParents, getTimetables, getStudents } from "../api";
import { Field } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import { useLanguage } from "../LanguageContext";

const DAY_STYLE = {
  MONDAY:    { color:"var(--violet)", bg:"var(--violet-dim)" },
  TUESDAY:   { color:"var(--teal)",   bg:"var(--teal-dim)"   },
  WEDNESDAY: { color:"var(--rose)",   bg:"var(--rose-dim)"   },
  THURSDAY:  { color:"var(--amber)",  bg:"var(--amber-dim)"  },
  FRIDAY:    { color:"var(--green)",  bg:"var(--green-dim)"  },
  SATURDAY:  { color:"var(--blue)",   bg:"var(--blue-dim)"   },
  SUNDAY:    { color:"var(--rose)",   bg:"var(--rose-dim)"   },
};

const DAY_ORDER = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

function TabBar({ active, onChange, t }) {
  const TABS = [
    { id:"mark",       label: t("absences.tabMark")      },
    { id:"by-session", label: t("absences.tabBySession") },
    { id:"by-student", label: t("absences.tabByStudent") },
    { id:"by-parent",  label: t("absences.tabByParent")  },
  ];
  return (
    <div style={{ display:"flex", gap:4, padding:5, borderRadius:"var(--r-lg)", background:"var(--bg-card)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", width:"fit-content", marginBottom:28 }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            padding:"8px 20px", borderRadius:"var(--r-md)", border:"none", cursor:"pointer",
            background: isActive ? "var(--accent)" : "transparent",
            color: isActive ? "#fff" : "var(--text-muted)",
            fontSize:13, fontWeight: isActive ? 600 : 400,
            fontFamily:"'Instrument Sans', sans-serif",
            boxShadow: isActive ? "0 2px 8px var(--accent-glow)" : "none",
            transition:"all .15s",
          }}>{tab.label}</button>
        );
      })}
    </div>
  );
}

function AbsenceCard({ a, t }) {
  const ds = DAY_STYLE[a.timetableDayOfWeek] || { color:"var(--text-muted)", bg:"var(--surface)" };
  return (
    <div className="card" style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ padding:"3px 10px", borderRadius:999, background:ds.bg, color:ds.color, fontSize:11.5, fontWeight:700, fontFamily:"'JetBrains Mono', monospace", border:`1px solid ${ds.color}22` }}>
          {a.timetableDayOfWeek ? t(`timetable.days.${a.timetableDayOfWeek}`) : "—"}{a.timetableStartTime ? ` · ${a.timetableStartTime}` : ""}
        </span>
        <span style={{ fontSize:11.5, color:"var(--text-faint)" }}>{a.date ?? "—"}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:"var(--rose-dim)", border:"1px solid rgba(184,53,53,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🚫</div>
        <div>
          {(a.userFirstname || a.userLastname) && (
            <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>
              {a.userFirstname} {a.userLastname}
            </div>
          )}
          <div style={{ fontSize:12, fontWeight:500, color:"var(--text-dim)", fontFamily:"'JetBrains Mono', monospace" }}>
            {a.studentRegistrationNumber ?? "—"}
          </div>
          {a.reason && <div style={{ fontSize:12, color:"var(--text-faint)", marginTop:2 }}>{a.reason}</div>}
        </div>
      </div>
      <div style={{ paddingTop:10, borderTop:"1px solid var(--border)", fontSize:11.5, color:"var(--text-faint)", fontFamily:"'JetBrains Mono', monospace" }}>
        {t("absences.sessionRef", { id: a.timetableId })}
      </div>
    </div>
  );
}

// ── Filter picker: narrow a long list using dropdowns built from the API's own
//    field values (class, day, status…) instead of a free-text search box. ──
function FilterPicker({
  items, value, onChange, getKey, getLabel, getSubLabel,
  filters = [], loading, emptyLabel,
  avatarColor = "var(--violet)", avatarBg = "var(--violet-dim)",
  t,
}) {
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => items.find(it => String(getKey(it)) === String(value)),
    [items, value, getKey]
  );

  const filterOptions = useMemo(() => {
    const opts = {};
    filters.forEach(f => {
      if (f.options) { opts[f.key] = f.options; return; }
      const seen = new Set();
      items.forEach(it => {
        const v = f.getValue(it);
        if (v !== null && v !== undefined && v !== "") seen.add(String(v));
      });
      opts[f.key] = [...seen].sort().map(v => ({ value: v, label: v }));
    });
    return opts;
  }, [items, filters]);

  const filtered = useMemo(() => {
    let arr = items.filter(it => filters.every(f => {
      const fv = filterValues[f.key];
      if (!fv) return true;
      return String(f.getValue(it)) === String(fv);
    }));
    if (search.trim()) {
      const lower = search.toLowerCase();
      arr = arr.filter(it => {
        const label = (getLabel(it) ?? "").toLowerCase();
        const sub = getSubLabel ? (getSubLabel(it) ?? "").toLowerCase() : "";
        return label.includes(lower) || sub.includes(lower);
      });
    }
    return arr;
  }, [items, filters, filterValues, search, getLabel, getSubLabel]);

  const hasActiveFilters = Object.values(filterValues).some(Boolean) || !!search.trim();
  const resetFilters = () => { setFilterValues({}); setSearch(""); };

  if (selected) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:"var(--r-md)", border:"1.5px solid var(--accent)", background:"var(--bg-card)" }}>
        <div style={{ width:28, height:28, borderRadius:8, background:avatarBg, color:avatarColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>
          {(getLabel(selected)?.[0] ?? "?").toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{getLabel(selected)}</div>
          {getSubLabel && <div style={{ fontSize:11.5, color:"var(--text-faint)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{getSubLabel(selected)}</div>}
        </div>
        <button type="button" onClick={() => { onChange(""); resetFilters(); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-faint)", fontSize:16, lineHeight:1, padding:2, flexShrink:0 }}>✕</button>
      </div>
    );
  }

  return (
    <div>
      <div className="search-wrap" style={{ marginBottom:10 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="search-input" placeholder={t("common.search")} value={search} onChange={e => setSearch(e.target.value)} style={{ width:"100%" }} />
      </div>
      {filters.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
          {filters.map(f => (
            <select
              key={f.key}
              className="t-select"
              value={filterValues[f.key] || ""}
              onChange={e => setFilterValues(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{ flex:"1 1 140px", minWidth:120 }}
            >
              <option value="">{f.label}: {t("absences.filterAllSuffix")}</option>
              {(filterOptions[f.key] || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="btn-ghost" style={{ padding:"6px 12px", fontSize:12, flexShrink:0, color:"var(--rose)", borderColor:"rgba(184,53,53,.25)" }}>✕ {t("common.clearFilters")}</button>
          )}
        </div>
      )}

      <div style={{ border:"1px solid var(--border-md)", borderRadius:"var(--r-md)", background:"var(--bg-card)", maxHeight:260, overflowY:"auto" }}>
        {loading ? (
          <div style={{ padding:"18px 16px", fontSize:13, color:"var(--text-faint)", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span className="spinner" style={{ width:14, height:14 }} /> {t("common.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"18px 16px", fontSize:13, color:"var(--text-faint)", textAlign:"center" }}>
            {items.length === 0 ? t("common.loading") : (hasActiveFilters ? t("absences.noFilterMatches") : (emptyLabel ?? t("absences.noResultsFound")))}
          </div>
        ) : filtered.map(it => (
          <div
            key={getKey(it)}
            onClick={() => onChange(getKey(it))}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", cursor:"pointer", transition:"background .12s", borderBottom:"1px solid var(--border)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width:26, height:26, borderRadius:8, background:avatarBg, color:avatarColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11.5, fontWeight:700, flexShrink:0 }}>
              {(getLabel(it)?.[0] ?? "?").toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{getLabel(it)}</div>
              {getSubLabel && <div style={{ fontSize:11, color:"var(--text-faint)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{getSubLabel(it)}</div>}
            </div>
          </div>
        ))}
      </div>
      {!loading && items.length > 0 && (
        <div style={{ marginTop:6, fontSize:11, color:"var(--text-faint)" }}>
          {t("absences.shownCount", { shown: filtered.length, total: items.length })}
        </div>
      )}
    </div>
  );
}

export default function AbsencePage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [tab, setTab] = useState("mark");

  // Mark tab
  const [timetables, setTimetables]               = useState([]);
  const [students, setStudents]                   = useState([]);
  const [loadingData, setLoadingData]             = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [selectedStudents, setSelectedStudents]   = useState(new Set());
  const [marking, setMarking]                     = useState(false);
  const [q, setQ]                                 = useState("");

  // By-session tab
  const [sessionId, setSessionId]             = useState("");
  const [sessionAbsences, setSessionAbsences] = useState([]);
  const [loadingSession, setLoadingSession]   = useState(false);
  const [sessionFetched, setSessionFetched]   = useState(false);
  const [loadingTimetables, setLoadingTimetables] = useState(false);

  // By-student tab
  const [studentId, setStudentId]             = useState("");
  const [studentAbsences, setStudentAbsences] = useState([]);
  const [loadingStudent, setLoadingStudent]   = useState(false);
  const [studentFetched, setStudentFetched]   = useState(false);
  const [allStudents, setAllStudents]         = useState([]);
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);

  // By-parent tab
  const [parentId, setParentId]               = useState("");
  const [parentAbsences, setParentAbsences]   = useState([]);
  const [loadingParent, setLoadingParent]     = useState(false);
  const [parentFetched, setParentFetched]     = useState(false);
  const [allParents, setAllParents]           = useState([]);
  const [loadingParents, setLoadingParents]   = useState(false);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadTimetables = async () => {
    if (timetables.length > 0) return;
    setLoadingTimetables(true);
    try {
      const tt = await getTimetables();
      setTimetables(Array.isArray(tt) ? tt : []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingTimetables(false); }
  };

  const loadMarkData = async () => {
    if (timetables.length > 0 && students.length > 0) return;
    setLoadingData(true);
    try {
      const jobs = [];
      if (timetables.length === 0) jobs.push(getTimetables().then(tt => setTimetables(Array.isArray(tt) ? tt : [])));
      if (students.length === 0)   jobs.push(getStudents().then(s => setStudents(Array.isArray(s) ? s : s?.content ?? [])));
      await Promise.all(jobs);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingData(false); }
  };

  const loadAllStudents = async () => {
    if (allStudents.length > 0) return;
    setLoadingAllStudents(true);
    try {
      const s = await getStudents();
      setAllStudents(Array.isArray(s) ? s : s?.content ?? []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingAllStudents(false); }
  };

  const loadAllParents = async () => {
    if (allParents.length > 0) return;
    setLoadingParents(true);
    try {
      const p = await getParents();
      setAllParents(Array.isArray(p) ? p : p?.content ?? []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingParents(false); }
  };

  // Fetch the Mark tab's data on first mount too, since it's the default tab
  // and previously only loaded when navigating *back* to it.
  useEffect(() => { loadMarkData(); }, []);

  const handleTabChange = tab => {
    setTab(tab);
    if (tab === "mark")       loadMarkData();
    if (tab === "by-session") loadTimetables();
    if (tab === "by-student") loadAllStudents();
    if (tab === "by-parent")  loadAllParents();
  };

  // ── Mark tab: restrict student pool to the selected session's class ─────────

  const selectedTimetableObj = useMemo(
    () => timetables.find(tt => String(tt.id) === String(selectedTimetable)),
    [timetables, selectedTimetable]
  );

  const classStudents = useMemo(() => {
    if (!selectedTimetableObj) return [];
    const ttClasseId   = selectedTimetableObj.classeId ?? selectedTimetableObj.classe?.id;
    const ttClasseName = selectedTimetableObj.classeName ?? selectedTimetableObj.classe?.name;
    return students.filter(s => {
      const sClasseId   = s.classeId ?? s.classe?.id;
      const sClasseName = s.classeName ?? s.classe?.name;
      if (ttClasseId != null && sClasseId != null) return String(sClasseId) === String(ttClasseId);
      return !!ttClasseName && ttClasseName === sClasseName;
    });
  }, [students, selectedTimetableObj]);

  // Reset the picked students (and search) whenever the session changes,
  // since the eligible student pool changes with it.
  useEffect(() => {
    setSelectedStudents(new Set());
    setQ("");
  }, [selectedTimetable]);

  const filteredStudents = useMemo(() => {
    if (!q.trim()) return classStudents;
    const lower = q.toLowerCase();
    return classStudents.filter(s =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(lower) ||
      s.registrationNumber?.toLowerCase().includes(lower)
    );
  }, [classStudents, q]);

  const toggleStudent = id => setSelectedStudents(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0)
      setSelectedStudents(new Set());
    else
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
  };

  const handleMark = async () => {
    if (!selectedTimetable) return toast(t("absences.selectSessionErr"), "error");
    if (selectedStudents.size === 0) return toast(t("absences.selectStudentErr"), "error");
    setMarking(true);
    try {
      await markAbsences({ timetableId: parseInt(selectedTimetable), studentIds: [...selectedStudents] });
      toast(t("absences.marked", { n: selectedStudents.size }));
      setSelectedStudents(new Set());
    } catch (e) { toast(e.message, "error"); }
    finally { setMarking(false); }
  };

  const fetchBySession = async () => {
    if (!sessionId) return toast(t("absences.sessionIdErr"), "error");
    setLoadingSession(true); setSessionFetched(false);
    try {
      const res = await getAbsencesByTimetable(sessionId);
      setSessionAbsences(Array.isArray(res) ? res : []);
      setSessionFetched(true);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingSession(false); }
  };

  const fetchByStudent = async () => {
    if (!studentId) return toast(t("absences.studentErr"), "error");
    setLoadingStudent(true); setStudentFetched(false);
    try {
      const res = await getAbsencesByStudent(studentId);
      setStudentAbsences(Array.isArray(res) ? res : []);
      setStudentFetched(true);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingStudent(false); }
  };

  const fetchByParent = async () => {
    if (!parentId) return toast(t("absences.selectParentErr"), "error");
    setLoadingParent(true); setParentFetched(false);
    try {
      const res = await getParentAbsences(parentId);
      setParentAbsences(Array.isArray(res) ? res : []);
      setParentFetched(true);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingParent(false); }
  };

  // Filter defs, built from real fields the API returns
  const dayOptions = DAY_ORDER.map(d => ({ value: d, label: t(`timetable.days.${d}`) }));
  const sessionFilters = [
    { key:"classeName", label:t("timetable.fields.class"), getValue: tt => tt.classeName },
    { key:"dayOfWeek",   label:t("timetable.fields.day"),   getValue: tt => tt.dayOfWeek, options: dayOptions },
  ];
  const studentFilters = [
    { key:"classeName", label:t("timetable.fields.class"), getValue: s => s.classeName },
  ];
  const parentFilters = [
    { key:"isApprove", label:t("common.status"), getValue: p => String(!!p.isApprove), options:[{ value:"true", label:t("common.approved") }, { value:"false", label:t("common.pending") }] },
  ];

  return (
    <div className="page-enter" style={{ padding:"32px 36px" }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div className="section-label" style={{ marginBottom:6 }}>{t("absences.crumb")}</div>
        <h1 style={{ margin:0, fontSize:24, fontFamily:"'Instrument Serif', serif", color:"var(--text)", letterSpacing:"-.03em" }}>{t("absences.title")}</h1>
        <p style={{ margin:"5px 0 0", fontSize:13.5, color:"var(--text-muted)" }}>{t("absences.subtitle")}</p>
      </div>

      <TabBar active={tab} onChange={handleTabChange} t={t} />

      {/* ── MARK TAB ── */}
      {tab === "mark" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          {loadingData ? (
            <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>{t("absences.loadingMsg")}</p></div>
          ) : (
            <>
              {/* Step 1 — Session */}
              <div className="card" style={{ padding:"22px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ width:26, height:26, borderRadius:8, background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>1</div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>{t("absences.step1")}</span>
                </div>
                <Field label={t("absences.session")}>
                  <FilterPicker
                    items={timetables}
                    value={selectedTimetable}
                    onChange={setSelectedTimetable}
                    filters={sessionFilters}
                    getKey={tt => tt.id}
                    getLabel={tt => `${t(`timetable.days.${tt.dayOfWeek}`)} ${tt.startTime}–${tt.endTime}`}
                    getSubLabel={tt => `${tt.matiereName} · ${tt.classeName}`}
                    avatarColor="var(--accent)"
                    avatarBg="var(--accent-dim, var(--surface))"
                    t={t}
                  />
                </Field>
              </div>

              {/* Step 2 — Students */}
              <div className="card" style={{ padding:"22px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:26, height:26, borderRadius:8, background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>2</div>
                    <span style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>{t("absences.step2")}</span>
                  </div>
                  {selectedTimetableObj && (
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      {selectedStudents.size > 0 && (
                        <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:600, border:"1px solid rgba(184,53,53,.2)" }}>
                          {t("absences.selected", { n: selectedStudents.size })}
                        </span>
                      )}
                      <button onClick={toggleAll} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12.5, color:"var(--blue)", fontWeight:500, fontFamily:"'Instrument Sans', sans-serif" }}>
                        {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? t("absences.deselectAll") : t("absences.selectAll")}
                      </button>
                    </div>
                  )}
                </div>

                {!selectedTimetableObj ? (
                  <div className="empty-state" style={{ padding:"28px 10px" }}>
                    <span style={{ fontSize:28 }}>🗓️</span>
                    <p style={{ margin:0, fontSize:13, color:"var(--text-faint)" }}>{t("absences.selectSessionHint")}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, gap:10, flexWrap:"wrap" }}>
                      <span style={{ padding:"3px 10px", borderRadius:999, background:"var(--accent-dim, var(--surface))", color:"var(--accent)", fontSize:11.5, fontWeight:600, border:"1px solid var(--border-md)" }}>
                        {selectedTimetableObj.classeName}
                      </span>
                      <span style={{ fontSize:11.5, color:"var(--text-faint)" }}>{t("absences.studentsInClassCount", { n: classStudents.length })}</span>
                    </div>

                    <div className="search-wrap" style={{ marginBottom:14 }}>
                      <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input className="search-input" placeholder={t("absences.searchStudents")} value={q} onChange={e => setQ(e.target.value)} />
                    </div>

                    {filteredStudents.length === 0 ? (
                      <div className="empty-state" style={{ padding:"24px 10px" }}>
                        <span style={{ fontSize:26 }}>🔍</span>
                        <p style={{ margin:0, fontSize:13, color:"var(--text-faint)" }}>{t("absences.noStudentsMatch")}</p>
                      </div>
                    ) : (
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:8, maxHeight:320, overflowY:"auto" }}>
                        {filteredStudents.map((s, i) => {
                          const checked = selectedStudents.has(s.id);
                          return (
                            <button key={s.id ?? i} onClick={() => toggleStudent(s.id)} style={{
                              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:"var(--r-md)",
                              background: checked ? "var(--rose-dim)" : "var(--surface)",
                              border:`1.5px solid ${checked ? "rgba(184,53,53,.3)" : "var(--border)"}`,
                              cursor:"pointer", textAlign:"left", fontFamily:"'Instrument Sans', sans-serif", transition:"all .13s",
                            }}>
                              <div style={{ width:16, height:16, borderRadius:5, flexShrink:0, background: checked ? "var(--rose)" : "transparent", border:`1.5px solid ${checked ? "var(--rose)" : "var(--border-md)"}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .13s" }}>
                                {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                              </div>
                              <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:12.5, fontWeight:500, color: checked ? "var(--rose)" : "var(--text-dim)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {s.firstname} {s.lastname}
                                </div>
                                {s.registrationNumber && <div style={{ fontSize:10.5, fontFamily:"'JetBrains Mono', monospace", color:"var(--text-faint)" }}>{s.registrationNumber}</div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleMark}
                disabled={marking || !selectedTimetable || selectedStudents.size === 0}
                className="btn-primary"
                style={{
                  fontSize:14, padding:"13px",
                  background: selectedStudents.size > 0 ? "var(--rose)" : "var(--surface)",
                  color: selectedStudents.size > 0 ? "#fff" : "var(--text-faint)",
                  boxShadow: selectedStudents.size > 0 ? "0 3px 12px rgba(184,53,53,.3)" : "none",
                }}
              >
                {marking
                  ? <><span className="spinner" style={{ width:14, height:14 }} /> {t("absences.marking")}</>
                  : t("absences.markBtn", { n: selectedStudents.size || 0 })}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── BY SESSION TAB ── */}
      {tab === "by-session" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label={t("absences.session")}>
                <FilterPicker
                  items={timetables}
                  value={sessionId}
                  onChange={setSessionId}
                  filters={sessionFilters}
                  loading={loadingTimetables}
                  getKey={tt => tt.id}
                  getLabel={tt => `${t(`timetable.days.${tt.dayOfWeek}`)} ${tt.startTime}–${tt.endTime}`}
                  getSubLabel={tt => `${tt.matiereName} · ${tt.classeName}`}
                  avatarColor="var(--accent)"
                  avatarBg="var(--accent-dim, var(--surface))"
                  t={t}
                />
              </Field>
              <button onClick={fetchBySession} disabled={loadingSession || !sessionId} className="btn-primary" style={{ height:44 }}>
                {loadingSession ? <><span className="spinner" style={{ width:13, height:13 }} /> {t("absences.loading")}</> : t("absences.fetchBtn")}
              </button>
            </div>
          </div>

          {sessionFetched && (
            sessionAbsences.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize:32 }}>✅</span><p>{t("absences.noAbsencesSession")}</p></div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="section-label">{t("absences.absencesLabel")}</span>
                  <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:700, border:"1px solid rgba(184,53,53,.2)" }}>{sessionAbsences.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 }}>
                  {sessionAbsences.map((a, i) => <AbsenceCard key={a.id ?? i} a={a} t={t} />)}
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* ── BY STUDENT TAB ── */}
      {tab === "by-student" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label={t("absences.student")}>
                <FilterPicker
                  items={allStudents}
                  value={studentId}
                  onChange={setStudentId}
                  filters={studentFilters}
                  loading={loadingAllStudents}
                  getKey={s => s.id}
                  getLabel={s => `${s.firstname} ${s.lastname}`}
                  getSubLabel={s => s.registrationNumber}
                  avatarColor="var(--teal)"
                  avatarBg="var(--teal-dim)"
                  t={t}
                />
              </Field>
              <button onClick={fetchByStudent} disabled={loadingStudent || !studentId} className="btn-primary" style={{ height:44 }}>
                {loadingStudent ? <><span className="spinner" style={{ width:13, height:13 }} /> {t("absences.loading")}</> : t("absences.fetchBtn")}
              </button>
            </div>
          </div>

          {studentFetched && (
            studentAbsences.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize:32 }}>✅</span><p>{t("absences.noAbsencesStudent")}</p></div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="section-label">{t("absences.totalAbsences")}</span>
                  <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:700, border:"1px solid rgba(184,53,53,.2)" }}>{studentAbsences.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 }}>
                  {studentAbsences.map((a, i) => <AbsenceCard key={a.id ?? i} a={a} t={t} />)}
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* ── BY PARENT TAB ── */}
      {tab === "by-parent" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label={t("absences.parentLabel")}>
                <FilterPicker
                  items={allParents}
                  value={parentId}
                  onChange={setParentId}
                  filters={parentFilters}
                  loading={loadingParents}
                  getKey={p => p.id}
                  getLabel={p => `${p.firstname} ${p.lastname}`}
                  getSubLabel={p => p.phone || p.email}
                  avatarColor="var(--amber)"
                  avatarBg="var(--amber-dim)"
                  t={t}
                />
              </Field>
              <button onClick={fetchByParent} disabled={loadingParent || !parentId} className="btn-primary" style={{ height:44 }}>
                {loadingParent ? <><span className="spinner" style={{ width:13, height:13 }} /> {t("absences.loading")}</> : t("absences.fetchBtn")}
              </button>
            </div>
          </div>

          {parentFetched && (
            parentAbsences.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize:32 }}>✅</span><p>{t("absences.noAbsencesParent")}</p></div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="section-label">{t("absences.absencesLabel")}</span>
                  <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:700, border:"1px solid rgba(184,53,53,.2)" }}>{parentAbsences.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 }}>
                  {parentAbsences.map((a, i) => <AbsenceCard key={a.id ?? i} a={a} t={t} />)}
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}