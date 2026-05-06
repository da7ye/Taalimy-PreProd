import { useEffect, useState, useMemo } from "react";
import { getClasses, createClasse, updateClasse, deleteClasse, getLevelNames } from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const C_COLOR = "var(--purple)";
const C_BG    = "var(--purple-dim)";

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

function SidePanel({ title, items, accentColor, accentBg, initial }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"28px 24px", boxShadow:"var(--shadow-sm)", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:accentBg, color:accentColor, border:`2px solid ${accentColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:30, margin:"0 auto 14px" }}>{initial||"?"}</div>
        <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{title}</div>
      </div>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"20px 24px", boxShadow:"var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom:12 }}>Notes</div>
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

function StatBox({ icon, label, value }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:11, background:C_BG, color:C_COLOR, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:14.5, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

function ClassCard({ r, levelMap, onClick, onEdit, onDelete }) {
  const levelName = r.level?.name ?? levelMap[r.levelId];
  return (
    <div className="person-card" style={{ "--card-top":C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:C_BG, color:C_COLOR, border:`1.5px solid ${C_COLOR}28`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:22 }}>
          {(r.name?.[0]??"C").toUpperCase()}
        </div>
        {levelName && <span style={{ padding:"3px 9px", borderRadius:999, background:"var(--green-dim)", color:"var(--green)", fontSize:11.5, fontWeight:600, border:"1px solid rgba(42,117,64,.2)" }}>{levelName}</span>}
      </div>
      <div style={{ fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:6 }}>{r.name}</div>
      {r.description && <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5, marginBottom:14 }}>{r.description}</div>}
      <div style={{ paddingTop:12, borderTop:"1px solid var(--border)", display:"flex", gap:8 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(r)} className="btn-ghost" style={{ flex:1, padding:"7px", fontSize:12 }}>Edit</button>
        <button onClick={() => onDelete(r)} className="btn-danger" style={{ flex:1, padding:"7px", fontSize:12 }}>Delete</button>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [levels, setLevels]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [q, setQ]               = useState("");
  const [form, setForm]         = useState({ name:"", description:"", levelId:"" });
  const [editForm, setEditForm] = useState({});
  const set     = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]:e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getClasses(), getLevelNames()])
      .then(([c, l]) => { setData(c?.classes ?? c?.content ?? c ?? []); setLevels(Array.isArray(l?.content ?? l) ? (l?.content ?? l) : []); })
      .catch(e => toast(e.message, "error")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const levelMap = useMemo(() => Object.fromEntries(levels.map(l => [l.id, l.name])), [levels]);

  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    if (!q.trim()) return arr;
    const lq = q.toLowerCase();
    return arr.filter(r => r.name?.toLowerCase().includes(lq) || r.description?.toLowerCase().includes(lq));
  }, [data, q]);

  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createClasse({ ...form, levelId: parseInt(form.levelId)||undefined }); setForm({ name:"", description:"", levelId:"" }); toast("Class created!"); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const openEdit = r => { setEditForm({ id:r.id, name:r.name??"", description:r.description??"", levelId:r.levelId??r.level?.id??"" }); setSelected(r); setView("edit"); };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateClasse(selected.id, { ...editForm, levelId: parseInt(editForm.levelId)||undefined }); toast("Class updated!"); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteClasse(deleteTarget.id); setDeleteTarget(null); toast("Class deleted."); load(); if (view !== "list") goList(); }
    catch (err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  /* LIST */
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle crumb="Academics" title="Classes" sub={loading ? "Loading…" : `${filtered.length} class${filtered.length!==1?"es":""}`} />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom:32 }}>+ Add Class</button>
      </div>
      <div className="search-wrap" style={{ maxWidth:300, marginBottom:24 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder="Search classes…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>Loading…</p></div>
      : filtered.length === 0 ? <div className="empty-state"><span style={{ fontSize:36 }}>🏫</span><p>{q ? `No results for "${q}"` : "No classes yet."}</p></div>
      : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
          {filtered.map((r,i) => <ClassCard key={r.id??i} r={r} levelMap={levelMap} onClick={r => { setSelected(r); setView("detail"); }} onEdit={openEdit} onDelete={t => setDeleteTarget(t)} />)}
        </div>}
      {deleteTarget && <ConfirmDialog title={`Delete class "${deleteTarget.name}"?`} message="This class will be permanently removed. Students and timetable entries may be affected." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </div>
  );

  /* CREATE */
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label="Back to Classes" onClick={goList} />
      <PageTitle crumb="Academics · Classes" title="Create New Class" sub="Add a class and assign it to a school level." />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label="Class Name"><Input placeholder="e.g. 5A, Terminale C" value={form.name} onChange={set("name")} required /></Field>
          <Field label="Description"><Input placeholder="Optional description" value={form.description} onChange={set("description")} /></Field>
          <Field label="Level" hint="The school level this class belongs to">
            <Select value={form.levelId} onChange={set("levelId")} required>
              <option value="">— Select level —</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>Cancel</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label="Create Class" /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title="Classes contain students and are linked to a level, timetable, and assignments." initial={(form.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG}
          items={[{ icon:"🏷️", text:"A level must exist before creating a class." }, { icon:"📚", text:"Students are enrolled into classes." }, { icon:"🗓️", text:"Timetable sessions are scheduled per class." }]} />}
      />
    </div>
  );

  /* EDIT */
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label="Back to Classes" onClick={goList} />
      <PageTitle crumb="Academics · Classes" title="Edit Class" sub={`Editing ${selected.name}`} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <Field label="Class Name"><Input value={editForm.name} onChange={setEdit("name")} required /></Field>
          <Field label="Description"><Input value={editForm.description} onChange={setEdit("description")} /></Field>
          <Field label="Level">
            <Select value={editForm.levelId} onChange={setEdit("levelId")}>
              <option value="">— Select level —</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>Cancel</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label="Save Changes" /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={`Editing ${selected.name}`} initial={(selected.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG}
          items={[{ icon:"💡", text:"Changes apply immediately to all enrolled students." }, { icon:"🏷️", text:"Changing the level updates the class grouping." }]} />}
      />
    </div>
  );

  /* DETAIL */
  if (view === "detail" && selected) {
    const v = selected;
    const levelName = v.level?.name ?? levelMap[v.levelId];
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label="Back to Classes" onClick={goList} />
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24 }}>
          <div style={{ height:90, background:`linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding:"0 36px 28px", marginTop:-36 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20 }}>
                <div style={{ width:80, height:80, borderRadius:22, background:C_BG, color:C_COLOR, border:"3px solid var(--bg-card)", boxShadow:`0 0 0 2px ${C_COLOR}40`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:32, flexShrink:0 }}>
                  {(v.name?.[0]??"C").toUpperCase()}
                </div>
                <div style={{ paddingBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:22, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.025em" }}>{v.name}</h2>
                  {levelName && (
                    <span style={{ display:"inline-block", marginTop:7, padding:"3px 11px", borderRadius:999, background:"var(--green-dim)", color:"var(--green)", fontSize:12, fontWeight:600, border:"1px solid rgba(42,117,64,.25)" }}>
                      {levelName}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding:"10px 20px" }}>✏️ Edit</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding:"10px 20px" }}>🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          <StatBox icon="🏫" label="Class Name" value={v.name} />
          <StatBox icon="🏷️" label="Level" value={levelName} />
          <StatBox icon="🆔" label="ID" value={v.id} />
          {v.description && <StatBox icon="📝" label="Description" value={v.description} />}
        </div>
        {deleteTarget && <ConfirmDialog title={`Delete class "${deleteTarget.name}"?`} message="This class will be permanently removed." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      </div>
    );
  }

  return null;
}