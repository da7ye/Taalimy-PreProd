export function DetailSection({ label, children }) {
    return (
      <div>
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">{label}</div>
        <div className="space-y-2">{children}</div>
      </div>
    );
  }
  
  export function DetailRow({ icon, label, value }) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
        <span className="text-base w-5 text-center shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
          <div className="text-sm text-white/80 truncate">{value || "—"}</div>
        </div>
      </div>
    );
  }
  
  export function DetailBadge({ label, active }) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
        ${active
          ? "bg-[#10b981]/10 border-[#10b981]/20 text-[#34d399]"
          : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#34d399]" : "bg-red-400"}`} />
        {label}
      </span>
    );
  }