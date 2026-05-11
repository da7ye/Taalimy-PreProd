import { useEffect, useState, useMemo } from "react";
import { getAssignments, createAssignment, deleteAssignment, getTeachers, getMatiereNames, getClasseNames } from "../api";
import { Field, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--amber)";
const C_BG    = "var(--amber-dim)";

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, classeId, matiereId }) {
  const steps = [
    { num: 1, label: "Class",   icon: "🏫", done: !!classeId },
    { num: 2, label: "Subject", icon: "📐", done: !!matiereId },
    { num: 3, label: "Teacher", icon: "🎓", done: false },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const isActive = step === s.num;
        const isDone   = s.done && step > s.num;
        const isLocked = step < s.num;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 72 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 700,
                transition: "all .2s ease",
                background: isDone
                  ? "var(--green-dim)"
                  : isActive
                    ? C_BG
                    : "var(--surface)",
                color: isDone
                  ? "var(--green)"
                  : isActive
                    ? C_COLOR
                    : "var(--text-faint)",
                border: `1.5px solid ${isDone ? "rgba(42,117,64,.25)" : isActive ? `${C_COLOR}40` : "var(--border)"}`,
                boxShadow: isActive ? `0 0 0 3px ${C_COLOR}18` : "none",
              }}>
                {isDone ? "✓" : s.icon}
              </div>
              <span style={{
                fontSize: 11, fontWeight: isActive ? 700 : 500,
                color: isLocked ? "var(--text-faint)" : isActive ? C_COLOR : "var(--text-muted)",
                letterSpacing: ".02em",
                transition: "color .2s",
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 4px", marginBottom: 22,
                background: isDone ? "var(--green-dim)" : "var(--border)",
                borderRadius: 2, transition: "background .2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:13, fontFamily:"'Instrument Sans',sans-serif", padding:0, marginBottom:28, transition:"color .13s" }}
      onMouseEnter={e => e.currentTarget.style.color="var(--text)"}
      onMouseLeave={e => e.currentTarget.style.color="var(--text-muted)"}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      {label}
    </button>
  );
}

