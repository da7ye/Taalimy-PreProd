import { useState, useMemo, useEffect } from "react";
import { getStudents, payStudent, getPaymentsByStudent, getPaymentReceipt } from "../api";
import { Field, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import { useLanguage } from "../LanguageContext";

const MONTHS = [
  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
];

const C_COLOR = "var(--green)";
const C_BG    = "var(--green-dim)";

function TabBar({ active, onChange, t }) {
  const TABS = [
    { id: "pay",     label: t("payments.tabPay") },
    { id: "history", label: t("payments.tabHistory") },
  ];
  return (
    <div style={{ display: "flex", gap: 4, padding: 5, borderRadius: "var(--r-lg)", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", width: "fit-content", marginBottom: 28 }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            padding: "8px 20px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer",
            background: isActive ? "var(--accent)" : "transparent",
            color: isActive ? "#fff" : "var(--text-muted)",
            fontSize: 13, fontWeight: isActive ? 600 : 400,
            fontFamily: "'Instrument Sans', sans-serif",
            boxShadow: isActive ? "0 2px 8px var(--accent-glow)" : "none",
            transition: "all .15s",
          }}>{tab.label}</button>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, t }) {
  const paid = status === "PAID";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 700,
      background: paid ? C_BG : "var(--rose-dim)",
      color: paid ? C_COLOR : "var(--rose)",
      border: `1px solid ${paid ? "rgba(42,117,64,.22)" : "rgba(184,53,53,.22)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: paid ? C_COLOR : "var(--rose)", flexShrink: 0 }} />
      {paid ? t("payments.paid") : t("payments.unpaid")}
    </span>
  );
}

function MonthCalendar({ payments, t }) {
  const payMap = useMemo(() => {
    const m = {};
    (payments || []).forEach(p => { m[p.month] = p; });
    return m;
  }, [payments]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {MONTHS.map(month => {
        const p = payMap[month];
        const paid = p?.statut === "PAID";
        const hasRecord = !!p;
        return (
          <div key={month} style={{
            padding: "14px 16px", borderRadius: "var(--r-md)",
            background: paid ? C_BG : hasRecord ? "var(--rose-dim)" : "var(--surface)",
            border: `1.5px solid ${paid ? "rgba(42,117,64,.25)" : hasRecord ? "rgba(184,53,53,.25)" : "var(--border)"}`,
            transition: "all .15s",
          }}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
              color: paid ? C_COLOR : hasRecord ? "var(--rose)" : "var(--text-faint)", marginBottom: 6,
            }}>{t(`payments.monthsShort.${month}`)}</div>
            {hasRecord ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, color: paid ? C_COLOR : "var(--rose)", fontFamily: "'Instrument Serif', serif" }}>
                  {p.amount?.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400 }}>MRU</span>
                </div>
                <StatusBadge status={p.statut} t={t} />
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{t("payments.noRecord")}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaymentRow({ p, onReceipt, loadingReceipt, t }) {
  const paid = p.statut === "PAID";
  return (
    <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: paid ? C_BG : "var(--rose-dim)", color: paid ? C_COLOR : "var(--rose)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, letterSpacing: ".03em" }}>
        {t(`payments.monthsShort.${p.month}`)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t(`payments.months.${p.month}`)}</span>
          <StatusBadge status={p.statut} t={t} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", padding: "1px 7px", borderRadius: 5, background: "var(--surface)", border: "1px solid var(--border)" }}>#{p.id}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Amount: <strong style={{ color: "var(--text-dim)" }}>{p.amount?.toLocaleString()} MRU</strong>
          {p.classeId && <span style={{ marginLeft: 10, color: "var(--text-faint)" }}>{t("payments.class", { id: p.classeId })}</span>}
        </div>
      </div>
      {paid && (
        <button onClick={() => onReceipt(p.id)} disabled={loadingReceipt === p.id} className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>
          {loadingReceipt === p.id ? <><span className="spinner" style={{ width: 11, height: 11 }} /> {t("common.loading")}</> : t("payments.receipt")}
        </button>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [tab, setTab] = useState("pay");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [form, setForm] = useState({ studentId: "", month: "", amount: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const [histStudentId, setHistStudentId] = useState("");
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoadingStudents(true);
    getStudents()
      .then(s => setStudents(Array.isArray(s) ? s : s?.content ?? []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoadingStudents(false));
  }, []);

  const handlePay = async e => {
    e.preventDefault(); setSaving(true);
    try { await payStudent(parseInt(form.studentId), form.month, parseFloat(form.amount)); toast(t("payments.recorded")); setForm({ studentId: "", month: "", amount: "" }); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const fetchHistory = async () => {
    if (!histStudentId) return toast(t("payments.selectStudentErr"), "error");
    setLoadingPayments(true); setFetched(false);
    try { const res = await getPaymentsByStudent(histStudentId); setPayments(Array.isArray(res) ? res : []); setFetched(true); }
    catch (e) { toast(e.message, "error"); } finally { setLoadingPayments(false); }
  };

  const handleReceipt = async paymentId => {
    setLoadingReceipt(paymentId);
    try { const blob = await getPaymentReceipt(paymentId); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60_000); }
    catch (e) { toast(e.message, "error"); } finally { setLoadingReceipt(null); }
  };

  const filteredPayments = useMemo(() => {
    if (!q.trim()) return payments;
    const lq = q.toLowerCase();
    return payments.filter(p => p.month?.toLowerCase().includes(lq) || p.statut?.toLowerCase().includes(lq) || String(p.amount)?.includes(lq));
  }, [payments, q]);

  const paidCount   = payments.filter(p => p.statut === "PAID").length;
  const unpaidCount = payments.filter(p => p.statut === "NON_PAID").length;
  const totalPaid   = payments.filter(p => p.statut === "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const selectedStudent = students.find(s => String(s.id) === String(histStudentId));

  return (
    <div className="page-enter" style={{ padding: "32px 36px" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>{t("payments.crumb")}</div>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>{t("payments.title")}</h1>
        <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>{t("payments.subtitle")}</p>
      </div>

      <TabBar active={tab} onChange={setTab} t={t} />

      {/* ── PAY TAB ── */}
      {tab === "pay" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start", maxWidth: 860 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)" }}>
            <form onSubmit={handlePay} style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label={t("payments.student")}>
                <Select value={form.studentId} onChange={set("studentId")} required>
                  <option value="">{t("payments.selectStudent")}</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstname} {s.lastname}{s.registrationNumber ? ` · ${s.registrationNumber}` : ""}</option>)}
                </Select>
              </Field>
              <Field label={t("payments.month")}>
                <Select value={form.month} onChange={set("month")} required>
                  <option value="">{t("payments.selectMonth")}</option>
                  {MONTHS.map(m => <option key={m} value={m}>{t(`payments.months.${m}`)}</option>)}
                </Select>
              </Field>
              <Field label={t("payments.amount")} hint={t("payments.amountHint")}>
                <input className="t-input" type="number" min="0" step="0.01" placeholder={t("payments.amountPlaceholder")} value={form.amount} onChange={set("amount")} required />
              </Field>
              {form.studentId && form.month && form.amount && (
                <div style={{ padding: "14px 16px", borderRadius: "var(--r-md)", background: C_BG, border: "1px solid rgba(42,117,64,.22)", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>💳</span>
                  <div style={{ fontSize: 13, color: C_COLOR, lineHeight: 1.5 }}>
                    <strong>{students.find(s => String(s.id) === String(form.studentId))?.firstname ?? ""} {students.find(s => String(s.id) === String(form.studentId))?.lastname ?? ""}</strong>
                    {" — "}{t(`payments.months.${form.month}`)}{" — "}<strong>{parseFloat(form.amount).toLocaleString()} MRU</strong>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
                <button type="button" onClick={() => setForm({ studentId: "", month: "", amount: "" })} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
                <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("payments.recordBtn")} /></div>
              </div>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: C_BG, color: C_COLOR, border: `2px solid ${C_COLOR}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>💳</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{t("payments.sideNote")}</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
              <div className="section-label" style={{ marginBottom: 12 }}>{t("common.notes")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[{ icon: "📅", key: "tip1" }, { icon: "🧾", key: "tip2" }, { icon: "🔍", key: "tip3" }].map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{t(`payments.${item.key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Field label={t("payments.student")}>
                  <Select value={histStudentId} onChange={e => { setHistStudentId(e.target.value); setFetched(false); setPayments([]); }}>
                    <option value="">{t("payments.selectStudent")}</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstname} {s.lastname}{s.registrationNumber ? ` · ${s.registrationNumber}` : ""}</option>)}
                  </Select>
                </Field>
              </div>
              <button onClick={fetchHistory} disabled={loadingPayments || !histStudentId} className="btn-primary" style={{ flexShrink: 0, height: 44 }}>
                {loadingPayments ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : t("payments.viewHistory")}
              </button>
            </div>
          </div>

          {fetched && (
            <>
              {selectedStudent && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                  <div style={{ height: 70, background: `linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
                  </div>
                  <div style={{ padding: "0 28px 24px", marginTop: -28 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, flexShrink: 0, background: C_BG, color: C_COLOR, border: "3px solid var(--bg-card)", boxShadow: `0 0 0 2px ${C_COLOR}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>
                          {(selectedStudent.firstname?.[0] ?? "S").toUpperCase()}
                        </div>
                        <div style={{ paddingBottom: 2 }}>
                          <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.02em" }}>{selectedStudent.firstname} {selectedStudent.lastname}</h2>
                          {selectedStudent.registrationNumber && (
                            <span style={{ display: "inline-block", marginTop: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--text-faint)", padding: "2px 8px", borderRadius: 5, background: "var(--surface)", border: "1px solid var(--border)" }}>
                              {selectedStudent.registrationNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ padding: "10px 16px", borderRadius: "var(--r-md)", background: C_BG, border: "1px solid rgba(42,117,64,.2)", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: C_COLOR }}>{paidCount}</div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C_COLOR, opacity: .7 }}>{t("payments.paid")}</div>
                        </div>
                        <div style={{ padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--rose-dim)", border: "1px solid rgba(184,53,53,.2)", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--rose)" }}>{unpaidCount}</div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--rose)", opacity: .7 }}>{t("payments.unpaid")}</div>
                        </div>
                        <div style={{ padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border-md)", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text)" }}>{totalPaid.toLocaleString()}</div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)" }}>{t("payments.total")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {payments.length === 0 ? (
                <div className="empty-state"><span style={{ fontSize: 36 }}>💸</span><p>{t("payments.noRecords")}</p></div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div className="search-wrap" style={{ flex: "0 0 240px" }}>
                      <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input className="search-input" placeholder={t("payments.filterPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: 3, padding: 4, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                      {[{ id: "list", icon: "☰" }, { id: "calendar", icon: "⊞" }].map(view => (
                        <button key={view.id} onClick={() => setViewMode(view.id)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: viewMode === view.id ? "var(--accent)" : "transparent", color: viewMode === view.id ? "#fff" : "var(--text-muted)", fontSize: 13, transition: "all .14s", fontFamily: "'Instrument Sans', sans-serif" }}>{view.icon}</button>
                      ))}
                    </div>
                  </div>

                  {viewMode === "calendar" ? (
                    <MonthCalendar payments={payments} t={t} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {filteredPayments.length === 0 ? (
                        <div className="empty-state"><span style={{ fontSize: 28 }}>🔎</span><p>{t("payments.noResults", { q })}</p></div>
                      ) : filteredPayments.map((p, i) => (
                        <PaymentRow key={p.id ?? i} p={p} t={t} onReceipt={handleReceipt} loadingReceipt={loadingReceipt} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}