import { createPortal } from "react-dom";
import { useLanguage } from "../LanguageContext";

/**
 * variant: "danger" (default) | "primary"
 *   - danger  → rose trash icon, red Delete button, "Deleting…" loading text
 *   - primary → accent check icon, accent Confirm button, "Saving…" loading text
 *
 * Any of these labels can also be overridden via props:
 *   confirmLabel, cancelLabel, loadingLabel, icon
 */
export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
  title,
  variant = "danger",
  confirmLabel,
  cancelLabel,
  loadingLabel,
  icon,
}) {
  const { t } = useLanguage();
  const isDanger = variant === "danger";

  const defaultTitle        = isDanger ? t("confirm.title")        : t("common.confirm");
  const defaultConfirmLabel = isDanger ? t("confirm.deleteAction") : t("common.confirm");
  const defaultLoadingLabel = isDanger ? t("common.deleting")      : t("common.saving");
  const resolvedCancelLabel = cancelLabel ?? t("confirm.cancel");

  const iconBg     = isDanger ? "var(--rose-dim)"           : "var(--accent-dim)";
  const iconBorder = isDanger ? "rgba(184,53,53,.2)"        : "var(--accent-glow)";
  const iconColor  = isDanger ? "var(--rose)"               : "var(--accent)";

  const confirmBtnClass = isDanger ? "btn-danger" : "btn-primary";

  const defaultIcon = isDanger ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

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
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 18,
        }}>
          {icon ?? defaultIcon}
        </div>

        <h3 style={{
          margin: "0 0 8px", fontSize: 16, fontWeight: 600,
          color: "var(--text)", letterSpacing: "-.02em",
          fontFamily: "'Instrument Serif', serif",
        }}>{title ?? defaultTitle}</h3>
        <p style={{
          margin: "0 0 24px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6,
        }}>{message || t("confirm.defaultMsg")}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ flex: 1, padding: "10px" }}>
            {resolvedCancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading} className={confirmBtnClass} style={{ flex: 1, padding: "10px" }}>
            {loading
              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> {loadingLabel ?? defaultLoadingLabel}</>
              : (confirmLabel ?? defaultConfirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}