import { useEffect, useState, useMemo } from "react";
import { getLevels, createLevel, updateLevel, deleteLevel, getCampusNames } from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--green)";
const C_BG    = "var(--green-dim)";

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

function SidePanel({ title, items, accentColor, accentBg, initial, sectionLabel }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"28px 24px", boxShadow:"var(--shadow-sm)", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:accentBg, color:accentColor, border:`2px solid ${accentColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:30, margin:"0 auto 14px" }}>{initial||"?"}</div>
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

function LevelCard({ r, onClick, onEdit, onDelete, t }) {
  return (
    <div className="person-card" style={{ "--card-top":C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:C_BG, color:C_COLOR, border:`1.5px solid ${C_COLOR}28`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:22 }}>
          {(r.name?.[0]??"L").toUpperCase()}
        </div>
        {r.campusId != null && <span style={{ padding:"3px 9px", borderRadius:999, background:"var(--surface)", border:"1px solid var(--border-md)", color:"var(--text-muted)", fontSize:11.5 }}>{t("levels.campusLabel", { id: r.campusId })}</span>}
      </div>
      <div style={{ fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:6 }}>{r.name}</div>
      {r.description && <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5, marginBottom:14 }}>{r.description}</div>}
      <div style={{ paddingTop:12, borderTop:"1px solid var(--border)", display:"flex", gap:8 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(r)} className="btn-ghost" style={{ flex:1, padding:"7px", fontSize:12 }}>{t("common.edit")}</button>
        <button onClick={() => onDelete(r)} className="btn-danger" style={{ flex:1, padding:"7px", fontSize:12 }}>{t("common.delete")}</button>
      </div>
    </div>
  );
}

export default function LevelsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [q, setQ]               = useState("");
  const [form, setForm]         = useState({ name:"", description:"", campusId:"" });
  const [editForm, setEditForm] = useState({});
  const set     = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]:e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getLevels(), getCampusNames()])
      .then(([res, c]) => { setData(res?.levelDTOS ?? res?.content ?? res ?? []); setCampuses(c ?? []); })
      .catch(e => toast(e.message, "error")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    if (!q.trim()) return arr;
    const lq = q.toLowerCase();
    return arr.filter(r => r.name?.toLowerCase().includes(lq) || r.description?.toLowerCase().includes(lq));
  }, [data, q]);

  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createLevel({ ...form, campusId: parseInt(form.campusId)||undefined }); setForm({ name:"", description:"", campusId:"" }); toast(t("levels.created")); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const openEdit = r => { setEditForm({ id:r.id, name:r.name??"", description:r.description??"", campusId:r.campusId??"" }); setSelected(r); setView("edit"); };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateLevel(selected.id, { ...editForm, campusId: parseInt(editForm.campusId)||undefined }); toast(t("levels.updated")); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteLevel(deleteTarget.id); setDeleteTarget(null); toast(t("levels.deleted")); load(); if (view !== "list") goList(); }
    catch (err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  /* LIST */
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle crumb={t("levels.crumb")} title={t("levels.title")} sub={loading ? t("common.loading") : t("levels.count", { n: filtered.length })} />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom:32 }}>{t("levels.addBtn")}</button>
      </div>
      <div className="search-wrap" style={{ maxWidth:300, marginBottom:24 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("levels.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>{t("common.loading")}</p></div>
      : filtered.length === 0 ? <div className="empty-state"><span style={{ fontSize:36 }}>🏷️</span><p>{q ? `${t("common.noResults")} "${q}"` : t("levels.empty")}</p></div>
      : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
          {filtered.map((r,i) => <LevelCard key={r.id??i} r={r} t={t} onClick={r => { setSelected(r); setView("detail"); }} onEdit={openEdit} onDelete={target => setDeleteTarget(target)} />)}
        </div>}
      {deleteTarget && <ConfirmDialog title={t("levels.deleteTitle", { name: deleteTarget.name })} message={t("levels.deleteMsg")} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </div>
  );

  /* CREATE */
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("levels.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("levels.crumb")} · ${t("levels.title")}`} title={t("levels.createTitle")} sub={t("levels.createSub")} />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label={t("levels.levelName")}><Input placeholder={t("levels.levelNamePlaceholder")} value={form.name} onChange={set("name")} required /></Field>
          <Field label={t("levels.description")}><Input placeholder={t("levels.descriptionPlaceholder")} value={form.description} onChange={set("description")} /></Field>
          <Field label={t("levels.campus")}>
            <Select value={form.campusId} onChange={set("campusId")}>
              <option value="">{t("levels.campusOptional")}</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label={t("levels.createBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("levels.sideNote")} initial={(form.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          items={[{ icon:"🏫", text:t("levels.sideNote1") }, { icon:"🏛️", text:t("levels.sideNote2") }, { icon:"📋", text:t("levels.sideNote3") }]} />}
      />
    </div>
  );

  /* EDIT */
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("levels.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("levels.crumb")} · ${t("levels.title")}`} title={t("levels.editTitle")} sub={t("levels.editSub", { name: selected.name })} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <Field label={t("levels.levelName")}><Input value={editForm.name} onChange={setEdit("name")} required /></Field>
          <Field label={t("levels.description")}><Input value={editForm.description} onChange={setEdit("description")} /></Field>
          <Field label={t("levels.campus")}>
            <Select value={editForm.campusId} onChange={setEdit("campusId")}>
              <option value="">{t("levels.campusSelect")}</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label={t("levels.saveBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("levels.editSub", { name: selected.name })} initial={(selected.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          items={[{ icon:"💡", text:t("levels.editNote1") }, { icon:"🏛️", text:t("levels.editNote2") }]} />}
      />
    </div>
  );

  /* DETAIL */
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label={t("levels.detailBack")} onClick={goList} />
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24 }}>
          <div style={{ height:90, background:`linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding:"0 36px 28px", marginTop:-36 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20 }}>
                <div style={{ width:80, height:80, borderRadius:22, background:C_BG, color:C_COLOR, border:"3px solid var(--bg-card)", boxShadow:`0 0 0 2px ${C_COLOR}40`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:32, flexShrink:0 }}>
                  {(v.name?.[0]??"L").toUpperCase()}
                </div>
                <div style={{ paddingBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:22, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.025em" }}>{v.name}</h2>
                  {v.campusId != null && (
                    <span style={{ display:"inline-block", marginTop:7, padding:"3px 11px", borderRadius:999, background:"var(--surface)", border:"1px solid var(--border-md)", color:"var(--text-muted)", fontSize:12 }}>
                      {t("levels.campusLabel", { id: v.campusId })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding:"10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding:"10px 20px" }}>🗑 {t("common.delete")}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          <StatBox icon="🏷️" label={t("levels.fields.name")}   value={v.name} />
          <StatBox icon="🏛️" label={t("levels.fields.campus")} value={v.campusId != null ? t("levels.campusLabel", { id: v.campusId }) : null} />
          <StatBox icon="🆔" label={t("levels.fields.id")}     value={v.id} />
          {v.description && <StatBox icon="📝" label={t("levels.fields.description")} value={v.description} />}
        </div>
        {deleteTarget && <ConfirmDialog title={t("levels.deleteTitle", { name: deleteTarget.name })} message={t("levels.deleteDetailMsg")} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      </div>
    );
  }
  return null;
}