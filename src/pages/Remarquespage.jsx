import { useEffect, useState, useMemo } from "react";
import { getRemarks, updateRemark, deleteRemark, sendRemarks } from "../api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import DetailPanel, { DetailSection, DetailRow } from "../components/DetailPanel";
import { useLanguage } from "../LanguageContext";

const COLOR      = "var(--violet)";
const C_BG       = "var(--violet-dim)";
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_COLORS = {
  PENDING: { color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(168,100,30,.2)" },
  SENT:    { color: "var(--green)", bg: "var(--green-dim)", border: "rgba(42,117,64,.2)" },
};

// ─── Small pieces ─────────────────────────────────────────────────────────────

function InitialsAvatar({ text, color, bg, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: bg, color, border: `1.5px solid ${color}28`,
    }}>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: Math.round(size / 2.2), color }}>
        {(text || "?").toUpperCase()}
      </span>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.PENDING;
  const label = status === "SENT" ? t("remarks.statusSent") : t("common.pending");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function Textarea({ value, onChange, rows = 4, placeholder }) {
  return (
    <textarea
      value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      style={{
        width: "100%", resize: "vertical", padding: "10px 12px",
        borderRadius: "var(--r-md)", border: "1.5px solid var(--border-md)",
        background: "var(--surface)", color: "var(--text)",
        fontFamily: "'Instrument Sans',sans-serif", fontSize: 13.5, lineHeight: 1.5,
      }}
    />
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ q, setQ, status, setStatus, counts, onReset, totalFiltered, total, t }) {
  const hasFilters = q.trim() || status !== "ALL";
  const tabs = [
    { id: "ALL",     label: t("remarks.statusAll"), n: counts.all },
    { id: "PENDING", label: t("common.pending"),    n: counts.pending },
    { id: "SENT",    label: t("remarks.statusSent"), n: counts.sent },
  ];
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 20px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
      <div className="search-wrap" style={{ flex: "1 1 220px", minWidth: 180 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("remarks.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} style={{ width: "100%" }} />
      </div>

      <div style={{ display: "flex", gap: 3, padding: 4, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
        {tabs.map(tab => {
          const isActive = status === tab.id;
          const s = tab.id !== "ALL" ? STATUS_COLORS[tab.id] : null;
          return (
            <button key={tab.id} onClick={() => setStatus(tab.id)} style={{
              padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              background: isActive ? (s ? s.bg : "var(--surface-hover)") : "transparent",
              color: isActive ? (s ? s.color : "var(--text)") : "var(--text-muted)",
              fontSize: 12.5, fontWeight: isActive ? 600 : 400,
              fontFamily: "'Instrument Sans',sans-serif", transition: "all .14s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {tab.label}
              <span style={{
                fontSize: 10.5, padding: "1px 6px", borderRadius: 999,
                background: isActive ? "rgba(255,255,255,.5)" : "var(--border)",
                color: isActive ? (s ? s.color : "var(--text)") : "var(--text-faint)",
              }}>{tab.n}</span>
            </button>
          );
        })}
      </div>

      {hasFilters && (
        <button onClick={onReset} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0, color: "var(--rose)", borderColor: "rgba(184,53,53,.25)" }}>✕ {t("common.clearFilters")}</button>
      )}

      <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-faint)", flexShrink: 0, whiteSpace: "nowrap" }}>
        {hasFilters
          ? <><span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{totalFiltered}</span> {t("common.of")} {total}</>
          : <><span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{total}</span> {t("common.total")}</>}
      </div>
    </div>
  );
}

// ─── Bulk action bar ────────────────────────────────────────────────────────

function BulkBar({ count, onSend, onClear, sending, t }) {
  if (count === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
      padding: "10px 18px", borderRadius: "var(--r-lg)",
      background: "var(--violet-dim)", border: "1px solid rgba(79,67,192,.22)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--violet)" }}>
        {t("remarks.selectedCount", { n: count })}
      </span>
      <div style={{ flex: 1 }} />
      <button onClick={onClear} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }}>{t("common.clear")}</button>
      <button onClick={onSend} disabled={sending} className="btn-primary" style={{ padding: "7px 16px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
        {sending ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "📨"} {t("remarks.sendSelected")}
      </button>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, pageSize, setPage, setPageSize, totalFiltered, t }) {
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
    minWidth: 32, height: 32, borderRadius: 8,
    border: `1px solid ${active ? COLOR : "var(--border-md)"}`,
    background: active ? COLOR : "var(--surface)",
    color: active ? "#fff" : "var(--text-muted)",
    fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5,
    fontWeight: active ? 700 : 400,
    cursor: disabled || active ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background .14s, color .14s, border-color .14s",
    opacity: disabled ? 0.35 : 1,
  });
  const start = page * pageSize + 1;
  const end   = Math.min((page + 1) * pageSize, totalFiltered);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface, rgba(0,0,0,.02))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{t("pagination.rowsPerPage")}</span>
          <div style={{ display: "flex", gap: 4 }}>
            {PAGE_SIZE_OPTIONS.map(s => (
              <button key={s} onClick={() => { setPageSize(s); setPage(0); }} style={{ ...btnStyle(pageSize === s), minWidth: 34, padding: "0 8px", fontSize: 12 }}>{s}</button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
          <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{start}–{end}</span> {t("common.of")} <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{totalFiltered}</span>
        </span>
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setPage(0)} disabled={page === 0} title={t("pagination.firstPage")} style={{ ...btnStyle(false, page === 0), padding: "0 8px" }}>«</button>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} title={t("pagination.prevPage")} style={{ ...btnStyle(false, page === 0), padding: "0 8px" }}>‹</button>
          {withEllipsis.map((p, i) => p === "..."
            ? <span key={`e${i}`} style={{ color: "var(--text-faint)", fontSize: 13, padding: "0 4px" }}>…</span>
            : <button key={p} onClick={() => setPage(p)} style={{ ...btnStyle(page === p), padding: "0 6px" }}>{p + 1}</button>
          )}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} title={t("pagination.nextPage")} style={{ ...btnStyle(false, page >= totalPages - 1), padding: "0 8px" }}>›</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} title={t("pagination.lastPage")} style={{ ...btnStyle(false, page >= totalPages - 1), padding: "0 8px" }}>»</button>
        </div>
      )}
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function RemarkRow({ r, index, checked, onCheck, onClick, onEdit, onDelete, t }) {
  const [hovered, setHovered] = useState(false);
  const studentName = `${r.studentFirstname ?? ""} ${r.studentLastname ?? ""}`.trim() || "—";
  const teacherName = `${r.teacherFirstname ?? ""} ${r.teacherLastname ?? ""}`.trim() || "—";

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
      <td style={{ padding: "10px 16px", width: 36 }} onClick={e => e.stopPropagation()}>
        {r.status === "PENDING" && (
          <input type="checkbox" checked={checked} onChange={() => onCheck(r.id)} style={{ width: 15, height: 15, cursor: "pointer" }} />
        )}
      </td>

      <td style={{ padding: "10px 16px", maxWidth: 260 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.title || t("remarks.untitled")}
        </div>
        {r.description && (
          <div style={{
            fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", wordBreak: "break-word",
          }}>
            {r.description}
          </div>
        )}
      </td>

      <td style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <InitialsAvatar text={r.studentFirstname?.[0]} color={COLOR} bg={C_BG} size={28} />
          <div>
            <div style={{ fontSize: 13, color: "var(--text)", whiteSpace: "nowrap" }}>{studentName}</div>
            {r.studentRegistrationNumber && (
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "'JetBrains Mono',monospace" }}>{r.studentRegistrationNumber}</div>
            )}
          </div>
        </div>
      </td>

      <td style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <InitialsAvatar text={r.teacherFirstname?.[0]} color="var(--teal)" bg="var(--teal-dim)" size={28} />
          <span style={{ fontSize: 13, color: "var(--text)", whiteSpace: "nowrap" }}>{teacherName}</span>
        </div>
      </td>

      <td style={{ padding: "10px 16px" }}><StatusBadge status={r.status} t={t} /></td>

      <td style={{ padding: "10px 16px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.edit")}</button>
          <button onClick={() => onDelete(r)} className="btn-danger" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.delete")}</button>
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function RemarquesPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewTarget, setViewTarget]     = useState(null);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending]   = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  const [q, setQ]           = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [editForm, setEditForm] = useState({ title: "", description: "", status: "PENDING" });
  const setEditField = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    getRemarks()
      .then(r => setData(Array.isArray(r) ? r : []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => setPage(0), [q, status]);

  const counts = useMemo(() => ({
    all:     data.length,
    pending: data.filter(r => r.status === "PENDING").length,
    sent:    data.filter(r => r.status === "SENT").length,
  }), [data]);

  const filtered = useMemo(() => {
    let arr = data;
    if (status !== "ALL") arr = arr.filter(r => r.status === status);
    if (q.trim()) {
      const lq = q.toLowerCase();
      arr = arr.filter(r =>
        r.title?.toLowerCase().includes(lq) ||
        r.description?.toLowerCase().includes(lq) ||
        `${r.studentFirstname} ${r.studentLastname}`.toLowerCase().includes(lq) ||
        `${r.teacherFirstname} ${r.teacherLastname}`.toLowerCase().includes(lq) ||
        r.studentRegistrationNumber?.toLowerCase().includes(lq)
      );
    }
    return arr;
  }, [data, status, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const resetFilters = () => { setQ(""); setStatus("ALL"); setPage(0); };

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const clearSelection = () => setSelected(new Set());

  // Selection can go stale if a remark's status changes elsewhere — keep it honest.
  useEffect(() => {
    setSelected(prev => {
      const validIds = new Set(data.filter(r => r.status === "PENDING").map(r => r.id));
      const next = new Set([...prev].filter(id => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  const handleSendSelected = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      await sendRemarks([...selected]);
      toast(t("remarks.bulkSentToast", { n: selected.size }));
      clearSelection();
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSending(false); }
  };

  const handleSendOne = async (r) => {
    setSending(true);
    try { await sendRemarks([r.id]); toast(t("remarks.sentToast")); setViewTarget(null); load(); }
    catch (e) { toast(e.message, "error"); }
    finally { setSending(false); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (r) => {
    setEditForm({ title: r.title ?? "", description: r.description ?? "", status: r.status ?? "PENDING" });
    setViewTarget(null);
    setEditTarget(r);
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await updateRemark(editTarget.id, editForm);
      toast(t("remarks.updatedToast"));
      setEditTarget(null);
      load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRemark(deleteTarget.id);
      toast(t("remarks.deletedToast"));
      setDeleteTarget(null);
      setViewTarget(null);
      load();
    } catch (err) { toast(err.message, "error"); }
    finally { setDeleting(false); }
  };

  const v = viewTarget;
  const vStudentName = v ? `${v.studentFirstname ?? ""} ${v.studentLastname ?? ""}`.trim() : "";
  const vTeacherName = v ? `${v.teacherFirstname ?? ""} ${v.teacherLastname ?? ""}`.trim() : "";

  return (
    <>
      <div className="page-enter" style={{ padding: "36px 44px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>{t("remarks.crumb")}</div>
            <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Instrument Serif',serif", color: "var(--text)", letterSpacing: "-.03em" }}>{t("remarks.title")}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
              {loading ? t("common.loading") : t("remarks.subtitleCount", { n: filtered.length })}
            </p>
          </div>
        </div>

        <FilterBar
          q={q} setQ={setQ} status={status} setStatus={setStatus}
          counts={counts} onReset={resetFilters}
          totalFiltered={filtered.length} total={data.length} t={t}
        />

        <BulkBar count={selected.size} onSend={handleSendSelected} onClear={clearSelection} sending={sending} t={t} />

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ width: 22, height: 22 }} />
            <p>{t("common.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 36 }}>📝</span>
            <p>{q || status !== "ALL" ? t("remarks.noMatch") : t("remarks.empty")}</p>
            {(q || status !== "ALL") && (
              <button onClick={resetFilters} className="btn-ghost" style={{ marginTop: 8 }}>{t("common.clearFilters")}</button>
            )}
          </div>
        ) : (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "11px 16px", background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)", width: 36 }} />
                    <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)" }}>{t("remarks.tableHeaders.remark")}</th>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)" }}>{t("remarks.tableHeaders.student")}</th>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)" }}>{t("remarks.tableHeaders.teacher")}</th>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)" }}>{t("common.status")}</th>
                    <th style={{ padding: "11px 16px", width: 140, background: "var(--surface, rgba(0,0,0,.03))", borderBottom: "2px solid var(--border)" }} />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
                    <RemarkRow
                      key={r.id ?? i}
                      r={r}
                      index={page * pageSize + i}
                      checked={selected.has(r.id)}
                      onCheck={toggleSelect}
                      onClick={setViewTarget}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                      t={t}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} totalFiltered={filtered.length} t={t} />
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editTarget && (
        <Modal title={t("remarks.editModalTitle")} subtitle={`${editTarget.studentFirstname ?? ""} ${editTarget.studentLastname ?? ""}`} icon="✏️" accentColor={COLOR} onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label={t("remarks.fields.title")}><Input value={editForm.title} onChange={e => setEditField("title", e.target.value)} required /></Field>
            <Field label={t("remarks.fields.description")}>
              <Textarea value={editForm.description} onChange={e => setEditField("description", e.target.value)} />
            </Field>
            <Field label={t("common.status")}>
              <Select value={editForm.status} onChange={e => setEditField("status", e.target.value)}>
                <option value="PENDING">{t("common.pending")}</option>
                <option value="SENT">{t("remarks.statusSent")}</option>
              </Select>
            </Field>
            <SubmitBtn loading={saving} label={t("remarks.saveChanges")} />
          </form>
        </Modal>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <ConfirmDialog
          title={t("remarks.deleteTitle")}
          message={t("remarks.deleteMsg", { title: deleteTarget.title || t("remarks.thisRemark") })}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}

      {/* ── Detail panel ── */}
      {v && (
        <DetailPanel title={v.title || t("remarks.detailDefaultTitle")} subtitle={vStudentName} avatar="📝" color={COLOR} onClose={() => setViewTarget(null)}>
          <DetailSection label={t("remarks.detailSections.remark")}>
            <DetailRow icon="🏷️" label={t("remarks.fields.title")} value={v.title} />
            <DetailRow icon="📌" label={t("common.status")} value={v.status === "SENT" ? t("remarks.statusSent") : t("common.pending")} />
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 4 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>{t("remarks.fields.description")}</div>
                <div style={{
                  fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "10px 12px",
                }}>
                  {v.description || "—"}
                </div>
              </div>
            </div>
          </DetailSection>
          <DetailSection label={t("remarks.detailSections.student")}>
            <DetailRow icon="🎓" label={t("remarks.fields.name")} value={vStudentName} />
            <DetailRow icon="🔢" label={t("remarks.fields.regNumber")} value={v.studentRegistrationNumber} />
          </DetailSection>
          <DetailSection label={t("remarks.detailSections.teacher")}>
            <DetailRow icon="👤" label={t("remarks.fields.name")} value={vTeacherName} />
          </DetailSection>
          <DetailSection label={t("common.actions")}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {v.status === "PENDING" && (
                <button onClick={() => handleSendOne(v)} disabled={sending} className="btn-primary" style={{ flex: 1, minWidth: 120, padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {sending ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "📨"} {t("remarks.send")}
                </button>
              )}
              <button onClick={() => openEdit(v)} className="btn-ghost" style={{ flex: 1, minWidth: 100, padding: "11px" }}>✏️ {t("common.edit")}</button>
              <button onClick={() => { setViewTarget(null); setDeleteTarget(v); }} className="btn-danger" style={{ flex: 1, minWidth: 100, padding: "11px" }}>🗑 {t("common.delete")}</button>
            </div>
          </DetailSection>
        </DetailPanel>
      )}
    </>
  );
}