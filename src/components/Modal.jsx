import { useEffect } from "react";


export default function Modal({ title, subtitle, icon, accentColor, onClose, children, maxWidth = 540 }) {
  const accent = accentColor || "var(--accent)";
  const accentDim = accentColor ? `${accentColor}18` : "var(--accent-dim)";

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div 
      className="modal-backdrop anim-fade" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="anim-scale"
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-modal)",
          border: "1px solid var(--border-md)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          width: "100%", 
          maxWidth,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex", 
          flexDirection: "column",
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          background: `linear-gradient(135deg, ${accentDim} 0%, transparent 70%)`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {icon && (
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: accentDim,
                  border: `1px solid ${accent}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {icon}
                </div>
              )}
              <div>
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 600,
                  color: "var(--text)", letterSpacing: "-.02em",
                  fontFamily: "'Instrument Serif', serif",
                }}>{title}</h2>
                {subtitle && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "var(--surface)", border: "1px solid var(--border-md)",
                color: "var(--text-muted)", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 14, flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
            >✕</button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          flex: 1,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}