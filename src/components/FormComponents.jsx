export function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && !error && (
        <span style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 5 }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 11.5, color: "var(--rose)", marginTop: 5 }}>{error}</span>
      )}
    </div>
  );
}

export function Input({ ...props }) {
  return <input className="t-input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="t-select" {...props}>
      {children}
    </select>
  );
}

export function SubmitBtn({ loading, label = "Save" }) {
  return (
    <button
      type="submit" disabled={loading}
      className="btn-primary"
      style={{ width: "100%", padding: "12px", fontSize: 14 }}
    >
      {loading ? (
        <>
          <span className="spinner" style={{ width: 14, height: 14 }} />
          Saving…
        </>
      ) : label}
    </button>
  );
}