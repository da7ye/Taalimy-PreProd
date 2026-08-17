import { useState, useEffect, useMemo } from "react";
import {
  getPartnerWallets,
  submitPartnerPayment,
  getPendingPartnerPayments,
  getPartnerPaymentHistory,
  getPartnerPaymentBalance,
} from "../api";
import { Field, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import { useLanguage } from "../LanguageContext";

// Real wallet logos — keyed by the wallet's `name` as returned by
// GET /partner-payments/wallets. Falls back to an emoji badge for any
// wallet that isn't in this map yet (e.g. new wallets added later, or
// once the API starts returning a real `logo` URL per wallet).
import bankilyLogo from "../assets/wallets/Bankily.png";
import sedadLogo   from "../assets/wallets/Sedad.png";
import masriviLogo from "../assets/wallets/Masrivi.png";

/*
  NOTE: the backend endpoints are scoped to a subscription (subscriptionId).
  This app doesn't currently expose which subscription the logged-in partner
  belongs to, so — mirroring the USER_ID constant pattern already used in
  App.jsx — we hardcode it here. Swap this out for the real value (e.g. from
  auth/staff profile) once that's available.
*/
const SUBSCRIPTION_ID = 1;

const C_COLOR = "var(--accent)";
const C_BG    = "var(--accent-dim)";

const MONTHS = [
  { v: 1,  label: "January" },  { v: 2,  label: "February" },
  { v: 3,  label: "March" },    { v: 4,  label: "April" },
  { v: 5,  label: "May" },      { v: 6,  label: "June" },
  { v: 7,  label: "July" },     { v: 8,  label: "August" },
  { v: 9,  label: "September" },{ v: 10, label: "October" },
  { v: 11, label: "November" }, { v: 12, label: "December" },
];
const monthLabel = (n) => MONTHS.find(m => m.v === Number(n))?.label ?? n;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

const LOCAL_WALLET_LOGOS = {
  Bankily: bankilyLogo,
  Sedad:   sedadLogo,
  Masrivi: masriviLogo,
};

// Emoji fallback, cycled by wallet id, for any wallet without a known logo.
const WALLET_ICONS = ["💳", "📱", "💰", "🏦", "🪙", "💵"];
const getWalletLogoSrc = (w) => w?.logo || LOCAL_WALLET_LOGOS[w?.name] || null;

/** Square badge showing a wallet's real logo, or an emoji fallback. */
function WalletBadge({ wallet, size = 42, radius }) {
  const src = getWalletLogoSrc(wallet);
  const r = radius ?? Math.round(size * 0.28);
  if (src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: r, flexShrink: 0,
        background: "#fff", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <img src={src} alt={wallet?.name || "wallet"} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: C_BG, color: C_COLOR,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.48),
    }}>
      {WALLET_ICONS[(wallet?.id ?? 0) % WALLET_ICONS.length]}
    </div>
  );
}

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return d; }
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
  const TABS = [
    { id: "submit",  label: "Submit Payment", icon: "＋" },
    { id: "pending", label: "Pending",        icon: "⏳" },
    { id: "history", label: "History",        icon: "🕓" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, padding: 5, borderRadius: "var(--r-lg)", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", width: "fit-content", marginBottom: 28 }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 18px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer",
            background: isActive ? "var(--accent)" : "transparent",
            color: isActive ? "#fff" : "var(--text-muted)",
            fontSize: 13, fontWeight: isActive ? 600 : 400,
            fontFamily: "'Instrument Sans', sans-serif",
            boxShadow: isActive ? "0 2px 8px var(--accent-glow)" : "none",
            transition: "all .15s",
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    PENDING:  { bg: "var(--amber-dim)", fg: "var(--amber)", bd: "rgba(168,100,30,.22)",  label: "Pending" },
    APPROVED: { bg: "var(--green-dim)", fg: "var(--green)", bd: "rgba(42,117,64,.22)",   label: "Approved" },
    REJECTED: { bg: "var(--rose-dim)",  fg: "var(--rose)",  bd: "rgba(184,53,53,.22)",   label: "Rejected" },
  };
  const s = map[status] || { bg: "var(--surface)", fg: "var(--text-faint)", bd: "var(--border-md)", label: status || "—" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 700,
      background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.fg, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ─── Wallet picker ──────────────────────────────────────────────────────────

function WalletPicker({ wallets, value, onChange, loading }) {
  if (loading) {
    return <div style={{ display: "flex", gap: 10 }}>{[0, 1, 2].map(i => (
      <div key={i} style={{ flex: 1, height: 76, borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)" }} />
    ))}</div>;
  }
  if (!wallets.length) {
    return <div style={{ fontSize: 13, color: "var(--text-faint)" }}>No payment wallets available.</div>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(wallets.length, 3)}, 1fr)`, gap: 10 }}>
      {wallets.map(w => {
        const active = String(value) === String(w.id);
        return (
          <button
            type="button"
            key={w.id}
            disabled={w.active === false}
            onClick={() => onChange(w.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "14px 10px", borderRadius: "var(--r-md)",
              border: `1.5px solid ${active ? C_COLOR : "var(--border)"}`,
              background: active ? C_BG : "var(--bg-card)",
              cursor: w.active === false ? "not-allowed" : "pointer",
              opacity: w.active === false ? 0.45 : 1,
              transition: "border-color .14s, background .14s, transform .12s",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
            onMouseEnter={e => { if (!active && w.active !== false) e.currentTarget.style.background = "var(--surface-hover)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--bg-card)"; }}
          >
            <WalletBadge wallet={w} size={40} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? C_COLOR : "var(--text-dim)" }}>{w.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: "var(--text-faint)" }}>{w.codeMerchant}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Payment card (used in Pending + History) ──────────────────────────────

function PaymentCard({ p, wallets }) {
  const wallet = wallets.find(w => w.name === p.walletName);
  const pct = p.montantAttendu ? Math.min(100, Math.round(((p.montantAttendu - p.montantRestant) / p.montantAttendu) * 100)) : null;
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WalletBadge wallet={wallet} size={42} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {monthLabel(p.moisPaiement)} {p.anneePaiement} · <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{p.walletName}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 2 }}>
              #{p.id} · {fmtDate(p.createdDate)}
            </div>
          </div>
        </div>
        <StatusBadge status={p.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <div style={{ padding: "8px 12px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)", marginBottom: 3 }}>Paid</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--green)" }}>{fmt(p.montantPaye)} MRU</div>
        </div>
        <div style={{ padding: "8px 12px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)", marginBottom: 3 }}>Expected</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-dim)" }}>{fmt(p.montantAttendu)} MRU</div>
        </div>
        <div style={{ padding: "8px 12px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)", marginBottom: 3 }}>Remaining</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: p.soldeTotalementPaye ? "var(--green)" : "var(--rose)" }}>{fmt(p.montantRestant)} MRU</div>
        </div>
      </div>

      {pct !== null && (
        <div>
          <div style={{ height: 6, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: p.soldeTotalementPaye ? "var(--green)" : C_COLOR, borderRadius: 999, transition: "width .3s" }} />
          </div>
        </div>
      )}

      {(p.commentaireAgent || p.captureEcran) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4, borderTop: "1px dashed var(--border)" }}>
          {p.commentaireAgent && (
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-dim)" }}>Agent note:</strong> {p.commentaireAgent}
            </div>
          )}
          {p.captureEcran && (
            <a href={p.captureEcran} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: C_COLOR, fontWeight: 600, textDecoration: "none" }}>
              📎 View screenshot
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function PartnerPaymentsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [tab, setTab] = useState("submit");

  // wallets
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  useEffect(() => {
    setLoadingWallets(true);
    getPartnerWallets()
      .then(w => setWallets(Array.isArray(w) ? w : []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoadingWallets(false));
  }, []);

  // ── submit form ──
  const [form, setForm] = useState({ walletId: "", moisPaiement: "", anneePaiement: String(CURRENT_YEAR), montantPaye: "", captureEcranUrl: "" });
  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const selectedWallet = wallets.find(w => String(w.id) === String(form.walletId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.walletId)      return toast("Please choose a payment wallet.", "error");
    if (!form.moisPaiement)  return toast("Please choose a month.", "error");
    if (!form.montantPaye)   return toast("Please enter the amount paid.", "error");
    setSaving(true);
    try {
      const payload = {
        anneePaiement: parseInt(form.anneePaiement, 10),
        moisPaiement: parseInt(form.moisPaiement, 10),
        montantPaye: parseFloat(form.montantPaye),
        captureEcranUrl: form.captureEcranUrl || "",
        subscriptionId: SUBSCRIPTION_ID,
        walletId: parseInt(form.walletId, 10),
      };
      const res = await submitPartnerPayment(payload);
      setLastResult(res);
      toast("Payment submitted for review.");
      setForm({ walletId: "", moisPaiement: "", anneePaiement: String(CURRENT_YEAR), montantPaye: "", captureEcranUrl: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── pending ──
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [fetchedPending, setFetchedPending] = useState(false);

  const loadPending = () => {
    setLoadingPending(true);
    getPendingPartnerPayments()
      .then(p => { setPending(Array.isArray(p) ? p : []); setFetchedPending(true); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoadingPending(false));
  };

  useEffect(() => { if (tab === "pending" && !fetchedPending) loadPending(); }, [tab]);

  // ── history / balance ──
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fetchedHistory, setFetchedHistory] = useState(false);

  const loadHistory = () => {
    setLoadingHistory(true);
    getPartnerPaymentHistory(SUBSCRIPTION_ID)
      .then(h => { setHistory(Array.isArray(h) ? h : []); setFetchedHistory(true); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => { if (tab === "history" && !fetchedHistory) loadHistory(); }, [tab]);

  const [balMonth, setBalMonth] = useState("");
  const [balYear, setBalYear]   = useState(String(CURRENT_YEAR));
  const [balance, setBalance]   = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const checkBalance = async () => {
    if (!balMonth) return toast("Please choose a month to check the balance.", "error");
    setLoadingBalance(true);
    try {
      const res = await getPartnerPaymentBalance(SUBSCRIPTION_ID, balMonth, balYear);
      setBalance(res);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoadingBalance(false);
    }
  };
  const clearBalance = () => { setBalance(null); setBalMonth(""); };

  const displayedHistory = balance ? balance.paiements ?? [] : history;

  return (
    <div className="page-enter" style={{ padding: "32px 36px" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Finance</div>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>Partner Payments</h1>
        <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>Submit your subscription payments and track their approval status.</p>
      </div>

      <TabBar active={tab} onChange={setTab} />

      {/* ══ SUBMIT ══ */}
      {tab === "submit" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start", maxWidth: 900 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)" }}>
            <form onSubmit={handleSubmit} style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Payment wallet">
                <WalletPicker wallets={wallets} loading={loadingWallets} value={form.walletId} onChange={id => setForm(f => ({ ...f, walletId: id }))} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Month">
                  <Select value={form.moisPaiement} onChange={setField("moisPaiement")} required>
                    <option value="">Select month</option>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.label}</option>)}
                  </Select>
                </Field>
                <Field label="Year">
                  <Select value={form.anneePaiement} onChange={setField("anneePaiement")} required>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Amount paid" hint="In MRU">
                <input className="t-input" type="number" min="0" step="0.01" placeholder="e.g. 5000" value={form.montantPaye} onChange={setField("montantPaye")} required />
              </Field>

              <Field label="Payment screenshot URL" hint="Paste a link to your payment confirmation screenshot">
                <input className="t-input" type="text" placeholder="https://..." value={form.captureEcranUrl} onChange={setField("captureEcranUrl")} />
              </Field>

              {form.walletId && form.moisPaiement && form.montantPaye && (
                <div style={{ padding: "14px 16px", borderRadius: "var(--r-md)", background: C_BG, border: "1px solid var(--border-md)", display: "flex", alignItems: "center", gap: 12 }}>
                  <WalletBadge wallet={selectedWallet} size={34} />
                  <div style={{ fontSize: 13, color: C_COLOR, lineHeight: 1.5 }}>
                    <strong>{selectedWallet?.name}</strong> — {monthLabel(form.moisPaiement)} {form.anneePaiement} — <strong>{parseFloat(form.montantPaye).toLocaleString()} MRU</strong>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
                <button type="button" onClick={() => setForm({ walletId: "", moisPaiement: "", anneePaiement: String(CURRENT_YEAR), montantPaye: "", captureEcranUrl: "" })} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
                <div style={{ flex: 2 }}><SubmitBtn loading={saving} label="Submit payment" /></div>
              </div>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: C_BG, color: C_COLOR, border: `2px solid ${C_COLOR}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>💳</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>Every submission is reviewed by our team before it's marked as approved.</div>
            </div>

            {lastResult && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
                <div className="section-label" style={{ marginBottom: 12 }}>Last submission</div>
                <PaymentCard p={lastResult} wallets={wallets} />
              </div>
            )}

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
              <div className="section-label" style={{ marginBottom: 12 }}>{t("common.notes")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "📆", text: "Submit one payment per month per wallet." },
                  { icon: "🧾", text: "Keep your screenshot link accessible for the review team." },
                  { icon: "🔍", text: "Track approval status under the Pending and History tabs." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PENDING ══ */}
      {tab === "pending" && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
              {loadingPending ? t("common.loading") : `${pending.length} pending payment${pending.length === 1 ? "" : "s"}`}
            </div>
            <button onClick={loadPending} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12.5 }} disabled={loadingPending}>
              {loadingPending ? <><span className="spinner" style={{ width: 11, height: 11 }} /> {t("common.loading")}</> : "↻ Refresh"}
            </button>
          </div>

          {loadingPending ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 22, height: 22 }} />
              <p>{t("common.loading")}</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="empty-state"><span style={{ fontSize: 36 }}>✅</span><p>No pending payments right now.</p></div>
          ) : (
            pending.map(p => <PaymentCard key={p.id} p={p} wallets={wallets} />)
          )}
        </div>
      )}

      {/* ══ HISTORY ══ */}
      {tab === "history" && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: "20px 22px" }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Check balance for a specific month</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Month">
                  <Select value={balMonth} onChange={e => setBalMonth(e.target.value)}>
                    <option value="">Select month</option>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.label}</option>)}
                  </Select>
                </Field>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <Field label="Year">
                  <Select value={balYear} onChange={e => setBalYear(e.target.value)}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </Field>
              </div>
              <button onClick={checkBalance} disabled={loadingBalance || !balMonth} className="btn-primary" style={{ flexShrink: 0, height: 44 }}>
                {loadingBalance ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("common.loading")}</> : "Check balance"}
              </button>
              {balance && (
                <button onClick={clearBalance} className="btn-ghost" style={{ height: 44, padding: "0 16px", fontSize: 12.5, color: "var(--rose)", borderColor: "rgba(184,53,53,.25)" }}>✕ Clear filter</button>
              )}
            </div>
          </div>

          {balance && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{monthLabel(balance.mois)} {balance.annee}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{balance.schoolName}</div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: balance.soldeTotalementPaye ? "var(--green-dim)" : "var(--rose-dim)",
                  color: balance.soldeTotalementPaye ? "var(--green)" : "var(--rose)",
                  border: `1px solid ${balance.soldeTotalementPaye ? "rgba(42,117,64,.22)" : "rgba(184,53,53,.22)"}`,
                }}>
                  {balance.soldeTotalementPaye ? "Fully paid" : "Balance remaining"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ padding: "12px 16px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--green)" }}>{fmt(balance.montantPaye)}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)" }}>Paid (MRU)</div>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text)" }}>{fmt(balance.montantAttendu)}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)" }}>Expected (MRU)</div>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--rose)" }}>{fmt(balance.montantRestant)}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-faint)" }}>Remaining (MRU)</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-label">{balance ? "Payments this month" : "Full history"}</div>
            {!balance && (
              <button onClick={loadHistory} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12.5 }} disabled={loadingHistory}>
                {loadingHistory ? <><span className="spinner" style={{ width: 11, height: 11 }} /> {t("common.loading")}</> : "↻ Refresh"}
              </button>
            )}
          </div>

          {loadingHistory && !balance ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 22, height: 22 }} />
              <p>{t("common.loading")}</p>
            </div>
          ) : displayedHistory.length === 0 ? (
            <div className="empty-state"><span style={{ fontSize: 36 }}>🧾</span><p>No payments found.</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayedHistory.map(p => <PaymentCard key={p.id} p={p} wallets={wallets} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}