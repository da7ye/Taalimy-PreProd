import { useState, useEffect, useMemo } from "react";
import { getNotApprovedUsers, approveUser } from "../api";
import { useToast } from "../components/Toast";
import { useLanguage } from "../LanguageContext";


export default function ApprovePage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [approving, setApproving] = useState(null); // holds the key of the row being approved, or null
  const [q, setQ]                 = useState("");

  const load = () => {
    setLoading(true);
    getNotApprovedUsers().then(setUsers).catch(e => toast(e.message, "error")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return users;
    const lower = q.toLowerCase();
    return users.filter(u =>
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(lower)
    );
  }, [users, q]);

  const handleApprove = async (user, key) => {
    setApproving(key);
    try {
      await approveUser(user.id);
      toast(t("approve.approved", { name: `${user.firstname} ${user.lastname}` }));
      load();
    } catch (err) { toast(err.message, "error"); }
    finally { setApproving(null); }
  };

  return (
    <div className="page-enter" style={{ padding: "32px 36px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>{t("approve.crumb")}</div>
          <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>
            {t("approve.title")}
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>
            {t("approve.subtitle")}
          </p>
        </div>
        {!loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: "var(--green-dim)", border: "1px solid rgba(42,117,64,.2)",
            fontSize: 13, fontWeight: 600, color: "var(--green)",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} />
            {filtered.length} {t("approve.pending")}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 280, marginBottom: 22 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          placeholder={t("approve.searchPlaceholder")}
          value={q} onChange={e => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("approve.loadingMsg")}</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 40 }}>{q ? "🔎" : "✅"}</span>
          <p>{q ? t("approve.noResults", { q }) : t("approve.allApproved")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((user, i) => {
            const key = user.id ?? i;
            const isApproving = approving === key;
            return (
            <div key={key} className="card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "var(--green-dim)", border: "1px solid rgba(42,117,64,.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "var(--green)",
                }}>
                  {(user.firstname?.[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.firstname} {user.lastname}
                  </div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                  background: "var(--amber-dim)", border: "1px solid rgba(168,100,30,.2)",
                  color: "var(--amber)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em",
                }}>{t("approve.pendingBadge")}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <button
                  onClick={() => handleApprove(user, key)}
                  disabled={isApproving}
                  className="btn-primary"
                  style={{ width: "100%", fontSize: 13.5 }}
                >
                  {isApproving ? (
                    <><span className="spinner" style={{ width: 13, height: 13 }} /> {t("approve.approving")}</>
                  ) : t("approve.approveBtn")}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div style={{
        marginTop: 28, padding: "14px 18px", borderRadius: "var(--r-md)",
        background: "var(--blue-dim)", border: "1px solid rgba(30,80,184,.18)",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ margin: 0, fontSize: 13, color: "var(--blue)", lineHeight: 1.6 }}>
          {t("approve.infoBanner")}
        </p>
      </div>
    </div>
  );
}