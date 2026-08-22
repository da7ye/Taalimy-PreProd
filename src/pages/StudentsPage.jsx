import { useEffect, useState, useMemo, useRef } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent, getClasseNames, getStudentReceipt } from "../api";
import { uploadUserPhoto, updateUserPhoto, deleteUserPhoto } from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { usePersonForm } from "../hooks/usePersonForm";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--teal)";
const C_BG    = "var(--teal-dim)";
const PAGE_SIZE_OPTIONS = [25, 50, 100];

// ─── Photo helpers ────────────────────────────────────────────────────────────

function PhotoAvatar({ photo, initial = "?", size = 48, radius = 14, color = C_COLOR, bg = C_BG, style = {} }) {
  const fs = Math.round(size / 2.4);
  const [failed, setFailed] = useState(false);

  const base = {
    width: size, height: size, borderRadius: radius,
    flexShrink: 0, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    ...style,
  };

  if (photo && !failed) {
    return (
      <div style={base}>
        <img
          src={photo} alt={initial}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: bg, color, border: `1.5px solid ${color}28` }}>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: fs, color }}>
        {(initial || "?").toUpperCase()}
      </span>
    </div>
  );
}

function PhotoUploadField({ photo, initial, color = C_COLOR, bg = C_BG, onFileSelected, onDelete, loading = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(photo || null);

  useEffect(() => { setPreview(photo || null); }, [photo]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelected?.(file);
    e.target.value = "";
  };

  const handleDelete = () => { setPreview(null); onDelete?.(); };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <PhotoAvatar photo={preview} initial={initial} size={80} radius={20} color={color} bg={bg} />
        {loading && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="spinner" style={{ width: 20, height: 20, borderTopColor: "#fff" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: "var(--r-md)",
          background: "var(--surface)", border: "1.5px solid var(--border-md)",
          color: "var(--text-dim)", fontSize: 12.5, fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Instrument Sans',sans-serif",
          transition: "background .13s", opacity: loading ? 0.5 : 1,
        }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = "var(--surface)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {preview ? "Change photo" : "Upload photo"}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} disabled={loading} />
        </label>
        {preview && (
          <button type="button" onClick={handleDelete} disabled={loading} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: "var(--r-md)",
            background: "var(--rose-dim)", border: "1px solid rgba(184,53,53,.18)",
            color: "var(--rose)", fontSize: 12, fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Instrument Sans',sans-serif",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Remove photo
          </button>
        )}
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>JPG, PNG or WebP · max 5 MB</span>
      </div>
    </div>
  );
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

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

// ─── Sort helpers ─────────────────────────────────────────────────────────────

function SortIcon({ dir }) {
  if (!dir) return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none" style={{ opacity: 0.3 }}>
      <path d="M5 1L1 5h8L5 1zM5 13l4-4H1l4 4z" fill="currentColor"/>
    </svg>
  );
  if (dir === "asc") return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none">
      <path d="M5 1L1 7h8L5 1z" fill="currentColor" opacity="1"/>
      <path d="M5 13l4-4H1l4 4z" fill="currentColor" opacity="0.25"/>
    </svg>
  );
  return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none">
      <path d="M5 1L1 7h8L5 1z" fill="currentColor" opacity="0.25"/>
      <path d="M5 13l4-4H1l4 4z" fill="currentColor" opacity="1"/>
    </svg>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function StudentRow({ r, index, onClick, onEdit, onDelete, onReceipt, loadingReceipt, t }) {
  const cn = r.classeName ?? r.classe?.name;
  const initial = r.firstname?.[0] ?? "?";
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={() => onClick(r)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        background: hovered ? "var(--surface-hover, rgba(0,0,0,.025))" : index % 2 === 0 ? "transparent" : "rgba(0,0,0,.012)",
        transition: "background .12s",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* # index */}
      <td style={{ padding: "12px 16px", width: 44, color: "var(--text-faint)", fontSize: 12, fontWeight: 500, fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>
        {index + 1}
      </td>

      {/* Avatar + Name */}
      <td style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PhotoAvatar photo={r.photo} initial={initial} size={36} radius={10} color={C_COLOR} bg={C_BG} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap" }}>
              {r.firstname} {r.lastname}
            </div>
            {r.email && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200, whiteSpace: "nowrap" }}>
                {r.email}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Reg # */}
      <td style={{ padding: "12px 16px" }}>
        {r.registrationNumber
          ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "3px 9px", borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border-md)", color: "var(--text-dim)", whiteSpace: "nowrap" }}>
              {r.registrationNumber}
            </span>
          : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
        }
      </td>

      {/* NNI */}
      <td style={{ padding: "12px 16px" }}>
        {r.nni
          ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "3px 9px", borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border-md)", color: "var(--text-dim)", whiteSpace: "nowrap" }}>
              {r.nni}
            </span>
          : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
        }
      </td>

      {/* Class */}
      <td style={{ padding: "12px 16px" }}>
        {cn
          ? <span style={{ padding: "3px 10px", borderRadius: 999, background: C_BG, color: C_COLOR, fontSize: 12, fontWeight: 600, border: `1px solid ${C_COLOR}22`, whiteSpace: "nowrap" }}>{cn}</span>
          : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
        }
      </td>

      {/* Status */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
          background: r.isApprove ? "var(--green-dim)" : "var(--amber-dim)",
          color: r.isApprove ? "var(--green)" : "var(--amber)",
          border: `1px solid ${r.isApprove ? "rgba(42,117,64,.2)" : "rgba(168,100,30,.2)"}`,
          whiteSpace: "nowrap",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.isApprove ? "var(--green)" : "var(--amber)", flexShrink: 0 }} />
          {r.isApprove ? t("common.approved") : t("common.pending")}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: "10px 16px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button
            onClick={() => onReceipt(r.id)}
            disabled={loadingReceipt === r.id}
            className="btn-ghost"
            title="Download inscription receipt"
            style={{ padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {loadingReceipt === r.id ? <span className="spinner" style={{ width: 11, height: 11 }} /> : "🧾"}
          </button>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.edit")}</button>
          <button onClick={() => onDelete(r)} className="btn-danger" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.delete")}</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Table Header Cell ────────────────────────────────────────────────────────

function ThCell({ label, sortKey, sortBy, sortDir, onSort, style = {} }) {
  const active = sortBy === sortKey;
  return (
    <th
      onClick={() => sortKey && onSort(sortKey)}
      style={{
        padding: "11px 16px",
        textAlign: "left",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".07em",
        color: active ? C_COLOR : "var(--text-faint)",
        background: "var(--surface, rgba(0,0,0,.03))",
        borderBottom: "2px solid var(--border)",
        cursor: sortKey ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        transition: "color .13s",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {label}
        {sortKey && <SortIcon dir={active ? sortDir : null} />}
      </span>
    </th>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ q, setQ, filterClass, setFilterClass, filterStatus, setFilterStatus, classes, onReset, totalFiltered, total, t }) {
  const hasFilters = q.trim() || filterClass || filterStatus;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 20px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
      <div className="search-wrap" style={{ flex: "1 1 220px", minWidth: 180 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("students.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} style={{ width: "100%" }} />
      </div>
      <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="t-select" style={{ flex: "1 1 160px", minWidth: 140, maxWidth: 200 }}>
        <option value="">All Classes</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="t-select" style={{ flex: "0 0 150px" }}>
        <option value="">All Statuses</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
      </select>
      {hasFilters && (
        <button onClick={onReset} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0, color: "var(--rose)", borderColor: "rgba(184,53,53,.25)" }}>✕ Clear</button>
      )}
      <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-faint)", flexShrink: 0, whiteSpace: "nowrap" }}>
        {hasFilters
          ? <><span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{totalFiltered}</span> of {total}</>
          : <><span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{total}</span> total</>}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, pageSize, setPage, setPageSize, totalFiltered }) {
  // Always render so users can change page size even on a single page
  if (totalFiltered === 0) return null;

  const pages = [];
  const delta = 2;
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) pages.push(i);
  }
  const withEllipsis = [];
  let prev = -1;
  for (const p of pages) {
    if (prev !== -1 && p - prev > 1) withEllipsis.push("...");
    withEllipsis.push(p);
    prev = p;
  }

  const btnStyle = (active, disabled = false) => ({
    minWidth: 34, height: 34, borderRadius: 8,
    border: `1px solid ${active ? C_COLOR : "var(--border-md)"}`,
    background: active ? C_COLOR : "var(--surface)",
    color: active ? "#fff" : "var(--text-muted)",
    fontFamily: "'Instrument Sans',sans-serif", fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: disabled || active ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background .14s, color .14s, border-color .14s",
    opacity: disabled ? 0.35 : 1,
  });

  const start = page * pageSize + 1;
  const end   = Math.min((page + 1) * pageSize, totalFiltered);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
      marginTop: 0, padding: "14px 20px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface, rgba(0,0,0,.02))",
    }}>
      {/* Left: rows-per-page + range info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap" }}>Rows per page:</span>
          <div style={{ display: "flex", gap: 4 }}>
            {PAGE_SIZE_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setPageSize(s); setPage(0); }}
                style={{ ...btnStyle(pageSize === s), minWidth: 38, padding: "0 10px", fontSize: 12 }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
          <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{start}–{end}</span>
          {" "}of{" "}
          <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{totalFiltered}</span>
        </span>
      </div>

      {/* Right: page buttons (hidden when only 1 page) */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* First */}
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            title="First page"
            style={{ ...btnStyle(false, page === 0), minWidth: 34, padding: "0 8px", fontSize: 15 }}
          >
            «
          </button>
          {/* Prev */}
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            title="Previous page"
            style={{ ...btnStyle(false, page === 0), minWidth: 34, padding: "0 8px", fontSize: 15 }}
          >
            ‹
          </button>

          {withEllipsis.map((p, i) =>
            p === "..."
              ? <span key={`e${i}`} style={{ color: "var(--text-faint)", fontSize: 13, padding: "0 4px", lineHeight: "34px" }}>…</span>
              : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ ...btnStyle(page === p), minWidth: 34, padding: "0 6px" }}
                >
                  {p + 1}
                </button>
              )
          )}

          {/* Next */}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            title="Next page"
            style={{ ...btnStyle(false, page >= totalPages - 1), minWidth: 34, padding: "0 8px", fontSize: 15 }}
          >
            ›
          </button>
          {/* Last */}
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            title="Last page"
            style={{ ...btnStyle(false, page >= totalPages - 1), minWidth: 34, padding: "0 8px", fontSize: 15 }}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function StudentsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(null);

  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [deletePhoto, setDeletePhoto]   = useState(false);

  // Filters
  const [q, setQ]                       = useState("");
  const [filterClass, setFilterClass]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Sort — default: registrationNumber ascending
  const [sortBy, setSortBy]   = useState("registrationNumber");
  const [sortDir, setSortDir] = useState("asc");

  // Pagination
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { form, set, setForm }  = usePersonForm();
  const [idClasse, setIdClasse] = useState("");
  const [editForm, setEditForm] = useState({});
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getStudents(), getClasseNames()])
      .then(([s, c]) => {
        setData(Array.isArray(s) ? s : s?.content ?? []);
        setClasses(Array.isArray(c) ? c : c?.content ?? []);
      })
      .catch(e => toast(e.message, "error")).finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => setPage(0), [q, filterClass, filterStatus, sortBy, sortDir]);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let arr = Array.isArray(data) ? data : [];
    if (q.trim()) {
      const lq = q.toLowerCase();
      arr = arr.filter(r =>
        `${r.firstname} ${r.lastname}`.toLowerCase().includes(lq) ||
        r.email?.toLowerCase().includes(lq) ||
        r.registrationNumber?.toLowerCase().includes(lq) ||
        r.nni?.toLowerCase().includes(lq)
      );
    }
    if (filterClass) {
      arr = arr.filter(r =>
        String(r.classeId ?? r.classe?.id) === String(filterClass) ||
        r.classeName === classes.find(c => String(c.id) === String(filterClass))?.name
      );
    }
    if (filterStatus === "approved") arr = arr.filter(r => r.isApprove);
    if (filterStatus === "pending")  arr = arr.filter(r => !r.isApprove);

    // Sort
    arr = [...arr].sort((a, b) => {
      let av = a[sortBy] ?? "";
      let bv = b[sortBy] ?? "";
      if (sortBy === "registrationNumber") {
        const an = parseInt(av, 10), bn = parseInt(bv, 10);
        if (!isNaN(an) && !isNaN(bn)) { av = an; bv = bn; }
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [data, q, filterClass, filterStatus, classes, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const resetFilters = () => { setQ(""); setFilterClass(""); setFilterStatus(""); setPage(0); };
  const goList = () => { setView("list"); setSelected(null); setPendingPhoto(null); setDeletePhoto(false); };

  // ── Receipt download ───────────────────────────────────────────────────────
  const handleReceipt = async (studentId) => {
    setLoadingReceipt(studentId);
    try {
      const blob = await getStudentReceipt(studentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoadingReceipt(null);
    }
  };

  // ── Photo helpers ──────────────────────────────────────────────────────────
  const handlePhotoForUser = async (userId, isNew) => {
    if (deletePhoto && !isNew) {
      setPhotoLoading(true);
      try { await deleteUserPhoto(userId); } catch(e) { toast(e.message, "error"); }
      finally { setPhotoLoading(false); }
    } else if (pendingPhoto) {
      setPhotoLoading(true);
      try {
        if (isNew) await uploadUserPhoto(userId, pendingPhoto);
        else       await updateUserPhoto(userId, pendingPhoto);
      } catch(e) { toast(e.message, "error"); }
      finally { setPhotoLoading(false); }
    }
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const created = await createStudent({ registrationRequest: form, idClasse: idClasse ? parseInt(idClasse) : undefined });
      const uid = created?.userId ?? created?.id;
      if (uid) await handlePhotoForUser(uid, true);
      setForm({ firstname: "", lastname: "", email: "", phone: "", nni: "", sex: "", dateOfBirth: "", placeOfBirth: "" });
      setIdClasse(""); setPendingPhoto(null);
      toast(t("students.enrolled")); load(); goList();
    } catch(err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = r => {
    // The API doesn't always return classeId directly on the student — fall back to
    // resolving it from classeName against the loaded classes list so the dropdown
    // preselects the student's current class instead of showing the placeholder.
    const currentClasseId =
      r.classeId ?? r.classe?.id ??
      classes.find(c => c.name === (r.classeName ?? r.classe?.name))?.id ??
      "";
    setEditForm({ id: r.id, firstname: r.firstname ?? "", lastname: r.lastname ?? "", email: r.email ?? "", nni: r.nni ?? "", sex: r.sex ?? "", dateOfBrith: r.dateOfBrith ?? "", placeOfBirth: r.placeOfBirth ?? "", registrationNumber: r.registrationNumber ?? "", classeId: currentClasseId });
    setPendingPhoto(null); setDeletePhoto(false);
    setSelected(r); setView("edit");
  };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await updateStudent(selected.id, { ...editForm, classeId: editForm.classeId ? parseInt(editForm.classeId) : undefined });
      const uid = selected.userId ?? selected.id;
      if (uid) await handlePhotoForUser(uid, false);
      toast(t("students.updated")); load(); goList();
    } catch(err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteStudent(deleteTarget.userId ?? deleteTarget.id); setDeleteTarget(null); toast(t("students.deleted")); load(); if (view !== "list") goList(); }
    catch(err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  // ══ LIST ══════════════════════════════════════════════════════════════════
  if (view === "list") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <PageTitle
          crumb={t("students.crumb")}
          title={t("students.title")}
          sub={loading ? t("common.loading") : `${filtered.length} ${t("students.title").toLowerCase()}`}
        />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom: 32 }}>
          {t("students.addBtn")}
        </button>
      </div>

      <FilterBar
        q={q} setQ={setQ}
        filterClass={filterClass} setFilterClass={setFilterClass}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        classes={classes} onReset={resetFilters}
        totalFiltered={filtered.length} total={data.length} t={t}
      />

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 22, height: 22 }} />
          <p>{t("common.loading")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 36 }}>📚</span>
          <p>{q || filterClass || filterStatus ? "No students match your filters." : t("students.empty")}</p>
          {(q || filterClass || filterStatus) && (
            <button onClick={resetFilters} className="btn-ghost" style={{ marginTop: 8 }}>Clear filters</button>
          )}
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead>
                <tr>
                  <ThCell label="#"                   sortKey={null}                 sortBy={sortBy} sortDir={sortDir} onSort={handleSort} style={{ width: 44, textAlign: "center" }} />
                  <ThCell label="Student"             sortKey="firstname"            sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label="Reg. Number"         sortKey="registrationNumber"   sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label="NNI"                 sortKey="nni"                  sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label={t("students.class")} sortKey="classeName"           sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label="Status"              sortKey="isApprove"            sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <ThCell label=""                    sortKey={null}                 sortBy={sortBy} sortDir={sortDir} onSort={handleSort} style={{ width: 140, textAlign: "right" }} />
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <StudentRow
                    key={r.id ?? i}
                    r={r}
                    index={page * pageSize + i}
                    t={t}
                    onClick={r => { setSelected(r); setView("detail"); }}
                    onEdit={openEdit}
                    onDelete={target => setDeleteTarget(target)}
                    onReceipt={handleReceipt}
                    loadingReceipt={loadingReceipt}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination — outside the scrollable area so it always spans full width */}
          <Pagination
            page={page} totalPages={totalPages}
            pageSize={pageSize} setPage={setPage} setPageSize={setPageSize}
            totalFiltered={filtered.length}
          />
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("students.deleteTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })}
          message={t("students.deleteMsg")}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}
    </div>
  );

  // ══ CREATE ════════════════════════════════════════════════════════════════
  if (view === "create") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("students.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("students.crumb")} · ${t("students.title")}`} title={t("students.enrollTitle")} sub={t("students.enrollSub")} />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <Field label="Profile Photo">
            <PhotoUploadField
              photo={pendingPhoto ? URL.createObjectURL(pendingPhoto) : null}
              initial={(form.firstname?.[0] ?? "?").toUpperCase()}
              onFileSelected={setPendingPhoto}
              onDelete={() => setPendingPhoto(null)}
              loading={photoLoading}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("fields.firstName")}><Input placeholder={t("fields.firstNamePlaceholder")} value={form.firstname} onChange={set("firstname")} required /></Field>
            <Field label={t("fields.lastName")}><Input placeholder={t("fields.lastNamePlaceholder")} value={form.lastname} onChange={set("lastname")} required /></Field>
          </div>
          <Field label={t("fields.email")}><Input type="email" placeholder={t("fields.emailPlaceholder")} value={form.email} onChange={set("email")} /></Field>
          <Field label={t("fields.nni")}><Input placeholder={t("fields.nniPlaceholder")} value={form.nni} onChange={set("nni")} required minLength={8} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Sex">
              <Select value={form.sex ?? ""} onChange={set("sex")}>
                <option value="">— Sex —</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </Field>
            <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth ?? ""} onChange={set("dateOfBirth")} /></Field>
          </div>
          <Field label="Place of Birth"><Input placeholder="e.g. Nouakchott" value={form.placeOfBirth ?? ""} onChange={set("placeOfBirth")} /></Field>
          <Field label={t("students.class")}>
            <Select value={idClasse} onChange={e => setIdClasse(e.target.value)}>
              <option value="">— {t("students.class")} —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
            <div style={{ flex: 2 }}><SubmitBtn loading={saving || photoLoading} label={t("students.enrollBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel
          title={t("students.sidePendingNote")}
          initial={(form.firstname?.[0] ?? "?").toUpperCase()}
          photo={pendingPhoto ? URL.createObjectURL(pendingPhoto) : null}
          accentColor={C_COLOR} accentBg={C_BG}
          items={{ sectionLabel: t("common.notes"), list: [
            { icon: "🔢", text: t("students.sideNote1") },
            { icon: "🏫", text: t("students.sideNote2") },
            { icon: "✅", text: t("students.sideNote3") },
          ]}}
        />}
      />
    </div>
  );

  // ══ EDIT ══════════════════════════════════════════════════════════════════
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("students.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("students.crumb")} · ${t("students.title")}`} title={t("students.editTitle")} sub={t("students.editSub", { name: `${selected.firstname} ${selected.lastname}` })} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <Field label="Profile Photo">
            <PhotoUploadField
              photo={deletePhoto ? null : (pendingPhoto ? URL.createObjectURL(pendingPhoto) : selected.photo ?? null)}
              initial={(selected.firstname?.[0] ?? "?").toUpperCase()}
              onFileSelected={f => { setPendingPhoto(f); setDeletePhoto(false); }}
              onDelete={() => { setPendingPhoto(null); setDeletePhoto(true); }}
              loading={photoLoading}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("fields.firstName")}><Input value={editForm.firstname} onChange={setEdit("firstname")} required /></Field>
            <Field label={t("fields.lastName")}><Input value={editForm.lastname} onChange={setEdit("lastname")} required /></Field>
          </div>
          <Field label={t("fields.email")}><Input type="email" value={editForm.email} onChange={setEdit("email")} /></Field>
          <Field label={t("fields.nni")}><Input value={editForm.nni} onChange={setEdit("nni")} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Sex">
              <Select value={editForm.sex ?? ""} onChange={setEdit("sex")}>
                <option value="">— Sex —</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </Field>
            <Field label="Date of Birth"><Input type="date" value={editForm.dateOfBrith ?? ""} onChange={setEdit("dateOfBrith")} /></Field>
          </div>
          <Field label="Place of Birth"><Input placeholder="e.g. Nouakchott" value={editForm.placeOfBirth ?? ""} onChange={setEdit("placeOfBirth")} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("students.fields.regNumber")} hint="Registration number cannot be changed">
              <Input value={editForm.registrationNumber} disabled readOnly style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </Field>
            <Field label={t("students.class")}>
              <Select value={editForm.classeId} onChange={setEdit("classeId")}>
                <option value="">— {t("students.class")} —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
            <div style={{ flex: 2 }}><SubmitBtn loading={saving || photoLoading} label={t("students.saveBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel
          title={t("students.editSub", { name: `${selected.firstname} ${selected.lastname}` })}
          initial={(selected.firstname?.[0] ?? "?").toUpperCase()}
          photo={deletePhoto ? null : (pendingPhoto ? URL.createObjectURL(pendingPhoto) : selected.photo ?? null)}
          accentColor={C_COLOR} accentBg={C_BG}
          items={{ sectionLabel: t("common.notes"), list: [
            { icon: "💡", text: t("students.editNote1") },
            { icon: "🏫", text: t("students.editNote2") },
          ]}}
        />}
      />
    </div>
  );

  // ══ DETAIL ════════════════════════════════════════════════════════════════
  if (view === "detail" && selected) {
    const v = selected; const cn = v.classeName ?? v.classe?.name;
    return (
      <div className="page-enter" style={{ padding: "36px 44px" }}>
        <BackBtn label={t("students.detailBack")} onClick={goList} />
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: 90, background: `linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding: "0 36px 28px", marginTop: -36 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                <PhotoAvatar
                  photo={v.photo}
                  initial={(v.firstname?.[0] ?? "S").toUpperCase()}
                  size={80} radius={22}
                  style={{ border: "3px solid var(--bg-card)", boxShadow: `0 0 0 2px ${C_COLOR}40` }}
                />
                <div style={{ paddingBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Instrument Serif',serif", color: "var(--text)", letterSpacing: "-.025em" }}>{v.firstname} {v.lastname}</h2>
                  <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                    {v.registrationNumber && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border-md)", color: "var(--text-muted)" }}>{v.registrationNumber}</span>}
                    {cn && <span style={{ padding: "3px 11px", borderRadius: 999, background: C_BG, color: C_COLOR, fontSize: 12, fontWeight: 600, border: `1px solid ${C_COLOR}30` }}>{cn}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: v.isApprove ? "var(--green-dim)" : "var(--amber-dim)", color: v.isApprove ? "var(--green)" : "var(--amber)", border: `1px solid ${v.isApprove ? "rgba(42,117,64,.25)" : "rgba(168,100,30,.25)"}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.isApprove ? "var(--green)" : "var(--amber)" }} />
                      {v.isApprove ? t("common.approved") : t("common.pending")}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleReceipt(v.id)} disabled={loadingReceipt === v.id} className="btn-ghost" style={{ padding: "10px 20px" }}>
                  {loadingReceipt === v.id ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : "🧾 Receipt"}
                </button>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding: "10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding: "10px 20px" }}>🗑 {t("common.delete")}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <StatBox icon="✉️" label={t("students.fields.email")}     value={v.email} />
          <StatBox icon="🪪" label={t("students.fields.nni")}       value={v.nni} />
          <StatBox icon="🔢" label={t("students.fields.regNumber")} value={v.registrationNumber} />
          <StatBox icon="🏫" label={t("students.fields.class")}     value={cn} />
          <StatBox icon="🎂" label={t("students.fields.dob")}       value={v.dateOfBrith} />
          <StatBox icon="⚧️" label="Sex"                            value={v.sex} />
          <StatBox icon="📍" label="Place of Birth"                 value={v.placeOfBirth} />
          <StatBox icon="🏠" label="Address"                        value={v.address} />
        </div>
        {deleteTarget && (
          <ConfirmDialog
            title={t("students.deleteTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })}
            message={t("students.deleteMsg")}
            onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
          />
        )}
      </div>
    );
  }

  return null;
}