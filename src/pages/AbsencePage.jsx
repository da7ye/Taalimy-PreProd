import { useState, useMemo } from "react";
import { markAbsences, getAbsencesByTimetable, getAbsencesByStudent, getTimetables, getStudents } from "../api";
import { Field, Select } from "../components/FormComponents";
import { useToast } from "../components/Toast";

const DAY_STYLE = {
  MONDAY:    { color:"var(--violet)", bg:"var(--violet-dim)" },
  TUESDAY:   { color:"var(--teal)",   bg:"var(--teal-dim)"   },
  WEDNESDAY: { color:"var(--rose)",   bg:"var(--rose-dim)"   },
  THURSDAY:  { color:"var(--amber)",  bg:"var(--amber-dim)"  },
  FRIDAY:    { color:"var(--green)",  bg:"var(--green-dim)"  },
  SATURDAY:  { color:"var(--blue)",   bg:"var(--blue-dim)"   },
  SUNDAY:    { color:"var(--rose)",   bg:"var(--rose-dim)"   },
};

const TABS = [
  { id:"mark",       label:"✏️  Mark Absences"  },
  { id:"by-session", label:"📅  By Session"      },
  { id:"by-student", label:"👤  By Student"      },
];

function TabBar({ active, onChange }) {
  return (
    <div style={{
      display:"flex", gap:4, padding:5,
      borderRadius:"var(--r-lg)",
      background:"var(--bg-card)",
      border:"1px solid var(--border)",
      boxShadow:"var(--shadow-sm)",
      width:"fit-content", marginBottom:28,
    }}>
      {TABS.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding:"8px 20px", borderRadius:"var(--r-md)",
            border:"none", cursor:"pointer",
            background: isActive ? "var(--accent)" : "transparent",
            color: isActive ? "#fff" : "var(--text-muted)",
            fontSize:13, fontWeight: isActive ? 600 : 400,
            fontFamily:"'Instrument Sans', sans-serif",
            boxShadow: isActive ? "0 2px 8px var(--accent-glow)" : "none",
            transition:"all .15s",
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

function AbsenceCard({ a }) {
  const ds = DAY_STYLE[a.timetableDayOfWeek] || { color:"var(--text-muted)", bg:"var(--surface)" };
  return (
    <div className="card" style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{
          padding:"3px 10px", borderRadius:999,
          background:ds.bg, color:ds.color,
          fontSize:11.5, fontWeight:700,
          fontFamily:"'JetBrains Mono', monospace",
          border:`1px solid ${ds.color}22`,
        }}>
          {a.timetableDayOfWeek}{a.timetableStartTime ? ` · ${a.timetableStartTime}` : ""}
        </span>
        <span style={{ fontSize:11.5, color:"var(--text-faint)" }}>{a.date ?? "—"}</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background:"var(--rose-dim)", border:"1px solid rgba(184,53,53,.18)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16,
        }}>🚫</div>
        <div>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text-dim)", fontFamily:"'JetBrains Mono', monospace" }}>
            {a.studentRegistrationNumber ?? "—"}
          </div>
          {a.reason && <div style={{ fontSize:12, color:"var(--text-faint)", marginTop:2 }}>{a.reason}</div>}
        </div>
      </div>

      <div style={{ paddingTop:10, borderTop:"1px solid var(--border)", fontSize:11.5, color:"var(--text-faint)", fontFamily:"'JetBrains Mono', monospace" }}>
        Session #{a.timetableId}
      </div>
    </div>
  );
}

