import { useEffect, useState, useMemo } from "react";
import { getClasses, createClasse, updateClasse, deleteClasse, getLevelNames } from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--purple)";
const C_BG    = "var(--purple-dim)";
const PAGE_SIZE_OPTIONS = [12, 24, 48];

function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:13, fontFamily:"'Instrument Sans',sans-serif", padding:0, marginBottom:28, transition:"color .13s" }}
      onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
      onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
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
          {items.map((item,i)=>(
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

function ClassCard({ r, levelMap, onClick, onEdit, onDelete, t }) {
  const levelName = r.level?.name ?? levelMap[r.levelId];
  return (
    <div className="person-card" style={{ "--card-top":C_COLOR }} onClick={()=>onClick(r)}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:C_BG, color:C_COLOR, border:`1.5px solid ${C_COLOR}28`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:22 }}>
          {(r.name?.[0]??"C").toUpperCase()}
        </div>
        {levelName && <span style={{ padding:"3px 9px", borderRadius:999, background:"var(--green-dim)", color:"var(--green)", fontSize:11.5, fontWeight:600, border:"1px solid rgba(42,117,64,.2)" }}>{levelName}</span>}
      </div>
      <div style={{ fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:6 }}>{r.name}</div>
      {r.description && <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5, marginBottom:14 }}>{r.description}</div>}
      <div style={{ paddingTop:12, borderTop:"1px solid var(--border)", display:"flex", gap:8 }} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>onEdit(r)} className="btn-ghost" style={{ flex:1, padding:"7px", fontSize:12 }}>{t("common.edit")}</button>
        <button onClick={()=>onDelete(r)} className="btn-danger" style={{ flex:1, padding:"7px", fontSize:12 }}>{t("common.delete")}</button>
      </div>
    </div>
  );
}

/* ─── Filter Bar ─── */
function FilterBar({ q, setQ, filterLevel, setFilterLevel, levels, onReset, totalFiltered, total, t }) {
  const hasFilters = q.trim() || filterLevel;
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"16px 20px", marginBottom:20, display:"flex", flexWrap:"wrap", gap:12, alignItems:"center", boxShadow:"var(--shadow-sm)" }}>
      <div className="search-wrap" style={{ flex:"1 1 220px", minWidth:180 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("classes.searchPlaceholder")} value={q} onChange={e=>setQ(e.target.value)} style={{ width:"100%" }} />
      </div>

      {/* Level filter */}
      <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="t-select" style={{ flex:"1 1 180px", minWidth:160, maxWidth:220 }}>
        <option value="">All Levels</option>
        {levels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      {hasFilters && (
        <button onClick={onReset} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12.5, flexShrink:0, color:"var(--rose)", borderColor:"rgba(184,53,53,.25)" }}>
          ✕ Clear
        </button>
      )}

      <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-faint)", flexShrink:0, whiteSpace:"nowrap" }}>
        {hasFilters ? <><span style={{ color:"var(--text-dim)", fontWeight:600 }}>{totalFiltered}</span> of {total}</> : <><span style={{ color:"var(--text-dim)", fontWeight:600 }}>{total}</span> total</>}
      </div>
    </div>
  );
}

