import { useState } from "react";
import { BASE_URL } from "../api";

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

export default function LoginPage({ onLogin, isDark, onToggleTheme }) {
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [shake,      setShake]      = useState(false);
  const [focusId,    setFocusId]    = useState(false);
  const [focusPw,    setFocusPw]    = useState(false);

  // ── theme tokens ────────────────────────────────────────────
  const D = isDark;

  // left panel always dark regardless of theme
  const LEFT_BG   = "linear-gradient(160deg, #12102A 0%, #0D1A14 65%, #0A0E1F 100%)";

  // right panel adapts
  const RIGHT_BG  = D
    ? "linear-gradient(160deg, #13111E 0%, #0E0C1A 100%)"
    : "linear-gradient(160deg, #F4F6FF 0%, #EDF0FA 100%)";

  const TEXT_HEA  = D ? "#ffffff"                   : "#0F1520";
  const TEXT_SUB  = D ? "rgba(255,255,255,0.38)"    : "rgba(15,21,32,0.48)";
  const TEXT_TINY = D ? "rgba(155,143,255,0.75)"    : "rgba(79,67,192,0.75)";
  const INPUT_BG  = D ? "rgba(255,255,255,0.06)"    : "rgba(15,21,32,0.05)";
  const INPUT_BD  = D ? "rgba(255,255,255,0.10)"    : "rgba(15,21,32,0.14)";
  const INPUT_FG  = D ? "#ffffff"                   : "#0F1520";
  const INPUT_PH  = D ? "rgba(255,255,255,0.28)"    : "rgba(15,21,32,0.32)";
  const INPUT_FOC_BD = D ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.60)";
  const INPUT_FOC_SH = D ? "rgba(155,143,255,0.13)" : "rgba(79,67,192,0.10)";
  const INPUT_FOC_BG = D ? "rgba(255,255,255,0.10)" : "rgba(15,21,32,0.03)";
  const ICON_COL  = D ? "rgba(255,255,255,0.28)"    : "rgba(15,21,32,0.32)";
  const ICON_FOC  = D ? "rgba(155,143,255,0.9)"     : "rgba(79,67,192,0.9)";
  const DIV_LINE  = D ? "rgba(255,255,255,0.07)"    : "rgba(15,21,32,0.09)";
  const FOOT_TXT  = D ? "rgba(255,255,255,0.22)"    : "rgba(15,21,32,0.35)";
  const TOG_BG    = D ? "rgba(255,255,255,0.08)"    : "rgba(15,21,32,0.07)";
  const TOG_BD    = D ? "rgba(255,255,255,0.13)"    : "rgba(15,21,32,0.13)";
  const TOG_COL   = D ? "rgba(255,255,255,0.55)"    : "rgba(15,21,32,0.55)";
  const ERR_BG    = D ? "rgba(224,112,112,0.10)"    : "rgba(184,53,53,0.08)";
  const ERR_BD    = D ? "rgba(224,112,112,0.22)"    : "rgba(184,53,53,0.20)";
  const ERR_COL   = D ? "#E07070"                   : "#B83535";
  const AUTOFILL  = D ? "#12102A"                   : "#EDF0FA";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Please fill in all fields.");
      setShake(true); setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/authentication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
      const data = await res.json();
      localStorage.setItem("taalimy_token", data.token);
      localStorage.setItem("taalimy_role",  data.role);
      onLogin(data.token, data.role);
    } catch (err) {
      setError(
        err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")
          ? "Invalid credentials. Please try again."
          : err.message || "Login failed."
      );
      setShake(true); setTimeout(() => setShake(false), 600);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shakeX {
          0%,100%{ transform:translateX(0); }
          20%{ transform:translateX(-10px); }
          40%{ transform:translateX(10px); }
          60%{ transform:translateX(-6px); }
          80%{ transform:translateX(6px); }
        }
        @keyframes fadeSlideUp {
          from{ opacity:0; transform:translateY(22px); }
          to  { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideIn {
          from{ opacity:0; transform:translateX(-26px); }
          to  { opacity:1; transform:translateX(0); }
        }
        @keyframes float1 {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(40px,-30px) scale(1.08); }
        }
        @keyframes float2 {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(-30px,40px) scale(1.05); }
        }
        @keyframes float3 {
          0%,100%{ transform:translate(0,0); }
          50%{ transform:translate(20px,-40px); }
        }
        .ll { animation: fadeSlideIn .7s cubic-bezier(.22,1,.36,1) both; }
        .lr { animation: fadeSlideUp .6s cubic-bezier(.22,1,.36,1) .1s both; }
        .lshake { animation: shakeX .5s ease-out; }
        .feat { animation: fadeSlideUp .5s ease-out both; }
      `}</style>

      {/* ── FULL SCREEN ROOT ─────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex",
        fontFamily: "'Instrument Sans', sans-serif",
        transition: "background .3s",
      }}>

        {/* ── THEME TOGGLE (top-right, always visible) ───────── */}
        <button
          onClick={onToggleTheme}
          title={D ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position: "absolute", top: 22, right: 24, zIndex: 100,
            width: 40, height: 40, borderRadius: 11,
            background: TOG_BG, border: `1.5px solid ${TOG_BD}`,
            color: TOG_COL,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background .2s, border-color .2s, color .2s, transform .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.background = D ? "rgba(255,255,255,0.14)" : "rgba(15,21,32,0.12)";
            e.currentTarget.style.color = D ? "#fff" : "#0F1520";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.background = TOG_BG;
            e.currentTarget.style.color = TOG_COL;
          }}
        >
          {D ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* ════════════════════════════════════════
            LEFT PANEL — always dark branded
        ════════════════════════════════════════ */}
        <div className="ll" style={{
          width: "52%", flexShrink: 0,
          background: LEFT_BG,
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          padding: "56px 72px",
        }}>
          {/* orbs */}
          <div style={{ position:"absolute", top:"-15%", left:"-10%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,67,192,0.32) 0%,transparent 65%)", animation:"float1 10s ease-in-out infinite", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:640, height:640, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,126,104,0.22) 0%,transparent 65%)", animation:"float2 14s ease-in-out infinite", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"40%", right:"8%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(212,148,74,0.16) 0%,transparent 65%)", animation:"float3 18s ease-in-out infinite", pointerEvents:"none" }} />
          {/* grid */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize:"52px 52px", pointerEvents:"none" }} />

          {/* logo */}
          <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#4F43C0,#9B8FFF)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:22, color:"#fff", boxShadow:"0 4px 24px rgba(79,67,192,0.6)", flexShrink:0 }}>T</div>
            <div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, color:"#fff", letterSpacing:"-.02em", lineHeight:1 }}>Taalimy</div>
              <div style={{ fontSize:9, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", marginTop:3 }}>Staff Portal</div>
            </div>
          </div>

          {/* hero */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative" }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(155,143,255,0.75)", marginBottom:20 }}>School Management System</div>
            <h1 style={{ margin:"0 0 22px", fontFamily:"'Instrument Serif',serif", fontSize:"clamp(38px,3.5vw,54px)", color:"#fff", letterSpacing:"-.04em", lineHeight:1.08 }}>
              Manage your<br/>
              <span style={{ background:"linear-gradient(90deg,#9B8FFF 0%,#4EC9B0 50%,#56C785 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>school smarter.</span>
            </h1>
            <p style={{ margin:"0 0 44px", fontSize:15.5, color:"rgba(255,255,255,0.38)", lineHeight:1.75, maxWidth:360 }}>
              Teachers, students, grades, timetables, payments — unified in one powerful platform built for modern schools.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {[
                { text:"Real-time attendance tracking",   color:"#4EC9B0", delay:".30s" },
                { text:"Gradebook & bulletin generation", color:"#9B8FFF", delay:".38s" },
                { text:"Smart timetable management",      color:"#56C785", delay:".46s" },
                { text:"Parent portal & approvals",       color:"#D4944A", delay:".54s" },
              ].map((f,i) => (
                <div key={i} className="feat" style={{ animationDelay:f.delay, display:"flex", alignItems:"center", gap:13 }}>
                  <div style={{ width:26, height:26, borderRadius:8, flexShrink:0, background:`${f.color}15`, border:`1px solid ${f.color}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:f.color, fontWeight:900 }}>✓</div>
                  <span style={{ fontSize:14.5, color:"rgba(255,255,255,0.52)" }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* stats */}
          <div style={{ position:"relative", borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:32, display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { value:"48+",  label:"Teachers" },
              { value:"620+", label:"Students" },
              { value:"32",   label:"Classes"  },
              { value:"18",   label:"Subjects"  },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,0.07)":"none", padding:"0 10px" }}>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:30, color:"#fff", letterSpacing:"-.04em", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", marginTop:6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT PANEL — theme-aware form
        ════════════════════════════════════════ */}
        <div className="lr" style={{
          flex: 1,
          background: RIGHT_BG,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "56px 72px",
          position: "relative", overflow: "hidden",
          transition: "background .3s",
        }}>
          {/* right orbs */}
          <div style={{ position:"absolute", top:"-12%", right:"-8%", width:420, height:420, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(155,143,255,0.13) 0%,transparent 70%)" : "radial-gradient(circle,rgba(79,67,192,0.09) 0%,transparent 70%)", pointerEvents:"none", transition:"background .3s" }} />
          <div style={{ position:"absolute", bottom:"-12%", left:"-8%", width:380, height:380, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(78,201,176,0.10) 0%,transparent 70%)" : "radial-gradient(circle,rgba(14,126,104,0.08) 0%,transparent 70%)", pointerEvents:"none", transition:"background .3s" }} />

          <div style={{ width:"100%", maxWidth:420, position:"relative" }}>

            {/* header */}
            <div style={{ marginBottom:48 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:14, transition:"color .3s" }}>Welcome back</div>
              <h2 style={{ margin:"0 0 12px", fontFamily:"'Instrument Serif',serif", fontSize:40, color:TEXT_HEA, letterSpacing:"-.04em", lineHeight:1.05, transition:"color .3s" }}>Sign in</h2>
              <p style={{ margin:0, fontSize:15, color:TEXT_SUB, lineHeight:1.6, transition:"color .3s" }}>Enter your staff credentials to continue</p>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit}>
              <div className={shake ? "lshake" : ""} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* identifier */}
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color: focusId ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    placeholder="Identifier / Phone"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(""); }}
                    onFocus={() => setFocusId(true)}
                    onBlur={()  => setFocusId(false)}
                    autoFocus
                    style={{
                      width:"100%", boxSizing:"border-box",
                      padding:"16px 16px 16px 48px",
                      background: focusId ? INPUT_FOC_BG : INPUT_BG,
                      border: `1.5px solid ${focusId ? INPUT_FOC_BD : INPUT_BD}`,
                      borderRadius:14,
                      color: INPUT_FG,
                      fontFamily:"'Instrument Sans',sans-serif",
                      fontSize:15, outline:"none",
                      boxShadow: focusId ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                      transition:"border-color .2s, background .2s, box-shadow .2s",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  />
                </div>

                {/* password */}
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color: focusPw ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <input
                    placeholder="Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onFocus={() => setFocusPw(true)}
                    onBlur={()  => setFocusPw(false)}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      padding:"16px 50px 16px 48px",
                      background: focusPw ? INPUT_FOC_BG : INPUT_BG,
                      border: `1.5px solid ${focusPw ? INPUT_FOC_BD : INPUT_BD}`,
                      borderRadius:14,
                      color: INPUT_FG,
                      fontFamily:"'Instrument Sans',sans-serif",
                      fontSize:15, outline:"none",
                      boxShadow: focusPw ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                      transition:"border-color .2s, background .2s, box-shadow .2s",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8, transition:"color .15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = D ? "rgba(255,255,255,0.7)" : "rgba(15,21,32,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.color = ICON_COL}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>

                {/* error */}
                {error && (
                  <div style={{ padding:"13px 16px", borderRadius:12, background:ERR_BG, border:`1px solid ${ERR_BD}`, display:"flex", gap:10, alignItems:"center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ERR_COL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span style={{ fontSize:13.5, color:ERR_COL }}>{error}</span>
                  </div>
                )}

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop:8, width:"100%", padding:"16px",
                    borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,#9B8FFF 0%,#6B5FE8 50%,#4F43C0 100%)",
                    color:"#fff",
                    fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing:".02em",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow:"0 8px 32px rgba(79,67,192,0.45)",
                    transition:"transform .15s, box-shadow .15s, opacity .15s",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 14px 44px rgba(79,67,192,0.65)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 32px rgba(79,67,192,0.45)"; }}
                  onMouseDown={e  => { if (!loading) e.currentTarget.style.transform="scale(.98)"; }}
                  onMouseUp={e    => { if (!loading) e.currentTarget.style.transform="translateY(-2px)"; }}
                >
                  {loading ? (
                    <><span style={{ width:16, height:16, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> Signing in…</>
                  ) : (
                    <>Sign in <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                  )}
                </button>
              </div>
            </form>

            {/* footer */}
            <div style={{ marginTop:44, paddingTop:28, borderTop:`1px solid ${DIV_LINE}`, display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"border-color .3s" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#56C785", boxShadow:"0 0 8px #56C785" }} />
              <span style={{ fontSize:12.5, color:FOOT_TXT, transition:"color .3s" }}>Secured with JWT authentication</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}