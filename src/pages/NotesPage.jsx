import { useEffect, useState, useMemo } from "react";
import {
  getStudents, getClasseNames, getMatiereNames, getTeacherNames, getTrimestreNames,
  getNotesByStudent, getNotesByStudentAndTrimestre,
  createNote, updateNote, deleteNote, getBulletin, getBulletinPdf, getClasseStats,
  getNoteSheet, submitNoteSheet, approveNote, bulkApproveNotes,
  getPendingNotes, getPendingNotesByClasse, getPendingNotesByClasseAndTrimestre,
  getClassesByTeacher, getMatieresByTeacherAndClasse,
} from "../api";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--blue)";
const C_BG    = "var(--blue-dim)";

const TYPE_OPTIONS = ["DEVOIR_1", "DEVOIR_2", "DEVOIR_3", "EXAMEN"];

function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, fontFamily: "'Instrument Sans', sans-serif", padding: 0, marginBottom: 28, transition: "color .13s" }}
      onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      {label}
    </button>
  );
}

function PageTitle({ crumb, title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-label" style={{ marginBottom: 6 }}>{crumb}</div>
      <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>{title}</h1>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function FormPanel({ children, onSubmit }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)" }}>
      <form onSubmit={onSubmit} style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>{children}</form>
    </div>
  );
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
      <div>{left}</div><div>{right}</div>
    </div>
  );
}

