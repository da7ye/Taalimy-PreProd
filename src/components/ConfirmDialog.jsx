import { createPortal } from "react-dom";

export default function ConfirmDialog({ message, onConfirm, onCancel, loading, title = "Confirm Delete" }) {
  const dialog = (
    <div className="modal-backdrop anim-fade" onClick={onCancel}>
      <div
        className="anim-scale"
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-modal)",
          border: "1px solid var(--border-md)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          width: "100%", maxWidth: 400,
          padding: "28px 28px 24px",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: "var(--rose-dim)",
          border: "1px solid rgba(184,53,53,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 18,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </div>

        <h3 style={{
          margin: "0 0 8px", fontSize: 16, fontWeight: 600,
          color: "var(--text)", letterSpacing: "-.02em",
          fontFamily: "'Instrument Serif', serif",
        }}>{title}</h3>
        <p style={{
          margin: "0 0 24px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6,
        }}>{message || "Are you sure? This action cannot be undone."}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ flex: 1, padding: "10px" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger" style={{ flex: 1, padding: "10px" }}>
            {loading
              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Deleting…</>
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}