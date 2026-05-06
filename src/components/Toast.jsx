import { useState, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const remove = id => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 200,
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
      }}>
        {toasts.map(({ id, msg, type }) => (
          <div
            key={id}
            onClick={() => remove(id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px",
              borderRadius: 14,
              background: "var(--bg-card)",
              border: `1px solid ${type === "success" ? "rgba(42,117,64,.3)" : "rgba(184,53,53,.3)"}`,
              color: type === "success" ? "var(--green)" : "var(--rose)",
              fontSize: 13.5, fontWeight: 500,
              minWidth: 240, maxWidth: 340,
              cursor: "pointer",
              boxShadow: "var(--shadow-lg)",
              animation: "toastIn .22s ease-out both",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: type === "success" ? "var(--green-dim)" : "var(--rose-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              {type === "success" ? "✓" : "✕"}
            </div>
            <span style={{ flex: 1, color: "var(--text-dim)", lineHeight: 1.4 }}>{msg}</span>
            <span style={{ color: "var(--text-faint)", fontSize: 11 }}>✕</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}