function SidePanel({ title, items, accentColor, accentBg, icon, sectionLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: accentBg, color: accentColor, border: `2px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>{icon}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{title}</div>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom: 12 }}>{sectionLabel}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color, bg, wide }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, gridColumn: wide ? "span 2" : undefined }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: bg ?? C_BG, color: color ?? C_COLOR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

function GradeBadge({ value }) {
  if (value == null) return <span style={{ color: "var(--text-faint)" }}>—</span>;
  const num = parseFloat(value);
  const color = num >= 14 ? "var(--green)" : num >= 10 ? "var(--blue)" : num >= 7 ? "var(--amber)" : "var(--rose)";
  const bg    = num >= 14 ? "var(--green-dim)" : num >= 10 ? "var(--blue-dim)" : num >= 7 ? "var(--amber-dim)" : "var(--rose-dim)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, background: bg, color, fontSize: 13, fontWeight: 700 }}>
      {num.toFixed(2)}/20
    </span>
  );
}

function ApprovalBadge({ approuve, t }) {
  return approuve
    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "var(--green-dim)", color: "var(--green)", fontSize: 11, fontWeight: 600, border: "1px solid rgba(42,117,64,.2)" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} /> {t("common.approved")}
      </span>
    : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "var(--amber-dim)", color: "var(--amber)", fontSize: 11, fontWeight: 600, border: "1px solid rgba(168,100,30,.2)" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--amber)" }} /> {t("common.pending")}
      </span>;
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? C_COLOR : "var(--surface)",
      color: active ? "#fff" : "var(--text-muted)",
      fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, fontWeight: active ? 600 : 400,
      transition: "background .14s, color .14s",
    }}>{label}</button>
  );
}

function NoteCard({ r, onClick, onEdit, onDelete, onToggleApprove, approving, t }) {
  const typeLabel = t(`notes.types.${r.typeDevoir}`) || r.typeDevoir;
  return (
    <div className="person-card" style={{ "--card-top": C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.studentName ?? "—"}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.registrationNumber}</div>
        </div>
        <GradeBadge value={r.valeur} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {r.matiereName && <span style={{ padding: "2px 9px", borderRadius: 999, background: C_BG, color: C_COLOR, fontSize: 11.5, fontWeight: 600, border: `1px solid ${C_COLOR}22` }}>{r.matiereName}</span>}
        {r.typeDevoir && <span style={{ padding: "2px 9px", borderRadius: 999, background: "var(--purple-dim)", color: "var(--purple)", fontSize: 11.5, fontWeight: 600, border: "1px solid var(--purple-dim)" }}>{typeLabel}</span>}
        <ApprovalBadge approuve={r.approuve} t={t} />
      </div>
      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.className && <span>🏫 {r.className}</span>}
          {r.trimestreNom && <span style={{ marginLeft: 8 }}>📅 {r.trimestreNom}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onToggleApprove(r)}
            disabled={approving}
            className={r.approuve ? "btn-ghost" : "btn-primary"}
            style={{ padding: "5px 10px", fontSize: 12 }}
          >
            {approving ? "…" : r.approuve ? t("notes.unapprove") : t("notes.approve")}
          </button>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>{t("common.edit")}</button>
          <button onClick={() => onDelete(r)} className="btn-danger" style={{ padding: "5px 10px", fontSize: 12 }}>{t("common.delete")}</button>
        </div>
      </div>
    </div>
  );
}

function BulletinView({ bulletin, onDownload, downloading, t }) {
  const { studentName, registrationNumber, className, trimestreNom, matieres = [], moyenneGenerale, appreciation } = bulletin;
  const avg = parseFloat(moyenneGenerale);
  const avgColor = avg >= 14 ? "var(--green)" : avg >= 10 ? "var(--blue)" : avg >= 7 ? "var(--amber)" : "var(--rose)";
  const hdrs = t("notes.tableHeaders");

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", background: `linear-gradient(135deg, ${C_COLOR}14 0%, transparent 70%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text)" }}>{studentName}</h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{registrationNumber} · {className} · {trimestreNom}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 4 }}>{t("notes.bulletinAvg")}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: avgColor, fontFamily: "'Instrument Serif', serif" }}>
                {isNaN(avg) ? "—" : avg.toFixed(2)}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>/20</span>
              </div>
              {appreciation && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontStyle: "italic" }}>{appreciation}</div>}
            </div>
            <button onClick={onDownload} disabled={downloading} className="btn-primary" style={{ fontSize: 13, padding: "9px 18px", display: "flex", alignItems: "center", gap: 7 }}>
              {downloading
                ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("notes.downloading")}</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> {t("notes.downloadPdf")}</>
              }
            </button>
          </div>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--surface)" }}>
              {[hdrs.subject, hdrs.coeff, hdrs.d1, hdrs.d2, hdrs.d3, hdrs.exam, hdrs.avgDevoirs, hdrs.avgSubject, hdrs.avgPonderated].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: h === hdrs.subject ? "left" : "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matieres.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--surface)" }}>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--text)" }}>{m.matiereName}</td>
                <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--text-muted)" }}>{m.coefficient ?? "—"}</td>
                {[m.devoir1, m.devoir2, m.devoir3, m.examen, m.moyenneDevoirs, m.moyenneMatiere, m.moyennePonderee].map((v, j) => (
                  <td key={j} style={{ padding: "11px 14px", textAlign: "center" }}>
                    {v != null ? <GradeBadge value={v} /> : <span style={{ color: "var(--text-faint)" }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {matieres.length === 0 && (
        <div className="empty-state" style={{ padding: "40px" }}>
          <span style={{ fontSize: 32 }}>📋</span><p>{t("notes.noSubjects")}</p>
        </div>
      )}
    </div>
  );
}

function BulkSheetTable({ sheet, rows, setRows, onSubmit, submitting, onApproveAll, onUnapproveAll, bulkApproving, t }) {
  const filled = rows.filter(r => r.valeur !== "" && r.valeur != null).length;
  const total  = rows.length;
  const pct    = total ? Math.round((filled / total) * 100) : 0;

  const updateRow = (studentId, key, value) => {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, [key]: value } : r));
  };

  const validateGrade = (v) => {
    if (v === "" || v == null) return true;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 20;
  };

  const hasInvalid = rows.some(r => r.valeur !== "" && r.valeur != null && !validateGrade(r.valeur));

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
      {/* Header strip */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: `linear-gradient(135deg, ${C_COLOR}14 0%, transparent 70%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 6 }}>{t("notes.bulkSheetTitle")}</div>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text)" }}>
              {sheet.matiereName} · {sheet.className}
            </h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              {sheet.trimestreNom} · <strong style={{ color: "var(--text-dim)" }}>{t(`notes.types.${sheet.typeDevoir}`) ?? sheet.typeDevoir}</strong>
            </div>
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)" }}>{t("notes.progress")}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                <span style={{ color: C_COLOR }}>{filled}</span> / {total}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: C_COLOR, borderRadius: 999, transition: "width .25s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", maxHeight: 560 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--surface)", position: "sticky", top: 0, zIndex: 1 }}>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)", width: 44 }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "left",   fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)" }}>{t("notes.tableHeaders.student")}</th>
              <th style={{ padding: "12px 16px", textAlign: "left",   fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)", width: 160 }}>{t("notes.fields.regNumber")}</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)", width: 130 }}>{t("notes.grade")} /20</th>
              <th style={{ padding: "12px 16px", textAlign: "left",   fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)" }}>{t("notes.appreciation")}</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)", width: 90 }}>{t("notes.statusCol")}</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "2px solid var(--border)", width: 110 }}>{t("notes.approvalCol")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const invalid = r.valeur !== "" && r.valeur != null && !validateGrade(r.valeur);
              return (
                <tr key={r.studentId} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--surface)" }}>
                  <td style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "var(--text)" }}>{r.studentName}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.registrationNumber ?? "—"}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    <input
                      type="number" step="0.01" min={0} max={20}
                      value={r.valeur ?? ""}
                      onChange={e => updateRow(r.studentId, "valeur", e.target.value)}
                      placeholder="—"
                      style={{
                        width: 80, padding: "7px 10px", borderRadius: 8,
                        border: `1.5px solid ${invalid ? "var(--rose)" : "var(--border-md)"}`,
                        background: invalid ? "var(--rose-dim)" : "var(--bg-input)",
                        color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13, fontWeight: 600, textAlign: "center", outline: "none",
                        transition: "border-color .14s, background .14s",
                      }}
                    />
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <input
                      type="text"
                      value={r.appreciation ?? ""}
                      onChange={e => updateRow(r.studentId, "appreciation", e.target.value)}
                      placeholder={t("notes.appreciationPlaceholder")}
                      style={{
                        width: "100%", padding: "7px 10px", borderRadius: 8,
                        border: "1.5px solid var(--border-md)", background: "var(--bg-input)",
                        color: "var(--text)", fontFamily: "'Instrument Sans', sans-serif",
                        fontSize: 13, outline: "none",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {r.dejaNote
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "var(--green-dim)", color: "var(--green)", fontSize: 11, fontWeight: 600, border: "1px solid rgba(42,117,64,.2)" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} />
                          {t("notes.savedStatus")}
                        </span>
                      : r.valeur !== "" && r.valeur != null
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "var(--amber-dim)", color: "var(--amber)", fontSize: 11, fontWeight: 600, border: "1px solid rgba(168,100,30,.2)" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--amber)" }} />
                            {t("notes.draftStatus")}
                          </span>
                        : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {r.dejaNote ? <ApprovalBadge approuve={!!r.approuve} t={t} /> : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer action bar */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          {hasInvalid
            ? <span style={{ color: "var(--rose)", fontWeight: 600 }}>⚠️ {t("notes.invalidGrades")}</span>
            : <>{t("notes.bulkHint")}</>
          }
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onUnapproveAll}
            disabled={bulkApproving || submitting}
            className="btn-ghost"
            style={{ padding: "10px 18px" }}
          >
            {bulkApproving ? <><span className="spinner" style={{ width: 13, height: 13 }} /> …</> : <>↩ {t("notes.unapproveAll")}</>}
          </button>
          <button
            onClick={onApproveAll}
            disabled={bulkApproving || submitting}
            className="btn-primary"
            style={{ padding: "10px 18px" }}
          >
            {bulkApproving ? <><span className="spinner" style={{ width: 13, height: 13 }} /> …</> : <>✅ {t("notes.approveAll")}</>}
          </button>
          <button onClick={onSubmit} disabled={submitting || hasInvalid || filled === 0} className="btn-primary" style={{ padding: "10px 24px" }}>
            {submitting
              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("notes.submitting")}</>
              : <>💾 {t("notes.submitAll", { n: filled })}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { t } = useLanguage();
  const toast = useToast();

  const [view, setView] = useState("list");
  const [tab, setTab]   = useState("notes");

  const [students,   setStudents]   = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [matieres,   setMatieres]   = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const [studentNotes,        setStudentNotes]        = useState(null);
  const [studentNotesLoading, setStudentNotesLoading] = useState(false);
  const [filterStudentId,     setFilterStudentId]     = useState("");
  const [filterTrimestreId,   setFilterTrimestreId]   = useState("");
  const [filterType,          setFilterType]          = useState("ALL");
  const [q,                   setQ]                   = useState("");

  const [bulletinStudentId,   setBulletinStudentId]   = useState("");
  const [bulletinTrimestreId, setBulletinTrimestreId] = useState("");
  const [bulletin,            setBulletin]            = useState(null);
  const [bulletinLoading,     setBulletinLoading]     = useState(false);
  const [downloadingPdf,      setDownloadingPdf]      = useState(false);

  const [statsClasseId,    setStatsClasseId]    = useState("");
  const [statsMatiereId,   setStatsMatiereId]   = useState("");
  const [statsTrimestreId, setStatsTrimestreId] = useState("");
  const [statsType,        setStatsType]        = useState("DEVOIR_1");
  const [stats,            setStats]            = useState(null);
  const [statsLoading,     setStatsLoading]     = useState(false);

  // ── Bulk entry state ──
  const [teachers,           setTeachers]           = useState([]);
  const [bulkTeacherId,      setBulkTeacherId]      = useState("");
  const [bulkClasses,        setBulkClasses]        = useState([]);
  const [bulkClassesLoading, setBulkClassesLoading] = useState(false);
  const [bulkClasseId,       setBulkClasseId]       = useState("");
  const [bulkMatieres,       setBulkMatieres]       = useState([]);
  const [bulkMatieresLoading,setBulkMatieresLoading]= useState(false);
  const [bulkMatiereId,      setBulkMatiereId]      = useState("");
  const [bulkTrimestreId,    setBulkTrimestreId]    = useState("");
  const [bulkType,           setBulkType]           = useState("DEVOIR_1");
  const [bulkSheet,          setBulkSheet]          = useState(null);
  const [bulkRows,           setBulkRows]           = useState([]);
  const [bulkLoading,        setBulkLoading]        = useState(false);
  const [bulkSubmitting,     setBulkSubmitting]     = useState(false);
  const [bulkConfirm,        setBulkConfirm]        = useState(false);

  const [selected,     setSelected]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [approvingIds, setApprovingIds] = useState(() => new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkApproveConfirm, setBulkApproveConfirm] = useState(null); // "approve" | "unapprove" | null

  // ── Pending approvals state ──
  const [pendingClasseId,    setPendingClasseId]    = useState("");
  const [pendingTrimestreId, setPendingTrimestreId] = useState("");
  const [pendingNotes,       setPendingNotes]       = useState(null);
  const [pendingLoading,     setPendingLoading]     = useState(false);
  const [pendingApprovingIds,setPendingApprovingIds]= useState(() => new Set());
  const [approvingAllPending,setApprovingAllPending]= useState(false);
  const [approveAllConfirm,  setApproveAllConfirm]  = useState(false);

  const emptyForm = { valeur: "", appreciation: "", dateNote: "", typeDevoir: "", studentId: "", matiereId: "", classeId: "", trimestreId: "" };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState({});
  const set     = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    setMetaLoading(true);
    Promise.allSettled([getStudents(), getClasseNames(), getMatiereNames(), getTeacherNames(), getTrimestreNames()])
      .then(([s, c, m, tch, tr]) => {
        if (s.status === "fulfilled") setStudents(Array.isArray(s.value) ? s.value : s.value?.content ?? []);
        if (c.status === "fulfilled") setClasses(Array.isArray(c.value) ? c.value : c.value?.content ?? []);
        if (m.status === "fulfilled") setMatieres(Array.isArray(m.value) ? m.value : []);
        if (tch.status === "fulfilled") setTeachers(Array.isArray(tch.value) ? tch.value : []);
        if (tr.status === "fulfilled") setTrimestres(Array.isArray(tr.value) ? tr.value : []);
      }).finally(() => setMetaLoading(false));
  }, []);

  const studentLabel = s => `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() || `ID ${s.id}`;

  const fetchStudentNotes = async () => {
    if (!filterStudentId) { toast(t("notes.fillAllFields"), "error"); return; }
    setStudentNotesLoading(true);
    try {
      const result = filterTrimestreId
        ? await getNotesByStudentAndTrimestre(filterStudentId, filterTrimestreId)
        : await getNotesByStudent(filterStudentId);
      setStudentNotes(Array.isArray(result) ? result : []);
    } catch (e) { toast(e.message, "error"); setStudentNotes([]); }
    finally { setStudentNotesLoading(false); }
  };

  useEffect(() => { setStudentNotes(null); }, [filterStudentId, filterTrimestreId]);

  const filtered = useMemo(() => {
    let arr = studentNotes ?? [];
    if (filterType !== "ALL") arr = arr.filter(r => r.typeDevoir === filterType);
    if (q.trim()) {
      const lq = q.toLowerCase();
      arr = arr.filter(r => r.studentName?.toLowerCase().includes(lq) || r.matiereName?.toLowerCase().includes(lq) || r.className?.toLowerCase().includes(lq));
    }
    return arr;
  }, [studentNotes, filterType, q]);

  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await createNote({ valeur: parseFloat(form.valeur), appreciation: form.appreciation || undefined, dateNote: form.dateNote || undefined, typeDevoir: form.typeDevoir, studentId: parseInt(form.studentId), matiereId: parseInt(form.matiereId), classeId: parseInt(form.classeId), trimestreId: parseInt(form.trimestreId) });
      setForm(emptyForm); toast(t("notes.added")); goList();
      if (filterStudentId === form.studentId) fetchStudentNotes();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const openEdit = r => { setEditForm({ valeur: r.valeur ?? "", appreciation: r.appreciation ?? "", dateNote: r.dateNote ?? "", typeDevoir: r.typeDevoir ?? "" }); setSelected(r); setView("edit"); };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await updateNote(selected.id, { valeur: parseFloat(editForm.valeur), appreciation: editForm.appreciation || undefined, dateNote: editForm.dateNote || undefined, typeDevoir: editForm.typeDevoir, studentId: selected.studentId, matiereId: selected.matiereId, classeId: selected.classeId, trimestreId: selected.trimestreId });
      toast(t("notes.updated")); goList(); fetchStudentNotes();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteNote(deleteTarget.id); setDeleteTarget(null); toast(t("notes.deleted")); if (view !== "list") goList(); fetchStudentNotes(); }
    catch (err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  const patchNoteEverywhere = (id, patch) => {
    setStudentNotes(prev => Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, ...patch } : n) : prev);
    setSelected(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
  };

  const handleToggleApprove = async (note) => {
    const nextApprouve = !note.approuve;
    setApprovingIds(prev => new Set(prev).add(note.id));
    try {
      const updated = await approveNote(note.id, nextApprouve);
      patchNoteEverywhere(note.id, { approuve: updated?.approuve ?? nextApprouve });
      toast(nextApprouve ? t("notes.approved") : t("notes.unapproved"));
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setApprovingIds(prev => { const n = new Set(prev); n.delete(note.id); return n; });
    }
  };

  // ── Pending approvals ──
  useEffect(() => { setPendingTrimestreId(""); setPendingNotes(null); }, [pendingClasseId]);
  useEffect(() => { setPendingNotes(null); }, [pendingTrimestreId]);

  const fetchPendingNotes = async () => {
    setPendingLoading(true); setPendingNotes(null);
    try {
      let data;
      if (pendingClasseId && pendingTrimestreId) data = await getPendingNotesByClasseAndTrimestre(pendingClasseId, pendingTrimestreId);
      else if (pendingClasseId) data = await getPendingNotesByClasse(pendingClasseId);
      else data = await getPendingNotes();
      setPendingNotes(Array.isArray(data) ? data : []);
    } catch (e) { toast(e.message, "error"); setPendingNotes([]); }
    finally { setPendingLoading(false); }
  };

  const approvePendingNote = async (note) => {
    setPendingApprovingIds(prev => new Set(prev).add(note.id));
    try {
      await approveNote(note.id, true);
      setPendingNotes(prev => Array.isArray(prev) ? prev.filter(n => n.id !== note.id) : prev);
      toast(t("notes.approved"));
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setPendingApprovingIds(prev => { const n = new Set(prev); n.delete(note.id); return n; });
    }
  };

  const approveAllPending = async () => {
    setApproveAllConfirm(false);
    if (!pendingNotes || pendingNotes.length === 0) return;
    setApprovingAllPending(true);

    // Pending notes only carry names (className/matiereName/trimestreNom), but the
    // bulk endpoint needs numeric ids — resolve them from the already-loaded lookup lists.
    const classIdByName    = new Map(classes.map(c => [c.name, c.id]));
    const matiereIdByName  = new Map(matieres.map(m => [m.name, m.id]));
    const trimestreIdByNom = new Map(trimestres.map(tr => [tr.nom, tr.id]));

    const groups  = new Map(); // "classeId|matiereId|trimestreId|typeDevoir" -> { classeId, matiereId, trimestreId, typeDevoir, ids: Set }
    const singles = [];        // notes we can't resolve to a full id set — fall back to single-approve

    for (const n of pendingNotes) {
      const classeId     = classIdByName.get(n.className);
      const matiereId    = matiereIdByName.get(n.matiereName);
      const trimestreId  = trimestreIdByNom.get(n.trimestreNom);
      if (classeId == null || matiereId == null || trimestreId == null || !n.typeDevoir) {
        singles.push(n);
        continue;
      }
      const key = `${classeId}|${matiereId}|${trimestreId}|${n.typeDevoir}`;
      if (!groups.has(key)) groups.set(key, { classeId, matiereId, trimestreId, typeDevoir: n.typeDevoir, ids: new Set() });
      groups.get(key).ids.add(n.id);
    }

    const failedIds = new Set();

    // One bulk call per distinct (class, subject, trimestre, type) combination.
    await Promise.all(Array.from(groups.values()).map(async g => {
      try {
        await bulkApproveNotes({ approuve: true, classeId: g.classeId, matiereId: g.matiereId, trimestreId: g.trimestreId, typeDevoir: g.typeDevoir });
      } catch (e) {
        g.ids.forEach(id => failedIds.add(id));
      }
    }));

    // Anything we couldn't group (missing id lookup) still gets approved individually.
    const singleResults = await Promise.allSettled(singles.map(n => approveNote(n.id, true)));
    singleResults.forEach((res, i) => { if (res.status === "rejected") failedIds.add(singles[i].id); });

    setPendingNotes(prev => Array.isArray(prev) ? prev.filter(n => failedIds.has(n.id)) : prev);
    setApprovingAllPending(false);
    const okCount = pendingNotes.length - failedIds.size;
    if (failedIds.size === 0) toast(t("notes.bulkApproved", { n: okCount }));
    else toast(`${okCount} approved, ${failedIds.size} failed`, "error");
  };

  const fetchBulletin = async () => {
    if (!bulletinStudentId || !bulletinTrimestreId) { toast(t("notes.selectStudentTrimestre"), "error"); return; }
    setBulletinLoading(true); setBulletin(null);
    try { setBulletin(await getBulletin(bulletinStudentId, bulletinTrimestreId)); }
    catch (e) { toast(e.message, "error"); } finally { setBulletinLoading(false); }
  };

  const handleDownloadPdf = async () => {
    if (!bulletinStudentId || !bulletinTrimestreId) return;
    setDownloadingPdf(true);
    try {
      const blob = await getBulletinPdf(bulletinStudentId, bulletinTrimestreId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `bulletin_${bulletinStudentId}_trimestre_${bulletinTrimestreId}.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) { toast(e.message, "error"); } finally { setDownloadingPdf(false); }
  };

  const fetchStats = async () => {
    if (!statsClasseId || !statsMatiereId || !statsTrimestreId) { toast(t("notes.fillAllFields"), "error"); return; }
    setStatsLoading(true); setStats(null);
    try { setStats(await getClasseStats(statsClasseId, statsMatiereId, statsTrimestreId, statsType)); }
    catch (e) { toast(e.message, "error"); } finally { setStatsLoading(false); }
  };

  // ── Bulk entry handlers ──
  useEffect(() => {
    setBulkClasseId(""); setBulkClasses([]); setBulkMatieres([]); setBulkMatiereId("");
    setBulkSheet(null); setBulkRows([]);
    if (!bulkTeacherId) return;
    setBulkClassesLoading(true);
    getClassesByTeacher(bulkTeacherId)
      .then(d => setBulkClasses(Array.isArray(d) ? d : []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setBulkClassesLoading(false));
  }, [bulkTeacherId]);

  useEffect(() => {
    setBulkMatiereId(""); setBulkMatieres([]);
    setBulkSheet(null); setBulkRows([]);
    if (!bulkTeacherId || !bulkClasseId) return;
    setBulkMatieresLoading(true);
    getMatieresByTeacherAndClasse(bulkTeacherId, bulkClasseId)
      .then(d => setBulkMatieres(Array.isArray(d) ? d : []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setBulkMatieresLoading(false));
  }, [bulkTeacherId, bulkClasseId]);

  // Clear sheet when any filter changes
  useEffect(() => { setBulkSheet(null); setBulkRows([]); }, [bulkMatiereId, bulkTrimestreId, bulkType]);

  const fetchBulkSheet = async () => {
    if (!bulkTeacherId || !bulkClasseId || !bulkMatiereId || !bulkTrimestreId || !bulkType) {
      toast(t("notes.fillAllFields"), "error"); return;
    }
    setBulkLoading(true); setBulkSheet(null); setBulkRows([]);
    try {
      const data = await getNoteSheet(bulkTeacherId, {
        trimestreId: parseInt(bulkTrimestreId),
        typeDevoir: bulkType,
        matiereId: parseInt(bulkMatiereId),
        classeId: parseInt(bulkClasseId),
      });
      setBulkSheet(data);
      const studentsArr = Array.isArray(data?.students) ? data.students : [];
      setBulkRows(studentsArr.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        registrationNumber: s.registrationNumber,
        valeur: s.valeur ?? "",
        appreciation: s.appreciation ?? "",
        dejaNote: !!s.dejaNote,
        approuve: !!s.approuve,
      })));
    } catch (e) { toast(e.message, "error"); }
    finally { setBulkLoading(false); }
  };

  const submitBulkSheet = async () => {
    setBulkConfirm(false); setBulkSubmitting(true);
    try {
      const notes = bulkRows
        .filter(r => r.valeur !== "" && r.valeur != null)
        .map(r => ({
          studentId: r.studentId,
          studentName: r.studentName,
          registrationNumber: r.registrationNumber,
          valeur: parseFloat(r.valeur),
          appreciation: r.appreciation || undefined,
        }));
      if (notes.length === 0) { toast(t("notes.noGradesEntered"), "error"); return; }
      await submitNoteSheet(bulkTeacherId, {
        trimestreId: parseInt(bulkTrimestreId),
        typeDevoir: bulkType,
        matiereId: parseInt(bulkMatiereId),
        classeId: parseInt(bulkClasseId),
        notes,
      });
      toast(t("notes.bulkSaved", { n: notes.length }));
      // Refresh the sheet so dejaNote flags update
      await fetchBulkSheet();
    } catch (e) { toast(e.message, "error"); }
    finally { setBulkSubmitting(false); }
  };

  const runBulkApprove = async (approuve) => {
    setBulkApproveConfirm(null);
    if (!bulkClasseId || !bulkMatiereId || !bulkTrimestreId || !bulkType) {
      toast(t("notes.fillAllFields"), "error"); return;
    }
    setBulkApproving(true);
    try {
      const updatedList = await bulkApproveNotes({
        approuve,
        classeId: parseInt(bulkClasseId),
        matiereId: parseInt(bulkMatiereId),
        trimestreId: parseInt(bulkTrimestreId),
        typeDevoir: bulkType,
      });
      const byStudent = new Map((Array.isArray(updatedList) ? updatedList : []).map(n => [n.studentId ?? n.id, n]));
      // Match on studentId when present; fall back to note id lookup via registrationNumber as safety net.
      setBulkRows(prev => prev.map(r => {
        const match = (Array.isArray(updatedList) ? updatedList : []).find(n => n.registrationNumber === r.registrationNumber && n.studentName === r.studentName);
        return match ? { ...r, approuve: match.approuve, dejaNote: true } : r;
      }));
      toast(approuve
        ? t("notes.bulkApproved", { n: updatedList?.length ?? 0 })
        : t("notes.bulkUnapproved", { n: updatedList?.length ?? 0 }));
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBulkApproving(false);
    }
  };

  const typeOptions = TYPE_OPTIONS.map(tp => (
    <option key={tp} value={tp}>{t(`notes.types.${tp}`)}</option>
  ));

  /* ── CREATE ── */
  if (view === "create") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("notes.detailBack")} onClick={goList} />
      <PageTitle crumb={t("notes.crumb")} title={t("notes.addTitle")} sub={t("notes.addSub")} />
      <TwoCol
        left={<FormPanel onSubmit={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("notes.student")}>
              <Select value={form.studentId} onChange={set("studentId")} required>
                <option value="">{t("notes.selectStudent")}</option>
                {students.map(s => <option key={s.id} value={s.id}>{studentLabel(s)}</option>)}
              </Select>
            </Field>
            <Field label={t("notes.class")}>
              <Select value={form.classeId} onChange={set("classeId")} required>
                <option value="">{t("notes.selectClass")}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("notes.subject")}>
              <Select value={form.matiereId} onChange={set("matiereId")} required>
                <option value="">{t("notes.selectSubject")}</option>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            <Field label={t("notes.trimestre")}>
              <Select value={form.trimestreId} onChange={set("trimestreId")} required>
                <option value="">{t("notes.selectTrimestre")}</option>
                {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("notes.type")}>
              <Select value={form.typeDevoir} onChange={set("typeDevoir")} required>
                <option value="">{t("notes.selectType")}</option>
                {typeOptions}
              </Select>
            </Field>
            <Field label={t("notes.grade")} hint={t("notes.gradeHint")}>
              <Input type="number" step="0.01" min={0} max={20} placeholder={t("notes.gradePlaceholder")} value={form.valeur} onChange={set("valeur")} required />
            </Field>
          </div>
          <Field label={t("notes.appreciation")} hint={t("notes.appreciationHint")}>
            <Input placeholder={t("notes.appreciationPlaceholder")} value={form.appreciation} onChange={set("appreciation")} />
          </Field>
          <Field label={t("notes.date")}>
            <Input type="date" value={form.dateNote} onChange={set("dateNote")} />
          </Field>
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
            <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("notes.saveNoteBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel icon="📝" accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          title={t("notes.sideNote")}
          items={[{ icon: "🔢", text: t("notes.sideNote1") }, { icon: "📅", text: t("notes.sideNote2") }, { icon: "📐", text: t("notes.sideNote3") }, { icon: "📋", text: t("notes.sideNote4") }]} />}
      />
    </div>
  );

  /* ── EDIT ── */
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("notes.detailBack")} onClick={goList} />
      <PageTitle crumb={t("notes.crumb")} title={t("notes.editTitle")} sub={t("notes.editSub", { name: selected.studentName ?? "student" })} />
      <TwoCol
        left={<FormPanel onSubmit={handleEdit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={t("notes.type")}>
              <Select value={editForm.typeDevoir} onChange={setEdit("typeDevoir")} required>
                <option value="">{t("notes.selectType")}</option>
                {typeOptions}
              </Select>
            </Field>
            <Field label={t("notes.grade")}>
              <Input type="number" step="0.01" min={0} max={20} value={editForm.valeur} onChange={setEdit("valeur")} required />
            </Field>
          </div>
          <Field label={t("notes.appreciation")}>
            <Input placeholder={t("notes.appreciationPlaceholder")} value={editForm.appreciation} onChange={setEdit("appreciation")} />
          </Field>
          <Field label={t("notes.date")}>
            <Input type="date" value={editForm.dateNote} onChange={setEdit("dateNote")} />
          </Field>
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
            <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("notes.saveBtn")} /></div>
          </div>
        </FormPanel>}
        right={<SidePanel icon="✏️" accentColor={C_COLOR} accentBg={C_BG} sectionLabel={t("common.notes")}
          title={`${t(`notes.types.${selected.typeDevoir}`) ?? selected.typeDevoir} — ${selected.studentName}`}
          items={[{ icon: "💡", text: t("notes.editNote1") }, { icon: "🔢", text: t("notes.editNote2") }]} />}
      />
    </div>
  );

  /* ── DETAIL ── */
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding: "36px 44px" }}>
        <BackBtn label={t("notes.detailBack")} onClick={goList} />
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: 90, background: `linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding: "0 36px 28px", marginTop: -36 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: C_BG, color: C_COLOR, border: "3px solid var(--bg-card)", boxShadow: `0 0 0 2px ${C_COLOR}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>📝</div>
                <div style={{ paddingBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.025em" }}>{v.studentName ?? "—"}</h2>
                  <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                    {v.typeDevoir && <span style={{ padding: "3px 11px", borderRadius: 999, background: "var(--purple-dim)", color: "var(--purple)", fontSize: 12, fontWeight: 600, border: "1px solid var(--purple-dim)" }}>{t(`notes.types.${v.typeDevoir}`) ?? v.typeDevoir}</span>}
                    <GradeBadge value={v.valeur} />
                    <ApprovalBadge approuve={v.approuve} t={t} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleToggleApprove(v)}
                  disabled={approvingIds.has(v.id)}
                  className={v.approuve ? "btn-ghost" : "btn-primary"}
                  style={{ padding: "10px 20px" }}
                >
                  {approvingIds.has(v.id) ? "…" : v.approuve ? `↩ ${t("notes.unapprove")}` : `✅ ${t("notes.approve")}`}
                </button>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding: "10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding: "10px 20px" }}>🗑 {t("common.delete")}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <StatBox icon="🎓" label={t("notes.fields.student")}      value={v.studentName} />
          <StatBox icon="📐" label={t("notes.fields.subject")}      value={v.matiereName} />
          <StatBox icon="🏫" label={t("notes.fields.class")}        value={v.className} />
          <StatBox icon="📅" label={t("notes.fields.trimestre")}    value={v.trimestreNom} />
          <StatBox icon="📋" label={t("notes.fields.type")}         value={t(`notes.types.${v.typeDevoir}`) ?? v.typeDevoir} />
          <StatBox icon="📝" label={t("notes.fields.appreciation")} value={v.appreciation} />
          {v.dateNote && <StatBox icon="🗓" label={t("notes.fields.date")} value={v.dateNote} />}
          <StatBox icon="🪪" label={t("notes.fields.regNumber")}    value={v.registrationNumber} />
          <StatBox icon={v.approuve ? "✅" : "⏳"} label={t("notes.statusCol")} value={v.approuve ? t("common.approved") : t("notes.pendingApproval")} />
        </div>
        {deleteTarget && <ConfirmDialog title={t("notes.deleteTitle")} message={t("notes.deleteDetailMsg", { name: deleteTarget.studentName })} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <PageTitle crumb={t("notes.crumb")} title={t("notes.title")} sub={t("notes.subtitle")} />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom: 32 }}>{t("notes.addBtn")}</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        <Tab label={t("notes.tabNotes")}    active={tab === "notes"}    onClick={() => setTab("notes")} />
        <Tab label={t("notes.tabPending")} active={tab === "pending"} onClick={() => setTab("pending")} />
        <Tab label={t("notes.tabBulk")}     active={tab === "bulk"}     onClick={() => setTab("bulk")} />
        <Tab label={t("notes.tabBulletin")} active={tab === "bulletin"} onClick={() => setTab("bulletin")} />
        <Tab label={t("notes.tabStats")}    active={tab === "stats"}    onClick={() => setTab("stats")} />
      </div>

      {metaLoading && <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("common.loading")}</p></div>}

      {/* ══ NOTES TAB ══ */}
      {!metaLoading && tab === "notes" && (
        <>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label className="field-label">{t("notes.student")}</label>
              <select className="t-select" value={filterStudentId} onChange={e => setFilterStudentId(e.target.value)}>
                <option value="">{t("notes.selectStudent")}</option>
                {students.map(s => <option key={s.id} value={s.id}>{studentLabel(s)}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label className="field-label">{t("notes.trimestreOptional")}</label>
              <select className="t-select" value={filterTrimestreId} onChange={e => setFilterTrimestreId(e.target.value)}>
                <option value="">{t("notes.allTrimestres")}</option>
                {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
              </select>
            </div>
            <button onClick={fetchStudentNotes} disabled={!filterStudentId || studentNotesLoading} className="btn-primary" style={{ padding: "10px 22px", alignSelf: "flex-end" }}>
              {studentNotesLoading ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : t("notes.loadNotes")}
            </button>
          </div>

          {studentNotes !== null && (
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div className="search-wrap" style={{ flex: "0 0 260px" }}>
                <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search-input" placeholder={t("notes.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="t-select" style={{ width: "auto", minWidth: 150, fontSize: 13 }}>
                <option value="ALL">{t("notes.allTypes")}</option>
                {typeOptions}
              </select>
            </div>
          )}

          {studentNotes === null ? (
            <div className="empty-state"><span style={{ fontSize: 40 }}>📝</span><p>{t("notes.empty")}</p></div>
          ) : studentNotesLoading ? (
            <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("common.loading")}</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><span style={{ fontSize: 36 }}>📭</span><p>{q ? t("notes.noResults", { q }) : t("notes.noNotes")}</p></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((r, i) => (
                <NoteCard
                  key={r.id ?? i}
                  r={r}
                  t={t}
                  approving={approvingIds.has(r.id)}
                  onToggleApprove={handleToggleApprove}
                  onClick={r => { setSelected(r); setView("detail"); }}
                  onEdit={openEdit}
                  onDelete={target => setDeleteTarget(target)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ PENDING APPROVALS TAB ══ */}
      {!metaLoading && tab === "pending" && (
        <>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label className="field-label">{t("notes.class")} <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>({t("common.optional")})</span></label>
              <select className="t-select" value={pendingClasseId} onChange={e => setPendingClasseId(e.target.value)}>
                <option value="">{t("notes.allClasses")}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label className="field-label">{t("notes.trimestreOptional")}</label>
              <select className="t-select" value={pendingTrimestreId} onChange={e => setPendingTrimestreId(e.target.value)} disabled={!pendingClasseId}>
                <option value="">{!pendingClasseId ? t("notes.pickClassFirst") : t("notes.allTrimestres")}</option>
                {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
              </select>
            </div>
            <button onClick={fetchPendingNotes} disabled={pendingLoading} className="btn-primary" style={{ padding: "10px 22px", alignSelf: "flex-end" }}>
              {pendingLoading ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : <>🔍 {t("notes.loadPending")}</>}
            </button>
          </div>

          {pendingNotes === null ? (
            !pendingLoading && <div className="empty-state"><span style={{ fontSize: 40 }}>⏳</span><p>{t("notes.pendingEmpty")}</p></div>
          ) : pendingLoading ? null : pendingNotes.length === 0 ? (
            <div className="empty-state"><span style={{ fontSize: 36 }}>🎉</span><p>{t("notes.pendingNone")}</p></div>
          ) : (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text)" }}>{pendingNotes.length}</strong> {t("notes.pendingCount")}
                </div>
                <button onClick={() => setApproveAllConfirm(true)} disabled={approvingAllPending} className="btn-primary" style={{ padding: "9px 18px" }}>
                  {approvingAllPending
                    ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("notes.submitting")}</>
                    : <>✅ {t("notes.approveAllPending", { n: pendingNotes.length })}</>
                  }
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      {[t("notes.tableHeaders.student"), t("notes.fields.regNumber"), t("notes.subject"), t("notes.class"), t("notes.trimestre"), t("notes.type"), t("notes.grade"), ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: i === 0 ? "left" : "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingNotes.map((n, i) => (
                      <tr key={n.id ?? i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--surface)" }}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--text)" }}>{n.studentName ?? "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{n.registrationNumber ?? "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>{n.matiereName ?? "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>{n.className ?? "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>{n.trimestreNom ?? "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>{t(`notes.types.${n.typeDevoir}`) ?? n.typeDevoir}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}><GradeBadge value={n.valeur} /></td>
                        <td style={{ padding: "8px 14px", textAlign: "center" }}>
                          <button
                            onClick={() => approvePendingNote(n)}
                            disabled={pendingApprovingIds.has(n.id) || approvingAllPending}
                            className="btn-primary"
                            style={{ padding: "6px 14px", fontSize: 12 }}
                          >
                            {pendingApprovingIds.has(n.id) ? "…" : `✅ ${t("notes.approve")}`}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {approveAllConfirm && (
            <ConfirmDialog
              variant="primary"
              title={t("notes.approveAllPendingTitle")}
              message={t("notes.approveAllPendingMsg", { n: pendingNotes?.length ?? 0 })}
              confirmLabel={t("notes.approveAll")}
              loadingLabel={t("notes.submitting")}
              cancelLabel={t("common.cancel")}
              onConfirm={approveAllPending}
              onCancel={() => setApproveAllConfirm(false)}
              loading={approvingAllPending}
            />
          )}
        </>
      )}

      {/* ══ BULK ENTRY TAB ══ */}
      {!metaLoading && tab === "bulk" && (
        <>
          {/* Filter card with cascading selectors */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: C_BG, color: C_COLOR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t("notes.bulkFilterTitle")}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{t("notes.bulkFilterSub")}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, alignItems: "flex-end" }}>
              <div>
                <label className="field-label">{t("notes.teacher")}</label>
                <select className="t-select" value={bulkTeacherId} onChange={e => setBulkTeacherId(e.target.value)}>
                  <option value="">{t("notes.selectTeacher")}</option>
                  {teachers.map(tch => <option key={tch.id} value={tch.id}>{tch.speciality ? `#${tch.id} · ${tch.speciality}` : `#${tch.id}`}{tch.phone ? ` · ${tch.phone}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">{t("notes.class")}</label>
                <select className="t-select" value={bulkClasseId} onChange={e => setBulkClasseId(e.target.value)} disabled={!bulkTeacherId || bulkClassesLoading}>
                  <option value="">
                    {!bulkTeacherId       ? t("notes.pickTeacherFirst")
                     : bulkClassesLoading ? t("common.loading")
                     : bulkClasses.length === 0 ? t("notes.noAssignedClasses")
                     : t("notes.selectClass")}
                  </option>
                  {bulkClasses.map(c => <option key={c.id} value={c.id}>{c.name}{c.levelName ? ` — ${c.levelName}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">{t("notes.subject")}</label>
                <select className="t-select" value={bulkMatiereId} onChange={e => setBulkMatiereId(e.target.value)} disabled={!bulkClasseId || bulkMatieresLoading}>
                  <option value="">
                    {!bulkClasseId          ? t("notes.pickClassFirst")
                     : bulkMatieresLoading  ? t("common.loading")
                     : bulkMatieres.length === 0 ? t("notes.noAssignedSubjects")
                     : t("notes.selectSubject")}
                  </option>
                  {bulkMatieres.map(m => <option key={m.id} value={m.id}>{m.name}{m.coefficient ? ` (×${m.coefficient})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">{t("notes.trimestre")}</label>
                <select className="t-select" value={bulkTrimestreId} onChange={e => setBulkTrimestreId(e.target.value)}>
                  <option value="">{t("notes.selectTrimestre")}</option>
                  {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">{t("notes.type")}</label>
                <select className="t-select" value={bulkType} onChange={e => setBulkType(e.target.value)}>
                  {typeOptions}
                </select>
              </div>
              <button
                onClick={fetchBulkSheet}
                disabled={!bulkTeacherId || !bulkClasseId || !bulkMatiereId || !bulkTrimestreId || bulkLoading}
                className="btn-primary"
                style={{ padding: "10px 22px", alignSelf: "flex-end", height: 41 }}
              >
                {bulkLoading
                  ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</>
                  : <>📥 {t("notes.loadSheet")}</>
                }
              </button>
            </div>
            {bulkSheet && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-muted)" }}>
                <span>👥 <strong style={{ color: "var(--text-dim)" }}>{bulkSheet.totalStudents ?? 0}</strong> {t("notes.studentsInClass")}</span>
                <span>✅ <strong style={{ color: "var(--text-dim)" }}>{bulkSheet.notesSaisies ?? 0}</strong> {t("notes.alreadyGraded")}</span>
              </div>
            )}
          </div>

          {/* Sheet table */}
          {bulkLoading ? (
            <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("notes.loadingSheet")}</p></div>
          ) : bulkSheet === null ? (
            <div className="empty-state">
              <span style={{ fontSize: 40 }}>📝</span>
              <p>{t("notes.bulkEmpty")}</p>
            </div>
          ) : bulkRows.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 36 }}>📭</span>
              <p>{t("notes.bulkNoStudents")}</p>
            </div>
          ) : (
            <BulkSheetTable
              sheet={bulkSheet}
              rows={bulkRows}
              setRows={setBulkRows}
              onSubmit={() => setBulkConfirm(true)}
              submitting={bulkSubmitting}
              bulkApproving={bulkApproving}
              onApproveAll={() => setBulkApproveConfirm("approve")}
              onUnapproveAll={() => setBulkApproveConfirm("unapprove")}
              t={t}
            />
          )}

          {bulkApproveConfirm && (
            <ConfirmDialog
              variant="primary"
              title={bulkApproveConfirm === "approve" ? t("notes.bulkApproveTitle") : t("notes.bulkUnapproveTitle")}
              message={bulkApproveConfirm === "approve"
                ? t("notes.bulkApproveMsg", { subject: bulkSheet?.matiereName ?? "", classe: bulkSheet?.className ?? "" })
                : t("notes.bulkUnapproveMsg", { subject: bulkSheet?.matiereName ?? "", classe: bulkSheet?.className ?? "" })}
              confirmLabel={bulkApproveConfirm === "approve" ? t("notes.approveAll") : t("notes.unapproveAll")}
              loadingLabel={t("notes.submitting")}
              cancelLabel={t("common.cancel")}
              onConfirm={() => runBulkApprove(bulkApproveConfirm === "approve")}
              onCancel={() => setBulkApproveConfirm(null)}
              loading={bulkApproving}
            />
          )}

          {bulkConfirm && (
            <ConfirmDialog
              variant="primary"
              title={t("notes.bulkConfirmTitle")}
              message={t("notes.bulkConfirmMsg", { n: bulkRows.filter(r => r.valeur !== "" && r.valeur != null).length })}
              confirmLabel={t("notes.bulkConfirmBtn")}
              loadingLabel={t("notes.submitting")}
              cancelLabel={t("common.cancel")}
              onConfirm={submitBulkSheet}
              onCancel={() => setBulkConfirm(false)}
              loading={bulkSubmitting}
            />
          )}
        </>
      )}

      {/* ══ BULLETIN TAB ══ */}
      {!metaLoading && tab === "bulletin" && (
        <>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label className="field-label">{t("notes.student")}</label>
              <select className="t-select" value={bulletinStudentId} onChange={e => setBulletinStudentId(e.target.value)}>
                <option value="">{t("notes.selectStudent")}</option>
                {students.map(s => <option key={s.id} value={s.id}>{studentLabel(s)}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label className="field-label">{t("notes.trimestre")}</label>
              <select className="t-select" value={bulletinTrimestreId} onChange={e => setBulletinTrimestreId(e.target.value)}>
                <option value="">{t("notes.selectTrimestre")}</option>
                {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
              </select>
            </div>
            <button onClick={fetchBulletin} disabled={!bulletinStudentId || !bulletinTrimestreId || bulletinLoading} className="btn-primary" style={{ padding: "10px 22px", alignSelf: "flex-end" }}>
              {bulletinLoading ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : t("notes.viewBulletin")}
            </button>
          </div>
          {bulletin
            ? <BulletinView bulletin={bulletin} onDownload={handleDownloadPdf} downloading={downloadingPdf} t={t} />
            : <div className="empty-state"><span style={{ fontSize: 40 }}>📊</span><p>{t("notes.bulletinEmpty")}</p></div>
          }
        </>
      )}

      {/* ══ STATS TAB ══ */}
      {!metaLoading && tab === "stats" && (
        <>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 160px" }}>
              <label className="field-label">{t("notes.class")}</label>
              <select className="t-select" value={statsClasseId} onChange={e => setStatsClasseId(e.target.value)}>
                <option value="">{t("notes.selectClass")}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label className="field-label">{t("notes.subject")}</label>
              <select className="t-select" value={statsMatiereId} onChange={e => setStatsMatiereId(e.target.value)}>
                <option value="">{t("notes.selectSubject")}</option>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label className="field-label">{t("notes.trimestre")}</label>
              <select className="t-select" value={statsTrimestreId} onChange={e => setStatsTrimestreId(e.target.value)}>
                <option value="">{t("notes.selectTrimestre")}</option>
                {trimestres.map(tr => <option key={tr.id} value={tr.id}>{tr.nom}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label className="field-label">{t("notes.type")}</label>
              <select className="t-select" value={statsType} onChange={e => setStatsType(e.target.value)}>
                {typeOptions}
              </select>
            </div>
            <button onClick={fetchStats} disabled={!statsClasseId || !statsMatiereId || !statsTrimestreId || statsLoading} className="btn-primary" style={{ padding: "10px 22px", alignSelf: "flex-end" }}>
              {statsLoading ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : t("notes.getStats")}
            </button>
          </div>

          {stats ? (
            <div>
              <div style={{ marginBottom: 16, fontSize: 14, color: "var(--text-muted)" }}>
                {stats.className} · {stats.matiereName} · {stats.trimestreNom} · <strong style={{ color: "var(--text)" }}>{t(`notes.types.${stats.typeDevoir}`) ?? stats.typeDevoir}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                <StatBox icon="📊" label={t("notes.classAvg")}      value={stats.moyenneClasse != null ? `${parseFloat(stats.moyenneClasse).toFixed(2)}/20` : null} color="var(--blue)"   bg="var(--blue-dim)" />
                <StatBox icon="⬆️" label={t("notes.highest")}       value={stats.noteMax != null ? `${parseFloat(stats.noteMax).toFixed(2)}/20` : null}             color="var(--green)"  bg="var(--green-dim)" />
                <StatBox icon="⬇️" label={t("notes.lowest")}        value={stats.noteMin != null ? `${parseFloat(stats.noteMin).toFixed(2)}/20` : null}             color="var(--rose)"   bg="var(--rose-dim)" />
                <StatBox icon="👥" label={t("notes.totalStudents")} value={stats.totalEleves}                                                                        color="var(--violet)" bg="var(--violet-dim)" />
                <StatBox icon="✅" label={t("notes.entered")}       value={stats.elevesSaisis != null ? `${stats.elevesSaisis} / ${stats.totalEleves}` : null}       color="var(--teal)"   bg="var(--teal-dim)" />
              </div>
            </div>
          ) : (
            <div className="empty-state"><span style={{ fontSize: 40 }}>📈</span><p>{t("notes.statsEmpty")}</p></div>
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("notes.deleteTitle")}
          message={t("notes.deleteDetailMsg", { name: deleteTarget.studentName })}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}