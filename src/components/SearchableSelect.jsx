// ══ SearchableSelect.jsx ══════════════════════════════════
// A lightweight combobox: looks like the app's normal <select>,
// but opens a searchable, scrollable list — built for fields backed
// by potentially large datasets (teachers, timetable sessions, etc.)
// where a plain <select> becomes unusable.

import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  options,                // array of items
  value,                  // currently selected value (matched against getValue)
  onChange,                // (value) => void
  getLabel,                // item => string shown in the list & once selected
  getValue,                // item => value used for selection/matching
  getSearchText,           // optional: item => string used for filtering (defaults to getLabel)
  placeholder = "Search…",
  emptyLabel = "— Select —",
  noMatchLabel = "No matches",
  disabled = false,
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find(o => String(getValue(o)) === String(value));

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const filtered = query.trim()
    ? options.filter(o =>
        (getSearchText ? getSearchText(o) : getLabel(o))
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : options;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="t-select"
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          gap: 8,
        }}
      >
        <span style={{
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: selected ? "var(--text)" : "var(--text-faint)",
        }}>
          {selected ? getLabel(selected) : emptyLabel}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ flexShrink: 0, opacity: .5, transform: open ? "rotate(180deg)" : "none", transition: "transform .13s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--r-md)", boxShadow: "0 10px 28px rgba(0,0,0,.18)",
          overflow: "hidden",
        }}>
          <div style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
            <div className="search-wrap">
              <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="search-input"
                style={{ width: "100%" }}
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setOpen(false); setQuery(""); } }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px", fontSize: 12.5, color: "var(--text-faint)", textAlign: "center" }}>
                {noMatchLabel}
              </div>
            ) : filtered.map((o, i) => {
              const v = getValue(o);
              const isSel = String(v) === String(value);
              return (
                <div
                  key={v ?? i}
                  onClick={() => { onChange(v); setOpen(false); setQuery(""); }}
                  style={{
                    padding: "9px 14px", fontSize: 13, cursor: "pointer",
                    background: isSel ? "var(--surface-hover, rgba(0,0,0,.045))" : "transparent",
                    color: isSel ? "var(--accent)" : "var(--text-dim)",
                    fontWeight: isSel ? 600 : 400,
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover, rgba(0,0,0,.045))"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSel ? "var(--surface-hover, rgba(0,0,0,.045))" : "transparent"; }}
                >
                  {getLabel(o)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}