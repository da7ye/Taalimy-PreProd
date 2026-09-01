import { useEffect, useState, useMemo, useRef } from "react";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from "../api";
import { uploadUserPhoto, updateUserPhoto, deleteUserPhoto } from "../api";
import { getClassesByTeacher, getMatieresByTeacherAndClasse } from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { usePersonForm } from "../hooks/usePersonForm";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--accent)";
const C_BG    = "var(--violet-dim)";
const PAGE_SIZE_OPTIONS = [10, 50, 100];

// ─── Teaching Schedule ────────────────────────────────────────────────────────

function TeachingSchedule({ teacherId, t }) {
  const [classes, setClasses]           = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError]               = useState(null);
  const [expanded, setExpanded]         = useState({});
  const [matieres, setMatieres]         = useState({});

  useEffect(() => {
    if (!teacherId) return;
    setLoadingClasses(true); setError(null);
    getClassesByTeacher(teacherId)
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingClasses(false));
  }, [teacherId]);

  const toggle = async (classeId) => {
    const isOpen = expanded[classeId];
    setExpanded(prev => ({ ...prev, [classeId]: !isOpen }));
    if (!isOpen && matieres[classeId] === undefined) {
      setMatieres(prev => ({ ...prev, [classeId]: "loading" }));
      try {
        const data = await getMatieresByTeacherAndClasse(teacherId, classeId);
        setMatieres(prev => ({ ...prev, [classeId]: Array.isArray(data) ? data : [] }));
      } catch {
        setMatieres(prev => ({ ...prev, [classeId]: "error" }));
      }
    }
  };

  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginTop:20 }}>
      <div style={{ padding:"20px 28px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"var(--teal-dim)", color:"var(--teal)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🗂️</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{t("teachers.scheduleTitle")}</div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{t("teachers.scheduleSub")}</div>
        </div>
        {!loadingClasses && classes && (
          <span style={{ marginLeft:"auto", padding:"3px 10px", borderRadius:999, background:"var(--teal-dim)", color:"var(--teal)", fontSize:12, fontWeight:700, border:"1px solid rgba(14,126,104,.2)" }}>
            {t("classes.count", { n: classes.length })}
          </span>
        )}
      </div>
      <div style={{ padding:"12px 16px" }}>
        {loadingClasses && <div style={{ display:"flex", alignItems:"center", gap:10, padding:"20px 12px", color:"var(--text-muted)", fontSize:13 }}><span className="spinner" style={{ width:16, height:16 }} />{t("teachers.loadingClasses")}</div>}
        {error && <div style={{ padding:"16px 12px", color:"var(--rose)", fontSize:13, display:"flex", alignItems:"center", gap:8 }}><span>⚠️</span> {error}</div>}
        {!loadingClasses && !error && classes?.length === 0 && (
          <div style={{ padding:"28px 12px", textAlign:"center", color:"var(--text-faint)", fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📭</div>{t("teachers.noClassesAssigned")}
          </div>
        )}
        {!loadingClasses && !error && classes?.map(cls => {
          const isOpen = !!expanded[cls.id];
          const clsMatieres = matieres[cls.id];
          return (
            <div key={cls.id} style={{ borderRadius:"var(--r-md)", border:"1px solid var(--border)", marginBottom:8, overflow:"hidden", transition:"border-color .15s", ...(isOpen?{borderColor:"var(--border-md)"}:{}) }}>
              <button onClick={() => toggle(cls.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 16px", background:isOpen?"var(--surface)":"transparent", border:"none", cursor:"pointer", textAlign:"left", transition:"background .14s", fontFamily:"'Instrument Sans',sans-serif" }}
                onMouseEnter={e=>!isOpen&&(e.currentTarget.style.background="var(--surface)")}
                onMouseLeave={e=>!isOpen&&(e.currentTarget.style.background="transparent")}
              >
                <div style={{ width:34, height:34, borderRadius:9, background:"var(--purple-dim)", color:"var(--purple)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏫</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{cls.name}</div>
                  {cls.levelName && <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:2 }}>{cls.levelName}</div>}
                </div>
                {Array.isArray(clsMatieres) && (
                  <span style={{ padding:"2px 9px", borderRadius:999, background:"var(--violet-dim)", color:"var(--violet)", fontSize:11.5, fontWeight:600, border:"1px solid rgba(79,67,192,.18)", flexShrink:0 }}>
                    {t("teachers.subjectCount", { n: clsMatieres.length })}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginLeft:4, transform:isOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s ease" }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {isOpen && (
                <div style={{ borderTop:"1px solid var(--border)", padding:"12px 16px", background:"var(--surface)" }}>
                  {clsMatieres === "loading" && <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-muted)", fontSize:13, padding:"8px 0" }}><span className="spinner" style={{ width:14, height:14 }}/>{t("teachers.loadingSubjects")}</div>}
                  {clsMatieres === "error" && <div style={{ color:"var(--rose)", fontSize:13, padding:"8px 0", display:"flex", alignItems:"center", gap:6 }}><span>⚠️</span> {t("teachers.failedLoadSubjects")}</div>}
                  {Array.isArray(clsMatieres) && clsMatieres.length === 0 && <div style={{ color:"var(--text-faint)", fontSize:13, padding:"8px 0", textAlign:"center" }}>{t("teachers.noSubjectsForClass")}</div>}
                  {Array.isArray(clsMatieres) && clsMatieres.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {clsMatieres.map(m => (
                        <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderRadius:"var(--r-md)", background:"var(--bg-card)", border:"1px solid var(--border-md)", boxShadow:"var(--shadow-sm)" }}>
                          <span style={{ fontSize:13 }}>📐</span>
                          <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{m.name}</span>
                          {m.coefficient != null && <span style={{ fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:999, background:"var(--amber-dim)", color:"var(--amber)", border:"1px solid rgba(168,100,30,.2)" }}>×{m.coefficient}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Photo helpers ────────────────────────────────────────────────────────────

function PhotoAvatar({ photo, initial = "?", size = 48, radius = 14, color = C_COLOR, bg = C_BG, style = {} }) {
  const fs = Math.round(size / 2.4);
  const [failed, setFailed] = useState(false);
  const base = { width:size, height:size, borderRadius:radius, flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", ...style };
  if (photo && !failed) {
    return <div style={base}><img src={photo} alt={initial} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={()=>setFailed(true)} /></div>;
  }
  return (
    <div style={{ ...base, background:bg, color, border:`1.5px solid ${color}28` }}>
      <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:fs, color }}>{(initial||"?").toUpperCase()}</span>
    </div>
  );
}

function PhotoUploadField({ photo, initial, color = C_COLOR, bg = C_BG, onFileSelected, onDelete, loading = false, t }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(photo || null);
  useEffect(() => { setPreview(photo || null); }, [photo]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);
    e.target.value = "";
  };

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        <PhotoAvatar photo={preview} initial={initial} size={80} radius={20} color={color} bg={bg} />
        {loading && <div style={{ position:"absolute", inset:0, borderRadius:20, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center" }}><span className="spinner" style={{ width:20, height:20, borderTopColor:"#fff" }}/></div>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:"var(--r-md)", background:"var(--surface)", border:"1.5px solid var(--border-md)", color:"var(--text-dim)", fontSize:12.5, fontWeight:500, cursor:loading?"not-allowed":"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"background .13s", opacity:loading?0.5:1 }}
          onMouseEnter={e=>!loading&&(e.currentTarget.style.background="var(--surface-hover)")}
          onMouseLeave={e=>!loading&&(e.currentTarget.style.background="var(--surface)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {preview ? t("common.changePhoto") : t("common.uploadPhoto")}
          <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} disabled={loading} />
        </label>
        {preview && (
          <button type="button" onClick={()=>{ setPreview(null); onDelete?.(); }} disabled={loading} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:"var(--r-md)", background:"var(--rose-dim)", border:"1px solid rgba(184,53,53,.18)", color:"var(--rose)", fontSize:12, fontWeight:500, cursor:loading?"not-allowed":"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            {t("common.removePhoto")}
          </button>
        )}
        <span style={{ fontSize:11, color:"var(--text-faint)" }}>{t("common.photoHint")}</span>
      </div>
    </div>
  );
}

// ─── Reusable pieces ──────────────────────────────────────────────────────────

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

function TwoCol({ left, right }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }}>
      <div>{left}</div><div>{right}</div>
    </div>
  );
}

function FormPanel({ children, onSubmit }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
      <form onSubmit={onSubmit} style={{ padding:"32px 36px", display:"flex", flexDirection:"column", gap:20 }}>{children}</form>
    </div>
  );
}

function SidePanel({ title, items, accentColor, accentBg, initial, photo }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"28px 24px", boxShadow:"var(--shadow-sm)", textAlign:"center" }}>
        <div style={{ margin:"0 auto 14px", width:72, height:72 }}>
          <PhotoAvatar photo={photo} initial={initial} size={72} radius={20} color={accentColor} bg={accentBg} />
        </div>
        <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{title}</div>
      </div>
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"20px 24px", boxShadow:"var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom:12 }}>{items.sectionLabel}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.list.map((item,i)=>(
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

function StatBox({ icon, label, value, color, bg }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:11, background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:14.5, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir }) {
  if (!dir) return <svg width="10" height="10" viewBox="0 0 10 14" fill="none" style={{ opacity:0.3 }}><path d="M5 1L1 5h8L5 1zM5 13l4-4H1l4 4z" fill="currentColor"/></svg>;
  if (dir === "asc") return <svg width="10" height="10" viewBox="0 0 10 14" fill="none"><path d="M5 1L1 7h8L5 1z" fill="currentColor"/><path d="M5 13l4-4H1l4 4z" fill="currentColor" opacity="0.25"/></svg>;
  return <svg width="10" height="10" viewBox="0 0 10 14" fill="none"><path d="M5 1L1 7h8L5 1z" fill="currentColor" opacity="0.25"/><path d="M5 13l4-4H1l4 4z" fill="currentColor"/></svg>;
}

// ─── Table Header Cell ────────────────────────────────────────────────────────

function ThCell({ label, sortKey, sortBy, sortDir, onSort, style = {} }) {
  const active = sortBy === sortKey;
  return (
    <th onClick={() => sortKey && onSort(sortKey)} style={{
      padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700,
      textTransform:"uppercase", letterSpacing:".07em",
      color: active ? C_COLOR : "var(--text-faint)",
      background:"var(--surface, rgba(0,0,0,.03))",
      borderBottom:"2px solid var(--border)",
      cursor: sortKey ? "pointer" : "default",
      userSelect:"none", whiteSpace:"nowrap", transition:"color .13s",
      ...style,
    }}>
      <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
        {label}
        {sortKey && <SortIcon dir={active ? sortDir : null} />}
      </span>
    </th>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TeacherRow({ r, index, onClick, onEdit, onDelete, t }) {
  const initial = r.firstname?.[0] ?? "?";
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={() => onClick(r)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor:"pointer",
        background: hovered ? "var(--surface-hover, rgba(0,0,0,.025))" : index % 2 === 0 ? "transparent" : "rgba(0,0,0,.012)",
        transition:"background .12s",
        borderBottom:"1px solid var(--border)",
      }}
    >
      <td style={{ padding:"12px 16px", width:44, color:"var(--text-faint)", fontSize:12, fontWeight:500, fontFamily:"'JetBrains Mono',monospace", textAlign:"center" }}>
        {index + 1}
      </td>
      <td style={{ padding:"10px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <PhotoAvatar photo={r.photo} initial={initial} size={36} radius={10} color={C_COLOR} bg={C_BG} />
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", whiteSpace:"nowrap" }}>{r.firstname} {r.lastname}</div>
            {r.email && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", maxWidth:220, whiteSpace:"nowrap" }}>{r.email}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding:"12px 16px" }}>
        {r.speciality
          ? <span style={{ padding:"3px 10px", borderRadius:999, background:C_BG, color:C_COLOR, fontSize:12, fontWeight:600, border:`1px solid ${C_COLOR}22`, whiteSpace:"nowrap" }}>{r.speciality}</span>
          : <span style={{ color:"var(--text-faint)", fontSize:12 }}>—</span>
        }
      </td>
      <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-muted)", whiteSpace:"nowrap" }}>
        {r.phone ?? <span style={{ color:"var(--text-faint)" }}>—</span>}
      </td>
      <td style={{ padding:"12px 16px" }}>
        {r.nni
          ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "3px 9px", borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border-md)", color: "var(--text-dim)", whiteSpace: "nowrap" }}>
              {r.nni}
            </span>
          : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
        }
      </td>
      <td style={{ padding:"12px 16px" }}>
        <span style={{
          display:"inline-flex", alignItems:"center", gap:5,
          padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:600,
          background: r.isApprove ? "var(--green-dim)" : "var(--amber-dim)",
          color: r.isApprove ? "var(--green)" : "var(--amber)",
          border:`1px solid ${r.isApprove ? "rgba(42,117,64,.2)" : "rgba(168,100,30,.2)"}`,
          whiteSpace:"nowrap",
        }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:r.isApprove?"var(--green)":"var(--amber)", flexShrink:0 }}/>
          {r.isApprove ? t("common.approved") : t("common.pending")}
        </span>
      </td>
      <td style={{ padding:"10px 16px", textAlign:"right" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding:"5px 12px", fontSize:12 }}>{t("common.edit")}</button>
          <button onClick={() => onDelete(r)} className="btn-danger" style={{ padding:"5px 12px", fontSize:12 }}>{t("common.delete")}</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ q, setQ, filterSpeciality, setFilterSpeciality, filterStatus, setFilterStatus, specialities, onReset, totalFiltered, total, t }) {
  const hasFilters = q.trim() || filterSpeciality || filterStatus;
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"14px 20px", marginBottom:16, display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", boxShadow:"var(--shadow-sm)" }}>
      <div className="search-wrap" style={{ flex:"1 1 220px", minWidth:180 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("teachers.searchPlaceholder")} value={q} onChange={e=>setQ(e.target.value)} style={{ width:"100%" }} />
      </div>
      <select value={filterSpeciality} onChange={e=>setFilterSpeciality(e.target.value)} className="t-select" style={{ flex:"1 1 180px", minWidth:160, maxWidth:220 }}>
        <option value="">{t("teachers.allSpecialities")}</option>
        {specialities.map(s=><option key={s} value={s}>{s}</option>)}
      </select>
      <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="t-select" style={{ flex:"0 0 150px" }}>
        <option value="">{t("common.allStatuses")}</option>
        <option value="approved">{t("common.statusApproved")}</option>
        <option value="pending">{t("common.statusPending")}</option>
      </select>
      {hasFilters && <button onClick={onReset} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12.5, flexShrink:0, color:"var(--rose)", borderColor:"rgba(184,53,53,.25)" }}>✕ {t("common.clearFilters")}</button>}
      <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-faint)", flexShrink:0, whiteSpace:"nowrap" }}>
        {hasFilters ? <><span style={{ color:"var(--text-dim)", fontWeight:600 }}>{totalFiltered}</span> {t("common.of")} {total}</> : <><span style={{ color:"var(--text-dim)", fontWeight:600 }}>{total}</span> {t("common.total")}</>}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, pageSize, setPage, setPageSize, totalFiltered, t }) {
  // Always render so users can change page size even on a single page
  if (totalFiltered === 0) return null;

  const pages = [];
  const delta = 2;
  for (let i = 0; i < totalPages; i++) {
    if (i===0||i===totalPages-1||(i>=page-delta&&i<=page+delta)) pages.push(i);
  }
  const withEllipsis = [];
  let prev = -1;
  for (const p of pages) {
    if (prev !== -1 && p-prev > 1) withEllipsis.push("...");
    withEllipsis.push(p); prev = p;
  }

  const btnStyle = (active, disabled = false) => ({
    minWidth:34, height:34, borderRadius:8,
    border:`1px solid ${active ? C_COLOR : "var(--border-md)"}`,
    background: active ? C_COLOR : "var(--surface)",
    color: active ? "#fff" : "var(--text-muted)",
    fontFamily:"'Instrument Sans',sans-serif", fontSize:13,
    fontWeight: active ? 700 : 400,
    cursor: disabled || active ? "default" : "pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    transition:"background .14s, color .14s, border-color .14s",
    opacity: disabled ? 0.35 : 1,
  });

  const start = page * pageSize + 1;
  const end   = Math.min((page + 1) * pageSize, totalFiltered);

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      flexWrap:"wrap", gap:12,
      padding:"14px 20px",
      borderTop:"1px solid var(--border)",
      background:"var(--surface, rgba(0,0,0,.02))",
    }}>
      {/* Left: rows-per-page + range info */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:12, color:"var(--text-faint)", whiteSpace:"nowrap" }}>{t("pagination.rowsPerPage")}</span>
          <div style={{ display:"flex", gap:4 }}>
            {PAGE_SIZE_OPTIONS.map(s => (
              <button key={s} onClick={()=>{ setPageSize(s); setPage(0); }} style={{ ...btnStyle(pageSize===s), minWidth:38, padding:"0 10px", fontSize:12 }}>{s}</button>
            ))}
          </div>
        </div>
        <span style={{ fontSize:12, color:"var(--text-faint)", whiteSpace:"nowrap" }}>
          <span style={{ color:"var(--text-dim)", fontWeight:600 }}>{start}–{end}</span>
          {" "}{t("common.of")}{" "}
          <span style={{ color:"var(--text-dim)", fontWeight:600 }}>{totalFiltered}</span>
        </span>
      </div>

      {/* Right: page buttons (hidden when only 1 page) */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {/* First */}
          <button onClick={()=>setPage(0)} disabled={page===0} title={t("pagination.firstPage")}
            style={{ ...btnStyle(false, page===0), minWidth:34, padding:"0 8px", fontSize:15 }}>«</button>
          {/* Prev */}
          <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} title={t("pagination.prevPage")}
            style={{ ...btnStyle(false, page===0), minWidth:34, padding:"0 8px", fontSize:15 }}>‹</button>

          {withEllipsis.map((p,i) =>
            p==="..."
              ? <span key={`e${i}`} style={{ color:"var(--text-faint)", fontSize:13, padding:"0 4px", lineHeight:"34px" }}>…</span>
              : <button key={p} onClick={()=>setPage(p)} style={{ ...btnStyle(page===p), minWidth:34, padding:"0 6px" }}>{p+1}</button>
          )}

          {/* Next */}
          <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} title={t("pagination.nextPage")}
            style={{ ...btnStyle(false, page>=totalPages-1), minWidth:34, padding:"0 8px", fontSize:15 }}>›</button>
          {/* Last */}
          <button onClick={()=>setPage(totalPages-1)} disabled={page>=totalPages-1} title={t("pagination.lastPage")}
            style={{ ...btnStyle(false, page>=totalPages-1), minWidth:34, padding:"0 8px", fontSize:15 }}>»</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function TeachersPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [deletePhoto, setDeletePhoto]   = useState(false);

  const [q, setQ]                           = useState("");
  const [filterSpeciality, setFilterSpeciality] = useState("");
  const [filterStatus, setFilterStatus]     = useState("");

  const [sortBy, setSortBy]   = useState("lastname");
  const [sortDir, setSortDir] = useState("asc");

  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { form, set, setForm }  = usePersonForm();
  const [speciality, setSpeciality] = useState("");
  const [editForm, setEditForm] = useState({});
  const setEdit = k => e => setEditForm(f=>({ ...f, [k]:e.target.value }));

  const load = () => { setLoading(true); getTeachers().then(d => setData(Array.isArray(d) ? d : d?.content ?? [])).catch(e=>toast(e.message,"error")).finally(()=>setLoading(false)); };
  useEffect(load, []);
  useEffect(()=>setPage(0), [q, filterSpeciality, filterStatus, sortBy, sortDir]);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  const specialities = useMemo(()=>{
    const arr = Array.isArray(data) ? data : [];
    return [...new Set(arr.map(r=>r.speciality).filter(Boolean))].sort();
  }, [data]);

  const filtered = useMemo(() => {
    let arr = Array.isArray(data) ? data : [];
    if (q.trim()) {
      const lq = q.toLowerCase();
      arr = arr.filter(r =>
        `${r.firstname} ${r.lastname}`.toLowerCase().includes(lq) ||
        r.email?.toLowerCase().includes(lq) ||
        r.speciality?.toLowerCase().includes(lq) ||
        r.phone?.toLowerCase().includes(lq) ||
        r.nni?.toLowerCase().includes(lq)
      );
    }
    if (filterSpeciality) arr = arr.filter(r=>r.speciality===filterSpeciality);
    if (filterStatus==="approved") arr = arr.filter(r=>r.isApprove);
    if (filterStatus==="pending")  arr = arr.filter(r=>!r.isApprove);

    arr = [...arr].sort((a, b) => {
      let av = a[sortBy] ?? "";
      let bv = b[sortBy] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [data, q, filterSpeciality, filterStatus, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const resetFilters = () => { setQ(""); setFilterSpeciality(""); setFilterStatus(""); setPage(0); };
  const goList = () => { setView("list"); setSelected(null); setPendingPhoto(null); setDeletePhoto(false); };

  const handlePhotoForUser = async (userId, isNew) => {
    if (deletePhoto && !isNew) {
      setPhotoLoading(true);
      try { await deleteUserPhoto(userId); } catch(e) { toast(e.message,"error"); }
      finally { setPhotoLoading(false); }
    } else if (pendingPhoto) {
      setPhotoLoading(true);
      try {
        if (isNew) await uploadUserPhoto(userId, pendingPhoto);
        else       await updateUserPhoto(userId, pendingPhoto);
      } catch(e) { toast(e.message,"error"); }
      finally { setPhotoLoading(false); }
    }
  };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const created = await createTeacher({ registrationRequest:form, speciality });
      const uid = created?.userId ?? created?.id;
      if (uid) await handlePhotoForUser(uid, true);
      setForm({ firstname:"", lastname:"", email:"", phone:"", nni:"", sex:"", dateOfBirth:"", placeOfBirth:"" });
      setSpeciality(""); setPendingPhoto(null);
      toast(t("teachers.registered")); load(); goList();
    } catch(err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const openEdit = r => {
    setEditForm({ id:r.id, firstname:r.firstname??"", lastname:r.lastname??"", email:r.email??"", phone:r.phone??"", nni:r.nni??"", sex:r.sex??"", dateOfBrith:r.dateOfBrith??"", placeOfBirth:r.placeOfBirth??"", speciality:r.speciality??"" });
    setPendingPhoto(null); setDeletePhoto(false);
    setSelected(r); setView("edit");
  };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await updateTeacher(selected.id, editForm);
      const uid = selected.userId ?? selected.id;
      if (uid) await handlePhotoForUser(uid, false);
      toast(t("teachers.updated")); load(); goList();
    } catch(err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteTeacher(deleteTarget.id); setDeleteTarget(null); toast(t("teachers.deleted")); load(); if(view!=="list") goList(); }
    catch(err) { toast(err.message,"error"); } finally { setDeleting(false); }
  };

  // ══ LIST ══════════════════════════════════════════════════════════════════
  if (view === "list") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <PageTitle crumb={t("teachers.crumb")} title={t("teachers.title")}
          sub={loading ? t("common.loading") : `${filtered.length} ${t("teachers.title").toLowerCase()}`} />
        <button onClick={()=>setView("create")} className="btn-primary" style={{ marginBottom:32 }}>{t("teachers.addBtn")}</button>
      </div>

      <FilterBar q={q} setQ={setQ} filterSpeciality={filterSpeciality} setFilterSpeciality={setFilterSpeciality} filterStatus={filterStatus} setFilterStatus={setFilterStatus} specialities={specialities} onReset={resetFilters} totalFiltered={filtered.length} total={Array.isArray(data)?data.length:0} t={t} />

      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }}/><p>{t("common.loading")}</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize:36 }}>🎓</span>
          <p>{q||filterSpeciality||filterStatus ? t("teachers.noMatch") : t("teachers.empty")}</p>
          {(q||filterSpeciality||filterStatus) && <button onClick={resetFilters} className="btn-ghost" style={{ marginTop:8 }}>{t("common.clearFilters")}</button>}
        </div>
      ) : (
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"auto" }}>
              <thead>
                <tr>
                  <ThCell label="#"                                sortKey={null}          sortBy={sortBy} sortDir={sortDir} onSort={handleSort} style={{ width:44, textAlign:"center" }} />
                  <ThCell label={t("teachers.tableHeaders.teacher")} sortKey="lastname"      sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label={t("teachers.speciality")}         sortKey="speciality"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label={t("fields.phone")}                sortKey="phone"         sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label={t("teachers.fields.nni")}         sortKey="nni"           sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label={t("common.status")}               sortKey="isApprove"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label=""                                 sortKey={null}          sortBy={sortBy} sortDir={sortDir} onSort={handleSort} style={{ width:140, textAlign:"right" }} />
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <TeacherRow
                    key={r.id ?? i}
                    r={r}
                    index={page * pageSize + i}
                    t={t}
                    onClick={r => { setSelected(r); setView("detail"); }}
                    onEdit={openEdit}
                    onDelete={target => setDeleteTarget(target)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination — outside the scrollable area so it spans full card width */}
          <Pagination
            page={page} totalPages={totalPages}
            pageSize={pageSize} setPage={setPage} setPageSize={setPageSize}
            totalFiltered={filtered.length} t={t}
          />
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("teachers.deleteTitle", { name:`${deleteTarget.firstname} ${deleteTarget.lastname}` })}
          message={t("teachers.deleteMsg")}
          onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} loading={deleting} />
      )}
    </div>
  );

  // ══ CREATE ════════════════════════════════════════════════════════════════
  if (view === "create") return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("teachers.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("teachers.crumb")} · ${t("teachers.title")}`} title={t("teachers.registerTitle")} sub={t("teachers.registerSub")} />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label={t("common.profilePhoto")}>
            <PhotoUploadField photo={pendingPhoto ? URL.createObjectURL(pendingPhoto) : null} initial={(form.firstname?.[0]??"?").toUpperCase()} onFileSelected={setPendingPhoto} onDelete={()=>setPendingPhoto(null)} loading={photoLoading} t={t} />
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("fields.firstName")}><Input placeholder={t("fields.firstNamePlaceholder")} value={form.firstname} onChange={set("firstname")} required /></Field>
            <Field label={t("fields.lastName")}><Input placeholder={t("fields.lastNamePlaceholder")} value={form.lastname} onChange={set("lastname")} required /></Field>
          </div>
          <Field label={t("fields.email")}><Input type="email" placeholder={t("fields.emailPlaceholder")} value={form.email} onChange={set("email")} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("fields.phone")}><Input placeholder={t("fields.phonePlaceholder")} value={form.phone} onChange={set("phone")} required minLength={8} /></Field>
            <Field label={t("fields.nni")}><Input placeholder={t("fields.nniPlaceholder")} value={form.nni} onChange={set("nni")} required minLength={8} /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("teachers.fields.sex")}>
              <Select value={form.sex ?? ""} onChange={set("sex")}>
                <option value="">{t("teachers.sexPlaceholder")}</option>
                <option value="MALE">{t("teachers.sexMale")}</option>
                <option value="FEMALE">{t("teachers.sexFemale")}</option>
              </Select>
            </Field>
            <Field label={t("teachers.fields.dob")}><Input type="date" value={form.dateOfBirth ?? ""} onChange={set("dateOfBirth")} /></Field>
          </div>
          <Field label={t("teachers.fields.placeOfBirth")}><Input placeholder={t("teachers.placeOfBirthPlaceholder")} value={form.placeOfBirth ?? ""} onChange={set("placeOfBirth")} /></Field>
          <Field label={t("teachers.speciality")}><Input placeholder={t("teachers.specialityPlaceholder")} value={speciality} onChange={e=>setSpeciality(e.target.value)} /></Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving||photoLoading} label={t("teachers.registerBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("teachers.sideNote3")} initial={(form.firstname?.[0]??"?").toUpperCase()} photo={pendingPhoto ? URL.createObjectURL(pendingPhoto) : null} accentColor={C_COLOR} accentBg={C_BG}
          items={{ sectionLabel:t("common.notes"), list:[
            { icon:"📧", text:t("teachers.sideNote1") },
            { icon:"🔢", text:t("teachers.sideNote2") },
            { icon:"✅", text:t("teachers.sideNote3") },
          ]}} />}
      />
    </div>
  );

  // ══ EDIT ══════════════════════════════════════════════════════════════════
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding:"36px 44px" }}>
      <BackBtn label={t("teachers.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("teachers.crumb")} · ${t("teachers.title")}`} title={t("teachers.editTitle")} sub={t("teachers.editSub", { name:`${selected.firstname} ${selected.lastname}` })} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <Field label={t("common.profilePhoto")}>
            <PhotoUploadField photo={deletePhoto ? null : (pendingPhoto ? URL.createObjectURL(pendingPhoto) : selected.photo ?? null)} initial={(selected.firstname?.[0]??"?").toUpperCase()} onFileSelected={f=>{ setPendingPhoto(f); setDeletePhoto(false); }} onDelete={()=>{ setPendingPhoto(null); setDeletePhoto(true); }} loading={photoLoading} t={t} />
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("fields.firstName")}><Input value={editForm.firstname} onChange={setEdit("firstname")} required /></Field>
            <Field label={t("fields.lastName")}><Input value={editForm.lastname} onChange={setEdit("lastname")} required /></Field>
          </div>
          <Field label={t("fields.email")}><Input type="email" value={editForm.email} onChange={setEdit("email")} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("fields.phone")}><Input value={editForm.phone} onChange={setEdit("phone")} /></Field>
            <Field label={t("fields.nni")}><Input value={editForm.nni} onChange={setEdit("nni")} /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label={t("teachers.fields.sex")}>
              <Select value={editForm.sex ?? ""} onChange={setEdit("sex")}>
                <option value="">{t("teachers.sexPlaceholder")}</option>
                <option value="MALE">{t("teachers.sexMale")}</option>
                <option value="FEMALE">{t("teachers.sexFemale")}</option>
              </Select>
            </Field>
            <Field label={t("teachers.fields.dob")}><Input type="date" value={editForm.dateOfBrith ?? ""} onChange={setEdit("dateOfBrith")} /></Field>
          </div>
          <Field label={t("teachers.fields.placeOfBirth")}><Input placeholder={t("teachers.placeOfBirthPlaceholder")} value={editForm.placeOfBirth ?? ""} onChange={setEdit("placeOfBirth")} /></Field>
          <Field label={t("teachers.speciality")}><Input value={editForm.speciality} onChange={setEdit("speciality")} /></Field>
          <div style={{ display:"flex", gap:12, paddingTop:4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex:1, padding:"12px" }}>{t("common.cancel")}</button>
            <div style={{ flex:2 }}><SubmitBtn loading={saving||photoLoading} label={t("teachers.saveBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel title={t("teachers.editSub", { name:`${selected.firstname} ${selected.lastname}` })} initial={(selected.firstname?.[0]??"?").toUpperCase()} photo={deletePhoto ? null : (pendingPhoto ? URL.createObjectURL(pendingPhoto) : selected.photo ?? null)} accentColor={C_COLOR} accentBg={C_BG}
          items={{ sectionLabel:t("common.notes"), list:[
            { icon:"💡", text:t("teachers.editNote1") },
            { icon:"📧", text:t("teachers.editNote2") },
          ]}} />}
      />
    </div>
  );

  // ══ DETAIL ════════════════════════════════════════════════════════════════
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding:"36px 44px" }}>
        <BackBtn label={t("teachers.detailBack")} onClick={goList} />
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24 }}>
          <div style={{ height:90, background:`linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding:"0 36px 28px", marginTop:-36 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20 }}>
                <PhotoAvatar photo={v.photo} initial={(v.firstname?.[0]??"T").toUpperCase()} size={80} radius={22} style={{ border:"3px solid var(--bg-card)", boxShadow:`0 0 0 2px ${C_COLOR}40` }} />
                <div style={{ paddingBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:22, fontFamily:"'Instrument Serif',serif", color:"var(--text)", letterSpacing:"-.025em" }}>{v.firstname} {v.lastname}</h2>
                  <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap" }}>
                    {v.speciality && <span style={{ padding:"3px 11px", borderRadius:999, background:C_BG, color:C_COLOR, fontSize:12, fontWeight:600, border:`1px solid ${C_COLOR}30` }}>{v.speciality}</span>}
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:600, background:v.isApprove?"var(--green-dim)":"var(--amber-dim)", color:v.isApprove?"var(--green)":"var(--amber)", border:`1px solid ${v.isApprove?"rgba(42,117,64,.25)":"rgba(168,100,30,.25)"}` }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:v.isApprove?"var(--green)":"var(--amber)" }}/>
                      {v.isApprove ? t("common.approved") : t("common.pending")}
                    </span>
                  </div>
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
          <StatBox icon="✉️" label={t("teachers.fields.email")}       value={v.email}       color={C_COLOR} bg={C_BG} />
          <StatBox icon="📞" label={t("teachers.fields.phone")}       value={v.phone}       color={C_COLOR} bg={C_BG} />
          <StatBox icon="🪪" label={t("teachers.fields.nni")}         value={v.nni}         color={C_COLOR} bg={C_BG} />
          <StatBox icon="🎓" label={t("teachers.speciality")}         value={v.speciality}  color={C_COLOR} bg={C_BG} />
          <StatBox icon="🎂" label={t("teachers.fields.dob")}         value={v.dateOfBrith} color={C_COLOR} bg={C_BG} />
          <StatBox icon="⚧️" label={t("teachers.fields.sex")}          value={v.sex}         color={C_COLOR} bg={C_BG} />
          <StatBox icon="📍" label={t("teachers.fields.placeOfBirth")} value={v.placeOfBirth} color={C_COLOR} bg={C_BG} />
        </div>

        <TeachingSchedule teacherId={v.id} t={t} />

        {deleteTarget && (
          <ConfirmDialog
            title={t("teachers.deleteTitle", { name:`${deleteTarget.firstname} ${deleteTarget.lastname}` })}
            message={t("teachers.deleteMsg")}
            onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} loading={deleting} />
        )}
      </div>
    );
  }

  return null;
}