export default function AbsencePage() {
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

  // By-student tab
  const [studentId, setStudentId]             = useState("");
  const [studentAbsences, setStudentAbsences] = useState([]);
  const [loadingStudent, setLoadingStudent]   = useState(false);
  const [studentFetched, setStudentFetched]   = useState(false);
  const [allStudents, setAllStudents]         = useState([]);

  const loadMarkData = async () => {
    if (timetables.length > 0) return;
    setLoadingData(true);
    try {
      const [t, s] = await Promise.all([getTimetables(), getStudents()]);
      setTimetables(Array.isArray(t) ? t : []);
      setStudents(Array.isArray(s) ? s : s?.content ?? []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingData(false); }
  };

  const loadAllStudents = async () => {
    if (allStudents.length > 0) return;
    try {
      const s = await getStudents();
      setAllStudents(Array.isArray(s) ? s : s?.content ?? []);
    } catch (e) { toast(e.message, "error"); }
  };

  const handleTabChange = t => {
    setTab(t);
    if (t === "mark") loadMarkData();
    if (t === "by-student") loadAllStudents();
  };

  const filteredStudents = useMemo(() => {
    if (!q.trim()) return students;
    const lower = q.toLowerCase();
    return students.filter(s =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(lower) ||
      s.registrationNumber?.toLowerCase().includes(lower)
    );
  }, [students, q]);

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
    if (!selectedTimetable) return toast("Please select a session first.", "error");
    if (selectedStudents.size === 0) return toast("Select at least one student.", "error");
    setMarking(true);
    try {
      await markAbsences({ timetableId: parseInt(selectedTimetable), studentIds: [...selectedStudents] });
      toast(`${selectedStudents.size} absence(s) marked!`);
      setSelectedStudents(new Set());
    } catch (e) { toast(e.message, "error"); }
    finally { setMarking(false); }
  };

  const fetchBySession = async () => {
    if (!sessionId) return toast("Enter a session ID.", "error");
    setLoadingSession(true); setSessionFetched(false);
    try {
      const res = await getAbsencesByTimetable(sessionId);
      setSessionAbsences(Array.isArray(res) ? res : []);
      setSessionFetched(true);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingSession(false); }
  };

  const fetchByStudent = async () => {
    if (!studentId) return toast("Select a student.", "error");
    setLoadingStudent(true); setStudentFetched(false);
    try {
      const res = await getAbsencesByStudent(studentId);
      setStudentAbsences(Array.isArray(res) ? res : []);
      setStudentFetched(true);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoadingStudent(false); }
  };

  return (
    <div className="page-enter" style={{ padding:"32px 36px" }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div className="section-label" style={{ marginBottom:6 }}>Attendance</div>
        <h1 style={{ margin:0, fontSize:24, fontFamily:"'Instrument Serif', serif", color:"var(--text)", letterSpacing:"-.03em" }}>Absences</h1>
        <p style={{ margin:"5px 0 0", fontSize:13.5, color:"var(--text-muted)" }}>
          Mark and review student absences by session or student.
        </p>
      </div>

      <TabBar active={tab} onChange={handleTabChange} />

      {/* ── MARK TAB ── */}
      {tab === "mark" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          {loadingData ? (
            <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>Loading sessions and students…</p></div>
          ) : (
            <>
              {/* Step 1 — Session */}
              <div className="card" style={{ padding:"22px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ width:26, height:26, borderRadius:8, background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>1</div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>Select a Session</span>
                </div>
                <Field label="Timetable Session">
                  <Select value={selectedTimetable} onChange={e => setSelectedTimetable(e.target.value)}>
                    <option value="">— Choose a session —</option>
                    {timetables.map(t => (
                      <option key={t.id} value={t.id}>
                        #{t.id} · {t.dayOfWeek} {t.startTime}–{t.endTime} · {t.matiereName} · {t.classeName}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Step 2 — Students */}
              <div className="card" style={{ padding:"22px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:26, height:26, borderRadius:8, background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>2</div>
                    <span style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>Mark Absent Students</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    {selectedStudents.size > 0 && (
                      <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:600, border:"1px solid rgba(184,53,53,.2)" }}>
                        {selectedStudents.size} selected
                      </span>
                    )}
                    <button onClick={toggleAll} style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:12.5, color:"var(--blue)", fontWeight:500,
                      fontFamily:"'Instrument Sans', sans-serif",
                    }}>
                      {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="search-wrap" style={{ marginBottom:14 }}>
                  <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input className="search-input" placeholder="Search students…" value={q} onChange={e => setQ(e.target.value)} />
                </div>

                {/* Student checkbox grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:8, maxHeight:320, overflowY:"auto" }}>
                  {filteredStudents.map((s, i) => {
                    const checked = selectedStudents.has(s.id);
                    return (
                      <button key={s.id ?? i} onClick={() => toggleStudent(s.id)} style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"9px 12px", borderRadius:"var(--r-md)",
                        background: checked ? "var(--rose-dim)" : "var(--surface)",
                        border:`1.5px solid ${checked ? "rgba(184,53,53,.3)" : "var(--border)"}`,
                        cursor:"pointer", textAlign:"left",
                        fontFamily:"'Instrument Sans', sans-serif",
                        transition:"all .13s",
                      }}>
                        {/* Checkbox */}
                        <div style={{
                          width:16, height:16, borderRadius:5, flexShrink:0,
                          background: checked ? "var(--rose)" : "transparent",
                          border:`1.5px solid ${checked ? "var(--rose)" : "var(--border-md)"}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .13s",
                        }}>
                          {checked && (
                            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12.5, fontWeight:500, color: checked ? "var(--rose)" : "var(--text-dim)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {s.firstname} {s.lastname}
                          </div>
                          {s.registrationNumber && (
                            <div style={{ fontSize:10.5, fontFamily:"'JetBrains Mono', monospace", color:"var(--text-faint)" }}>{s.registrationNumber}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                  ? <><span className="spinner" style={{ width:14, height:14 }} /> Marking…</>
                  : `Mark ${selectedStudents.size || 0} Absence${selectedStudents.size !== 1 ? "s" : ""}`}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── BY SESSION TAB ── */}
      {tab === "by-session" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:700 }}>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-end" }}>
              <Field label="Session ID" style={{ flex:1 }}>
                <input type="number" placeholder="e.g. 3" value={sessionId} onChange={e => setSessionId(e.target.value)} className="t-input" />
              </Field>
              <button onClick={fetchBySession} disabled={loadingSession || !sessionId} className="btn-primary" style={{ flexShrink:0, height:44 }}>
                {loadingSession ? <><span className="spinner" style={{ width:13, height:13 }} /> Loading…</> : "Fetch Absences"}
              </button>
            </div>
          </div>

          {sessionFetched && (
            sessionAbsences.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize:32 }}>✅</span><p>No absences recorded for this session.</p></div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="section-label">Absences</span>
                  <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:700, border:"1px solid rgba(184,53,53,.2)" }}>{sessionAbsences.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 }}>
                  {sessionAbsences.map((a, i) => <AbsenceCard key={a.id ?? i} a={a} />)}
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
            <div style={{ display:"flex", gap:12, alignItems:"flex-end" }}>
              <div style={{ flex:1 }}>
                <Field label="Student">
                  <Select value={studentId} onChange={e => setStudentId(e.target.value)}>
                    <option value="">— Select a student —</option>
                    {allStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.firstname} {s.lastname}{s.registrationNumber ? ` · ${s.registrationNumber}` : ""}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <button onClick={fetchByStudent} disabled={loadingStudent || !studentId} className="btn-primary" style={{ flexShrink:0, height:44 }}>
                {loadingStudent ? <><span className="spinner" style={{ width:13, height:13 }} /> Loading…</> : "Fetch Absences"}
              </button>
            </div>
          </div>

          {studentFetched && (
            studentAbsences.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize:32 }}>✅</span><p>No absences recorded for this student.</p></div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="section-label">Total absences</span>
                  <span style={{ padding:"2px 10px", borderRadius:999, background:"var(--rose-dim)", color:"var(--rose)", fontSize:12, fontWeight:700, border:"1px solid rgba(184,53,53,.2)" }}>{studentAbsences.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 }}>
                  {studentAbsences.map((a, i) => <AbsenceCard key={a.id ?? i} a={a} />)}
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}