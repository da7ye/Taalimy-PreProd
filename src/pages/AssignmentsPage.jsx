import { useEffect, useState, useMemo } from "react";
import { getAssignments, createAssignment, deleteAssignment, getTeacherNames, getMatiereNames, getClasseNames } from "../api";
import { Field, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const C_COLOR = "var(--amber)";
const C_BG    = "var(--amber-dim)";

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

function SidePanel({ title, items, accentColor, accentBg, icon }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"28px 24px", boxShadow:"var(--shadow-sm)", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:accentBg, color:accentColor, border:`2px solid ${accentColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 14px" }}>{icon}</div>
        <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{title}</div>
      </div>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"20px 24px", boxShadow:"var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom:12 }}>How it works</div>
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

function AssignmentCard({ r, onClick, onDelete }) {
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
        <button onClick={e => { e.stopPropagation(); onDelete(r); }} className="btn-danger" style={{ fontSize:12, padding:"5px 12px", flexShrink:0 }}>Delete</button>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
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
  const [form, setForm]         = useState({ teacherId:"", matiereId:"", classeId:"" });
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getAssignments(), getTeacherNames(), getMatiereNames(), getClasseNames()])
      .then(([a, t, m, c]) => { setData(Array.isArray(a)?a:[]); setTeachers(t??[]); setMatieres(m??[]); setClasses(c??[]); })
      .catch(e => toast(e.message, "error")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const classNames = useMemo(() => [...new Set(data.map(r => r.classeName).filter(Boolean))], [data]);

  const filtered = useMemo(() => data.filter(r => {
    const mc = filterClass === "ALL" || r.classeName === filterClass;
    const mq = !q.trim() || [r.teacherName, r.matiereName, r.classeName].some(x => x?.toLowerCase().includes(q.toLowerCase()));
    return mc && mq;
  }), [data, filterClass, q]);

  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createAssignment(form.teacherId, form.matiereId, form.classeId); setForm({ teacherId:"", matiereId:"", classeId:"" }); toast("Assignment created!"); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteAssignment(deleteTarget.id); setDeleteTarget(null); toast("Assignment deleted."); load(); if (view !== "list") goList(); }
    catch (err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  /* LIST */
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle crumb="Academics · Teaching" title="Assignments" sub={loading ? "Loading…" : `${filtered.length} teacher–subject–class assignment${filtered.length!==1?"s":""}`} />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom:32 }}>+ New Assignment</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div className="search-wrap" style={{ flex:"0 0 280px" }}>
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="Search teacher, subject, class…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {classNames.length > 0 && (
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
            className="t-select" style={{ width:"auto", minWidth:150, fontSize:13 }}>
            <option value="ALL">All Classes</option>
            {classNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>Loading…</p></div>
      : filtered.length === 0 ? <div className="empty-state"><span style={{ fontSize:36 }}>📋</span><p>{q ? `No results for "${q}"` : "No assignments yet."}</p></div>
      : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
          {filtered.map((r,i) => <AssignmentCard key={r.id??i} r={r} onClick={r => { setSelected(r); setView("detail"); }} onDelete={t => setDeleteTarget(t)} />)}
        </div>}

      {deleteTarget && <ConfirmDialog title="Delete Assignment?" message={`Remove ${deleteTarget.teacherName} → ${deleteTarget.matiereName} → ${deleteTarget.classeName}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </div>
  );

  /* CREATE */
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label="Back to Assignments" onClick={goList} />
      <PageTitle crumb="Academics · Teaching" title="New Assignment" sub="Link a teacher to a subject and a class." />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label="Teacher" hint="The teacher who will teach this subject">
            <Select value={form.teacherId} onChange={set("teacherId")} required>
              <option value="">— Select teacher —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.phone}{t.speciality ? ` · ${t.speciality}` : ""}</option>)}
            </Select>
          </Field>
          <Field label="Subject" hint="The subject being taught">
            <Select value={form.matiereId} onChange={set("matiereId")} required>
              <option value="">— Select subject —</option>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
          <Field label="Class" hint="The class that will receive this subject">
            <Select value={form.classeId} onChange={set("classeId")} required>
              <option value="">— Select class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>Cancel</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label="Create Assignment" /></div>
          </div>
        </FormPanel>}
        right={<SidePanel
          icon="📋"
          title="An assignment links a teacher, a subject, and a class together so sessions can be scheduled in the timetable."
          accentColor={C_COLOR} accentBg={C_BG}
          items={[
            { icon:"🎓", text:"One teacher can be assigned to multiple subjects and classes." },
            { icon:"📐", text:"A subject can be taught by different teachers in different classes." },
            { icon:"🗓️", text:"After creating an assignment, add it to the timetable as a session." },
          ]} />}
      />
    </div>
  );

  /* DETAIL */
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label="Back to Assignments" onClick={goList} />

        {/* Hero header */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24 }}>
          <div style={{ height:90, background:`linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding:"0 36px 28px", marginTop:-36 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20 }}>
                {/* Icon avatar */}
                <div style={{ width:80, height:80, borderRadius:22, background:C_BG, color:C_COLOR, border:"3px solid var(--bg-card)", boxShadow:`0 0 0 2px ${C_COLOR}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>
                  📋
                </div>
                <div style={{ paddingBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:22, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.025em" }}>{v.matiereName ?? "—"}</h2>
                  <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap" }}>
                    <span style={{ padding:"3px 11px", borderRadius:999, background:"var(--purple-dim)", color:"var(--purple)", fontSize:12, fontWeight:600, border:"1px solid var(--purple-dim)" }}>{v.classeName}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, padding:"3px 10px", borderRadius:6, background:"var(--surface)", border:"1px solid var(--border-md)", color:"var(--text-muted)" }}>ID #{v.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding:"10px 20px" }}>🗑 Delete</button>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          <StatBox icon="📐" label="Subject" value={v.matiereName} color={C_COLOR} bg={C_BG} />
          <StatBox icon="🏫" label="Class" value={v.classeName} color="var(--purple)" bg="var(--purple-dim)" />
          <StatBox icon="🎓" label="Teacher" value={v.teacherName} color="var(--violet)" bg="var(--violet-dim)" />
        </div>

        {deleteTarget && <ConfirmDialog title="Delete Assignment?" message={`Remove ${deleteTarget.teacherName} → ${deleteTarget.matiereName} → ${deleteTarget.classeName}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      </div>
    );
  }

  return null;
}