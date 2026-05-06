/* ══════════════════════════════════════════════════════
   DetailOverlay — replaces the side panel entirely.
   Opens as a centered modal with a rich profile layout.
══════════════════════════════════════════════════════ */

const COLOR_MAP = {
  "from-[#6c63ff] to-[#9b8fff]": { color: "var(--violet)",  bg: "var(--violet-dim)",  border: "rgba(79,67,192,.22)" },
  "from-[#3ecfcf] to-[#5de8e8]": { color: "var(--teal)",    bg: "var(--teal-dim)",    border: "rgba(14,126,104,.22)" },
  "from-[#f59e0b] to-[#fbbf24]": { color: "var(--amber)",   bg: "var(--amber-dim)",   border: "rgba(168,100,30,.22)" },
  "from-[#ec4899] to-[#f472b6]": { color: "var(--rose)",    bg: "var(--rose-dim)",    border: "rgba(184,53,53,.22)" },
  "from-[#10b981] to-[#34d399]": { color: "var(--green)",   bg: "var(--green-dim)",   border: "rgba(42,117,64,.22)" },
  "from-[#8b5cf6] to-[#a78bfa]": { color: "var(--purple)",  bg: "var(--purple-dim)",  border: "rgba(124,63,175,.22)" },
  "from-[#6c63ff] to-[#3ecfcf]": { color: "var(--violet)",  bg: "var(--violet-dim)",  border: "rgba(79,67,192,.22)" },
};

export function DetailSection({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="section-label" style={{ marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

export function DetailRow({ icon, label, value }) {
  if (!value && value !== 0) return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 10,
      background: "var(--surface)", border: "1px solid var(--border)",
      opacity: .55,
    }}>
      <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-faint)" }}>—</div>
      </div>
    </div>
  );
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 10,
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <span style={{ width: 20, textAlign: "center", fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

export function DetailBadge({ label, active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999,
      fontSize: 12, fontWeight: 600,
      background: active ? "var(--green-dim)" : "var(--rose-dim)",
      border: `1px solid ${active ? "rgba(42,117,64,.22)" : "rgba(184,53,53,.22)"}`,
      color: active ? "var(--green)" : "var(--rose)",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
        background: active ? "var(--green)" : "var(--rose)",
      }} />
      {label}
    </span>
  );
}

export default function DetailPanel({ title, subtitle, avatar, color, onClose, children }) {
  const c = COLOR_MAP[color] || { color: "var(--accent)", bg: "var(--accent-dim)", border: "var(--accent-glow)" };
  const isEmoji = typeof avatar === "string" && avatar.length > 1;

  return (
    <div
      className="modal-backdrop anim-fade"
      onClick={onClose}
      style={{ alignItems: "center" }}
    >
      <div
        className="anim-scale detail-overlay"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header with large avatar ── */}
        <div style={{
          padding: "28px 28px 24px",
          borderBottom: "1px solid var(--border)",
          background: `linear-gradient(160deg, ${c.bg} 0%, transparent 60%)`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Large avatar */}
              <div style={{
                width: 62, height: 62, borderRadius: 18,
                background: c.bg,
                border: `2px solid ${c.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isEmoji ? 26 : 24,
                fontFamily: "'Instrument Serif', serif",
                color: c.color,
                boxShadow: `0 4px 16px ${c.border}`,
              }}>
                {avatar}
              </div>
              <div>
                <h2 style={{
                  margin: 0, fontSize: 20,
                  fontFamily: "'Instrument Serif', serif",
                  color: "var(--text)", letterSpacing: "-.02em",
                  lineHeight: 1.15,
                }}>{title}</h2>
                {subtitle && (
                  <p style={{
                    margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      display: "inline-block", width: 7, height: 7,
                      borderRadius: "50%", background: c.color, flexShrink: 0,
                    }} />
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "var(--surface)", border: "1px solid var(--border-md)",
                color: "var(--text-muted)", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
            >✕</button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}