function PageTitle({ crumb, title, sub }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div className="section-label" style={{ marginBottom:6 }}>{crumb}</div>
      <h1 style={{ margin:0, fontSize:26, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.03em" }}>{title}</h1>
      {sub && <p style={{ margin:"6px 0 0", fontSize:14, color:"var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function FormPanel({ children, onSubmit }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)" }}>
      <form onSubmit={onSubmit} style={{ padding:"32px 36px", display:"flex", flexDirection:"column", gap:20 }}>{children}</form>
    </div>
  );
}

function SidePanel({ title, items, accentColor, accentBg, icon, sectionLabel }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"28px 24px", boxShadow:"var(--shadow-sm)", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:accentBg, color:accentColor, border:`2px solid ${accentColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 14px" }}>{icon}</div>
        <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{title}</div>
      </div>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"20px 24px", boxShadow:"var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom:12 }}>{sectionLabel}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map((item,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{item.icon}</span>
              <span style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }}>
      <div>{left}</div><div>{right}</div>
    </div>
  );
}

function StatBox({ icon, label, value, color, bg }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:bg??C_BG, color:color??C_COLOR, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

// ─── Locked-field placeholder ─────────────────────────────────────────────────
function LockedField({ label, hint, message }) {
  return (
    <Field label={label} hint={hint}>
      <div style={{
        width: "100%", padding: "11px 14px",
        borderRadius: "var(--r-md)",
        border: "1.5px dashed var(--border-md)",
        background: "var(--surface)",
        color: "var(--text-faint)",
        fontSize: 13.5,
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "'Instrument Sans', sans-serif",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        {message}
      </div>
    </Field>
  );
}

function AssignmentCard({ r, onClick, onDelete, t }) {
  return (
    <div className="person-card" style={{ "--card-top":C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:5 }}>{r.matiereName ?? "—"}</div>
          <span style={{ padding:"2px 9px", borderRadius:999, background:"var(--purple-dim)", color:"var(--purple)", fontSize:11.5, fontWeight:600, border:"1px solid var(--purple-dim)" }}>
            {r.classeName ?? "—"}
          </span>
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--text-faint)", padding:"3px 8px", borderRadius:6, background:"var(--surface)", border:"1px solid var(--border)", flexShrink:0 }}>#{r.id}</span>
      </div>
      <div style={{ paddingTop:12, borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"var(--violet-dim)", color:"var(--violet)", fontFamily:"'Instrument Serif',serif", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {(r.teacherName?.[0]??"T").toUpperCase()}
          </div>
          <span style={{ fontSize:13, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>{r.teacherName ?? "—"}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(r); }} className="btn-danger" style={{ fontSize:12, padding:"5px 12px", flexShrink:0 }}>{t("common.delete")}</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssignmentsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [q, setQ]               = useState("");
  const [filterClass, setFilterClass] = useState("ALL");

  // Cascading form state
  const [classeId,   setClasseId]   = useState("");
  const [matiereId,  setMatiereId]  = useState("");
  const [teacherId,  setTeacherId]  = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([getAssignments(), getTeachers(), getMatiereNames(), getClasseNames()])
      .then(([a, te, m, c]) => {
        setData(Array.isArray(a) ? a : []);
        setTeachers(te ?? []);
        setMatieres(m  ?? []);
        setClasses(c   ?? []);
      })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const classNames = useMemo(() => [...new Set(data.map(r => r.classeName).filter(Boolean))], [data]);

  const filtered = useMemo(() => data.filter(r => {
    const mc = filterClass === "ALL" || r.classeName === filterClass;
    const mq = !q.trim() || [r.teacherName, r.matiereName, r.classeName].some(x => x?.toLowerCase().includes(q.toLowerCase()));
    return mc && mq;
  }), [data, filterClass, q]);

  const goList = () => {
    setView("list");
    setSelected(null);
    setClasseId(""); setMatiereId(""); setTeacherId("");
  };

  // Which matieres are already assigned to the selected class?
  // We use existing assignments to populate the subject list for that class.
  // If none exist yet, fall back to the full matieres list.
  const matieresForClass = useMemo(() => {
    if (!classeId) return [];
    // Gather matiereIds already mapped to this class from existing assignments
    const assigned = data.filter(r => String(r.classeId) === String(classeId));
    const assignedIds = new Set(assigned.map(r => String(r.matiereId)));
    // Use the full matieres list but highlight/filter to those already in this class
    // If there are known mappings, show those; otherwise show all matieres
    if (assignedIds.size > 0) {
      return matieres.filter(m => assignedIds.has(String(m.id)));
    }
    // No existing assignments for this class yet — show all matieres
    return matieres;
  }, [classeId, data, matieres]);

  // Which teachers can teach the selected matiere in the selected class?
  // Derive from existing assignments or fall back to all teachers.
  const teachersForMatiere = useMemo(() => {
    if (!matiereId) return [];
    const assigned = data.filter(
      r => String(r.classeId) === String(classeId) && String(r.matiereId) === String(matiereId)
    );
    const assignedIds = new Set(assigned.map(r => String(r.teacherId)));
    if (assignedIds.size > 0) {
      return teachers.filter(t => assignedIds.has(String(t.id)));
    }
    return teachers;
  }, [matiereId, classeId, data, teachers]);

  // Derived step (1 = picking class, 2 = picking matiere, 3 = picking teacher)
  const step = !classeId ? 1 : !matiereId ? 2 : 3;

  const selectedClassName  = classes.find(c  => String(c.id)  === String(classeId))?.name;
  const selectedMatiereName = matieres.find(m => String(m.id)  === String(matiereId))?.name;
  const selectedTeacherName = teachers.find(te => String(te.id) === String(teacherId));

  const handleCreate = async e => {
    e.preventDefault();
    if (!classeId || !matiereId || !teacherId) return;
    setSaving(true);
    try {
      await createAssignment(teacherId, matiereId, classeId);
      setClasseId(""); setMatiereId(""); setTeacherId("");
      toast(t("assignments.created"));
      load();
      goList();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAssignment(deleteTarget.id);
      setDeleteTarget(null);
      toast(t("assignments.deleted"));
      load();
      if (view !== "list") goList();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── LIST ── */
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle
          crumb={t("assignments.crumb")}
          title={t("assignments.title")}
          sub={loading ? t("common.loading") : t("assignments.count", { n: filtered.length })}
        />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom:32 }}>
          {t("assignments.addBtn")}
        </button>
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div className="search-wrap" style={{ flex:"0 0 280px" }}>
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder={t("assignments.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {classNames.length > 0 && (
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="t-select" style={{ width:"auto", minWidth:150, fontSize:13 }}>
            <option value="ALL">{t("assignments.allClasses")}</option>
            {classNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading
        ? <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>{t("common.loading")}</p></div>
        : filtered.length === 0
          ? <div className="empty-state"><span style={{ fontSize:36 }}>📋</span><p>{q ? `${t("common.noResults")} "${q}"` : t("assignments.empty")}</p></div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
              {filtered.map((r,i) => (
                <AssignmentCard
                  key={r.id ?? i} r={r} t={t}
                  onClick={r => { setSelected(r); setView("detail"); }}
                  onDelete={target => setDeleteTarget(target)}
                />
              ))}
            </div>
      }

      {deleteTarget && (
        <ConfirmDialog
          title={t("assignments.deleteTitle")}
          message={t("assignments.deleteMsg", { teacher: deleteTarget.teacherName, subject: deleteTarget.matiereName, class: deleteTarget.classeName })}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}
    </div>
  );

  /* ── CREATE ── */
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("assignments.detailBack")} onClick={goList} />
      <PageTitle
        crumb={t("assignments.crumb")}
        title={t("assignments.createTitle")}
        sub={t("assignments.createSub")}
      />
      <TwoCol
        left={
          <FormPanel onSubmit={handleCreate}>
            {/* Step indicator */}
            <StepIndicator step={step} classeId={classeId} matiereId={matiereId} />

            {/* ── Step 1: Class ── */}
            <Field label={t("assignments.class")} hint={t("assignments.classHint")}>
              <select
                className="t-select"
                value={classeId}
                onChange={e => {
                  setClasseId(e.target.value);
                  setMatiereId("");   // reset downstream
                  setTeacherId("");
                }}
                required
              >
                <option value="">{t("assignments.selectClass")}</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            {/* ── Step 2: Subject (locked until class chosen) ── */}
            {!classeId ? (
              <LockedField
                label={t("assignments.subject")}
                hint={t("assignments.subjectHint")}
                message="Select a class first"
              />
            ) : (
              <Field label={t("assignments.subject")} hint={t("assignments.subjectHint")}>
                <select
                  className="t-select"
                  value={matiereId}
                  onChange={e => {
                    setMatiereId(e.target.value);
                    setTeacherId("");  // reset downstream
                  }}
                  required
                >
                  <option value="">{t("assignments.selectSubject")}</option>
                  {matieresForClass.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {matieresForClass.length === 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>⚠️</span> No subjects found for this class yet — showing all subjects.
                  </div>
                )}
              </Field>
            )}

            {/* ── Step 3: Teacher (locked until subject chosen) ── */}
            {!matiereId ? (
              <LockedField
                label={t("assignments.teacher")}
                hint={t("assignments.teacherHint")}
                message={classeId ? "Select a subject first" : "Select a class first"}
              />
            ) : (
              <Field label={t("assignments.teacher")} hint={t("assignments.teacherHint")}>
                <select
                  className="t-select"
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  required
                >
                  <option value="">{t("assignments.selectTeacher")}</option>
                  {teachersForMatiere.map(te => (
                    <option key={te.id} value={te.id}>
                      {te.firstname} {te.lastname}{te.speciality ? ` · ${te.speciality}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {/* Summary strip (shown when all three are chosen) */}
            {classeId && matiereId && teacherId && (
              <div style={{
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                background: C_BG,
                border: `1px solid ${C_COLOR}30`,
                display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>Ready to assign:</span>
                {[
                  { icon: "🏫", label: selectedClassName },
                  { icon: "📐", label: selectedMatiereName },
                  { icon: "🎓", label: selectedTeacherName ? `${selectedTeacherName.firstname} ${selectedTeacherName.lastname}${selectedTeacherName.speciality ? ` · ${selectedTeacherName.speciality}` : ""}` : "—" },
                ].map((chip, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 999,
                    background: "var(--bg-card)", border: "1px solid var(--border-md)",
                    fontSize: 12, fontWeight: 600, color: "var(--text-dim)",
                  }}>
                    {chip.icon} {chip.label}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:12, paddingTop:4 }}>
              <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>
                {t("common.cancel")}
              </button>
              <div style={{ flex:2 }}>
                <SubmitBtn
                  loading={saving}
                  label={t("assignments.createBtn")}
                  disabled={!classeId || !matiereId || !teacherId}
                />
              </div>
            </div>
          </FormPanel>
        }
        right={
          <SidePanel
            icon="📋"
            title={t("assignments.sideNote")}
            accentColor={C_COLOR}
            accentBg={C_BG}
            sectionLabel={t("assignments.howItWorks")}
            items={[
              { icon: "🏫", text: "Start by choosing the class you want to assign a subject to." },
              { icon: "📐", text: "Then pick the subject from the list available for that class." },
              { icon: "🎓", text: "Finally select the teacher who will teach that subject." },
            ]}
          />
        }
      />
    </div>
  );

  /* ── DETAIL ── */
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label={t("assignments.detailBack")} onClick={goList} />
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24 }}>
          <div style={{ height:90, background:`linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding:"0 36px 28px", marginTop:-36 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20 }}>
                <div style={{ width:80, height:80, borderRadius:22, background:C_BG, color:C_COLOR, border:"3px solid var(--bg-card)", boxShadow:`0 0 0 2px ${C_COLOR}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>📋</div>
                <div style={{ paddingBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:22, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.025em" }}>{v.matiereName ?? "—"}</h2>
                  <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap" }}>
                    <span style={{ padding:"3px 11px", borderRadius:999, background:"var(--purple-dim)", color:"var(--purple)", fontSize:12, fontWeight:600, border:"1px solid var(--purple-dim)" }}>{v.classeName}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, padding:"3px 10px", borderRadius:6, background:"var(--surface)", border:"1px solid var(--border-md)", color:"var(--text-muted)" }}>ID #{v.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding:"10px 20px" }}>🗑 {t("common.delete")}</button>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          <StatBox icon="📐" label={t("assignments.fields.subject")} value={v.matiereName} color={C_COLOR}           bg={C_BG} />
          <StatBox icon="🏫" label={t("assignments.fields.class")}   value={v.classeName}  color="var(--purple)"     bg="var(--purple-dim)" />
          <StatBox icon="🎓" label={t("assignments.fields.teacher")} value={v.teacherName} color="var(--violet)"     bg="var(--violet-dim)" />
        </div>
        {deleteTarget && (
          <ConfirmDialog
            title={t("assignments.deleteTitle")}
            message={t("assignments.deleteMsg", { teacher: deleteTarget.teacherName, subject: deleteTarget.matiereName, class: deleteTarget.classeName })}
            onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
          />
        )}
      </div>
    );
  }

  return null;
}