/* ─── Pagination ─── */
function Pagination({ page, totalPages, pageSize, setPage, setPageSize, totalFiltered }) {
  if (totalPages <= 1 && totalFiltered <= PAGE_SIZE_OPTIONS[0]) return null;
  const pages = [];
  const delta = 2;
  for (let i = 0; i < totalPages; i++) {
    if (i===0 || i===totalPages-1 || (i>=page-delta && i<=page+delta)) pages.push(i);
  }
  const withEllipsis = [];
  let prev = -1;
  for (const p of pages) {
    if (prev !== -1 && p-prev > 1) withEllipsis.push("...");
    withEllipsis.push(p);
    prev = p;
  }

  const btnStyle = (active) => ({
    minWidth:34, height:34, borderRadius:8, border:"1px solid var(--border-md)",
    background: active ? "var(--accent)" : "var(--surface)",
    color: active ? "#fff" : "var(--text-muted)",
    fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight: active ? 700 : 400,
    cursor: active ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center",
    transition:"background .14s, color .14s",
  });

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginTop:28, paddingTop:20, borderTop:"1px solid var(--border)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12, color:"var(--text-faint)" }}>Per page:</span>
        {PAGE_SIZE_OPTIONS.map(s=>(
          <button key={s} onClick={()=>{ setPageSize(s); setPage(0); }} style={{ ...btnStyle(pageSize===s), padding:"0 12px" }}>{s}</button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{ ...btnStyle(false), opacity:page===0?.35:1, padding:"0 10px" }}>‹</button>
        {withEllipsis.map((p,i)=>
          p==="..." ? <span key={`e${i}`} style={{ color:"var(--text-faint)", fontSize:13, padding:"0 2px" }}>…</span>
          : <button key={p} onClick={()=>setPage(p)} style={btnStyle(page===p)}>{p+1}</button>
        )}
        <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ ...btnStyle(false), opacity:page>=totalPages-1?.35:1, padding:"0 10px" }}>›</button>
      </div>
      <span style={{ fontSize:12, color:"var(--text-faint)" }}>Page {page+1} of {totalPages}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function ClassesPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [levels, setLevels]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [q, setQ]               = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Pagination
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const [form, setForm]         = useState({ name:"", description:"", levelId:"" });
  const [editForm, setEditForm] = useState({});
  const set     = k => e => setForm(f=>({ ...f, [k]:e.target.value }));
  const setEdit = k => e => setEditForm(f=>({ ...f, [k]:e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getClasses(), getLevelNames()])
      .then(([c, l]) => {
        setData(c?.classes ?? c?.content ?? c ?? []);
        setLevels(Array.isArray(l?.content ?? l) ? (l?.content ?? l) : []);
      })
      .catch(e=>toast(e.message,"error")).finally(()=>setLoading(false));
  };
  useEffect(load, []);
  useEffect(()=>setPage(0), [q, filterLevel]);

  const levelMap = useMemo(()=>Object.fromEntries(levels.map(l=>[l.id, l.name])), [levels]);

  const filtered = useMemo(() => {
    let arr = Array.isArray(data) ? data : [];
    if (q.trim()) {
      const lq = q.toLowerCase();
      arr = arr.filter(r =>
        r.name?.toLowerCase().includes(lq) ||
        r.description?.toLowerCase().includes(lq) ||
        (r.level?.name ?? levelMap[r.levelId])?.toLowerCase().includes(lq)
      );
    }
    if (filterLevel) {
      arr = arr.filter(r => String(r.levelId ?? r.level?.id) === String(filterLevel));
    }
    return arr;
  }, [data, q, filterLevel, levelMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const resetFilters = () => { setQ(""); setFilterLevel(""); setPage(0); };
  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createClasse({ ...form, levelId:parseInt(form.levelId)||undefined }); setForm({ name:"", description:"", levelId:"" }); toast(t("classes.created")); load(); goList(); }
    catch(err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const openEdit = r => { setEditForm({ id:r.id, name:r.name??"", description:r.description??"", levelId:r.levelId??r.level?.id??"" }); setSelected(r); setView("edit"); };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateClasse(selected.id, { ...editForm, levelId:parseInt(editForm.levelId)||undefined }); toast(t("classes.updated")); load(); goList(); }
    catch(err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteClasse(deleteTarget.id); setDeleteTarget(null); toast(t("classes.deleted")); load(); if(view!=="list") goList(); }
    catch(err) { toast(err.message,"error"); } finally { setDeleting(false); }
  };

  /* ══ LIST ══ */
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle crumb={t("classes.crumb")} title={t("classes.title")}
          sub={loading ? t("common.loading") : t("classes.count", { n: filtered.length })} />
        <button onClick={()=>setView("create")} className="btn-primary" style={{ marginBottom:32 }}>{t("classes.addBtn")}</button>
      </div>

      <FilterBar
        q={q} setQ={setQ}
        filterLevel={filterLevel} setFilterLevel={setFilterLevel}
        levels={levels}
        onReset={resetFilters}
        totalFiltered={filtered.length}
        total={Array.isArray(data) ? data.length : 0}
        t={t}
      />

      {loading
        ? <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>{t("common.loading")}</p></div>
        : paginated.length === 0
          ? <div className="empty-state">
              <span style={{ fontSize:36 }}>🏫</span>
              <p>{q||filterLevel ? "No classes match your filters." : t("classes.empty")}</p>
              {(q||filterLevel) && <button onClick={resetFilters} className="btn-ghost" style={{ marginTop:8 }}>Clear filters</button>}
            </div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
              {paginated.map((r,i)=>(
                <ClassCard key={r.id??i} r={r} levelMap={levelMap} t={t}
                  onClick={r=>{ setSelected(r); setView("detail"); }}
                  onEdit={openEdit}
                  onDelete={target=>setDeleteTarget(target)} />
              ))}
            </div>
      }

      {!loading && filtered.length > 0 && (
        <Pagination page={page} totalPages={totalPages} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} totalFiltered={filtered.length} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("classes.deleteTitle", { name:deleteTarget.name })}
          message={t("classes.deleteMsg")}
          onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} loading={deleting} />
      )}
    </div>
  );

  /* ══ CREATE ══ */
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("classes.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("classes.crumb")} · ${t("classes.title")}`} title={t("classes.createTitle")} sub={t("classes.createSub")} />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label={t("classes.className")}><Input placeholder={t("classes.classNamePlaceholder")} value={form.name} onChange={set("name")} required /></Field>
          <Field label={t("classes.description")}><Input placeholder={t("classes.descriptionPlaceholder")} value={form.description} onChange={set("description")} /></Field>
          <Field label={t("classes.level")} hint={t("classes.levelHint")}>
            <Select value={form.levelId} onChange={set("levelId")} required>
              <option value="">{t("classes.levelSelect")}</option>
              {levels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label={t("classes.createBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("classes.sideNote")} initial={(form.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          items={[{ icon:"🏷️", text:t("classes.sideNote1") }, { icon:"📚", text:t("classes.sideNote2") }, { icon:"🗓️", text:t("classes.sideNote3") }]} />}
      />
    </div>
  );

  /* ══ EDIT ══ */
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("classes.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("classes.crumb")} · ${t("classes.title")}`} title={t("classes.editTitle")} sub={t("classes.editSub", { name:selected.name })} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <Field label={t("classes.className")}><Input value={editForm.name} onChange={setEdit("name")} required /></Field>
          <Field label={t("classes.description")}><Input value={editForm.description} onChange={setEdit("description")} /></Field>
          <Field label={t("classes.level")}>
            <Select value={editForm.levelId} onChange={setEdit("levelId")}>
              <option value="">{t("classes.levelSelect")}</option>
              {levels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving} label={t("classes.saveBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("classes.editSub", { name:selected.name })} initial={(selected.name?.[0]??"?").toUpperCase()} accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          items={[{ icon:"💡", text:t("classes.editNote1") }, { icon:"🏷️", text:t("classes.editNote2") }]} />}
      />
    </div>
  );

  /* ══ DETAIL ══ */
  if (view === "detail" && selected) {
    const v = selected;
    const levelName = v.level?.name ?? levelMap[v.levelId];
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label={t("classes.detailBack")} onClick={goList} />
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
                <button onClick={()=>openEdit(v)} className="btn-ghost" style={{ padding:"10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={()=>setDeleteTarget(v)} className="btn-danger" style={{ padding:"10px 20px" }}>🗑 {t("common.delete")}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          <StatBox icon="🏫" label={t("classes.fields.name")}        value={v.name} />
          <StatBox icon="🏷️" label={t("classes.fields.level")}       value={levelName} />
          <StatBox icon="🆔" label={t("classes.fields.id")}          value={v.id} />
          {v.description && <StatBox icon="📝" label={t("classes.fields.description")} value={v.description} />}
        </div>
        {deleteTarget && (
          <ConfirmDialog
            title={t("classes.deleteTitle", { name:deleteTarget.name })}
            message={t("classes.deleteDetailMsg")}
            onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} loading={deleting} />
        )}
      </div>
    );
  }
  return null;
}