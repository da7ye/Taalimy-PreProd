import { useState } from "react";
import { BASE_URL } from "../api";

/* ─── tiny icons ─────────────────────────────────────────── */
function PhoneIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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

export default function AuthPage({ onGoLogin, onGoSetup, isDark, onToggleTheme }) {
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [focus,   setFocus]   = useState(false);
  const [shake,   setShake]   = useState(false);

  const D = isDark;

  /* ── right panel theming (mirrors LoginPage) ── */
  const RIGHT_BG    = D ? "linear-gradient(160deg,#13111E 0%,#0E0C1A 100%)" : "linear-gradient(160deg,#F4F6FF 0%,#EDF0FA 100%)";
  const TEXT_HEA    = D ? "#ffffff"                 : "#0F1520";
  const TEXT_SUB    = D ? "rgba(255,255,255,0.38)"  : "rgba(15,21,32,0.48)";
  const TEXT_TINY   = D ? "rgba(155,143,255,0.75)"  : "rgba(79,67,192,0.75)";
  const INPUT_BG    = D ? "rgba(255,255,255,0.06)"  : "rgba(15,21,32,0.05)";
  const INPUT_BD    = D ? "rgba(255,255,255,0.10)"  : "rgba(15,21,32,0.14)";
  const INPUT_FG    = D ? "#ffffff"                 : "#0F1520";
  const INPUT_FOC_BD = D ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.60)";
  const INPUT_FOC_SH = D ? "rgba(155,143,255,0.13)" : "rgba(79,67,192,0.10)";
  const INPUT_FOC_BG = D ? "rgba(255,255,255,0.10)" : "rgba(15,21,32,0.03)";
  const ICON_COL    = D ? "rgba(255,255,255,0.28)"  : "rgba(15,21,32,0.32)";
  const ICON_FOC    = D ? "rgba(155,143,255,0.9)"   : "rgba(79,67,192,0.9)";
  const DIV_LINE    = D ? "rgba(255,255,255,0.07)"  : "rgba(15,21,32,0.09)";
  const FOOT_TXT    = D ? "rgba(255,255,255,0.22)"  : "rgba(15,21,32,0.35)";
  const TOG_BG      = D ? "rgba(255,255,255,0.08)"  : "rgba(15,21,32,0.07)";
  const TOG_BD      = D ? "rgba(255,255,255,0.13)"  : "rgba(15,21,32,0.13)";
  const TOG_COL     = D ? "rgba(255,255,255,0.55)"  : "rgba(15,21,32,0.55)";
  const ERR_BG      = D ? "rgba(224,112,112,0.10)"  : "rgba(184,53,53,0.08)";
  const ERR_BD      = D ? "rgba(224,112,112,0.22)"  : "rgba(184,53,53,0.20)";
  const ERR_COL     = D ? "#E07070"                 : "#B83535";
  const BACK_COL    = D ? "rgba(255,255,255,0.18)"  : "rgba(15,21,32,0.16)";
  const BACK_BD     = D ? "rgba(255,255,255,0.10)"  : "rgba(15,21,32,0.12)";

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Please enter your phone number.");
      triggerShake(); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/password-forget-code?phone=${encodeURIComponent(trimmed)}`, {
        method: "POST",
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (_) { /* non-JSON 200 */ }

      if (data.businessErrorCode === 1500 || (data.error && data.error.toLowerCase().includes("not found"))) {
        setError("Phone number not found. Please check and try again.");
        triggerShake(); return;
      }

      if (data.success === true || data.message?.toLowerCase().includes("already have account")) {
        /* user already has account → go to login */
        onGoLogin({ alreadyHasAccount: true });
        return;
      }

      if (data.success === false || data.message?.toLowerCase().includes("new code")) {
        /* OTP sent → go to setup */
        onGoSetup({ phone: trimmed });
        return;
      }

      /* fallback */
      setError("Unexpected response. Please try again.");
      triggerShake();
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
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
        @keyframes float1 {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(40px,-30px) scale(1.08); }
        }
        @keyframes float2 {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(-30px,40px) scale(1.05); }
        }
        @keyframes pulseRing {
          0%  { transform:scale(1);   opacity:.6; }
          100%{ transform:scale(1.6); opacity:0; }
        }
        @keyframes dotPop {
          0%,100%{ transform:scale(1);   opacity:.55; }
          50%    { transform:scale(1.35); opacity:1; }
        }
        .auth-enter { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) both; }
        .auth-shake { animation: shakeX .5s ease-out; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", fontFamily: "'Instrument Sans', sans-serif",
      }}>

        {/* ── theme toggle ── */}
        <button onClick={onToggleTheme}
          title={D ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position: "absolute", top: 22, right: 24, zIndex: 100,
            width: 40, height: 40, borderRadius: 11,
            background: TOG_BG, border: `1.5px solid ${TOG_BD}`,
            color: TOG_COL, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background .2s, border-color .2s, color .2s, transform .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.background=D?"rgba(255,255,255,0.14)":"rgba(15,21,32,0.12)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.background=TOG_BG; e.currentTarget.style.color=TOG_COL; }}
        >
          {D ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* ══════════════════════════════════════════
            LEFT PANEL — illustration / info
        ══════════════════════════════════════════ */}
        <div style={{
          width: "52%", flexShrink: 0,
          background: "linear-gradient(160deg,#12102A 0%,#0D1A14 65%,#0A0E1F 100%)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          padding: "56px 72px",
          animation: "fadeSlideUp .7s cubic-bezier(.22,1,.36,1) both",
        }}>
          {/* orbs */}
          <div style={{ position:"absolute", top:"-15%", left:"-10%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,67,192,0.32) 0%,transparent 65%)", animation:"float1 10s ease-in-out infinite", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:640, height:640, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,126,104,0.22) 0%,transparent 65%)", animation:"float2 14s ease-in-out infinite", pointerEvents:"none" }} />
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

          {/* centre illustration */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-start", position:"relative" }}>
            {/* animated phone badge */}
            <div style={{ position:"relative", width:80, height:80, marginBottom:36 }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(155,143,255,0.18)", animation:"pulseRing 2.2s ease-out infinite" }} />
              <div style={{ position:"absolute", inset:8, borderRadius:"50%", background:"rgba(155,143,255,0.12)", animation:"pulseRing 2.2s ease-out .4s infinite" }} />
              <div style={{ width:80, height:80, borderRadius:22, background:"linear-gradient(135deg,#4F43C0,#9B8FFF)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(79,67,192,0.55)", position:"relative" }}>
                <PhoneIcon color="#fff" />
              </div>
            </div>

            <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(155,143,255,0.75)", marginBottom:16 }}>Account Setup</div>
            <h1 style={{ margin:"0 0 18px", fontFamily:"'Instrument Serif',serif", fontSize:"clamp(34px,3.2vw,50px)", color:"#fff", letterSpacing:"-.04em", lineHeight:1.1 }}>
              First time<br/>
              <span style={{ background:"linear-gradient(90deg,#9B8FFF 0%,#4EC9B0 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>here?</span>
            </h1>
            <p style={{ margin:"0 0 40px", fontSize:15, color:"rgba(255,255,255,0.40)", lineHeight:1.8, maxWidth:360 }}>
              Your account was pre-created by the admin. Enter the phone number they used — we'll verify it and guide you through setting up your password.
            </p>

            {/* steps */}
            {[
              { n:"1", label:"Enter your registered phone number", color:"#9B8FFF" },
              { n:"2", label:"Receive a one-time code via SMS",     color:"#4EC9B0" },
              { n:"3", label:"Set your personal password",          color:"#56C785" },
            ].map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14, animation:`fadeSlideUp .5s ease-out ${.3+i*.1}s both` }}>
                <div style={{ width:30, height:30, borderRadius:10, flexShrink:0, background:`${s.color}18`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:14, color:s.color }}>{s.n}</div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.50)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* bottom note */}
          <div style={{ position:"relative", borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:24, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#56C785", boxShadow:"0 0 8px #56C785", animation:"dotPop 2s ease-in-out infinite", flexShrink:0 }} />
            <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.25)" }}>Already have an account? Use the Sign in link below.</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — form
        ══════════════════════════════════════════ */}
        <div className="auth-enter" style={{
          flex:1, background: RIGHT_BG,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"56px 72px", position:"relative", overflow:"hidden",
          transition:"background .3s",
        }}>
          {/* right orbs */}
          <div style={{ position:"absolute", top:"-12%", right:"-8%", width:420, height:420, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(155,143,255,0.13) 0%,transparent 70%)" : "radial-gradient(circle,rgba(79,67,192,0.09) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-12%", left:"-8%", width:380, height:380, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(78,201,176,0.10) 0%,transparent 70%)" : "radial-gradient(circle,rgba(14,126,104,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

          <div style={{ width:"100%", maxWidth:420, position:"relative" }}>

            {/* back to login */}
            <button
              onClick={() => onGoLogin({})}
              style={{
                display:"inline-flex", alignItems:"center", gap:7, marginBottom:40,
                background:"none", border:`1px solid ${BACK_BD}`, borderRadius:10,
                padding:"7px 14px", cursor:"pointer", color:BACK_COL,
                fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight:500,
                transition:"background .15s, color .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background=D?"rgba(255,255,255,0.08)":"rgba(15,21,32,0.06)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
              onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=BACK_COL; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Sign in
            </button>

            {/* header */}
            <div style={{ marginBottom:44 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:14, transition:"color .3s" }}>First-time access</div>
              <h2 style={{ margin:"0 0 12px", fontFamily:"'Instrument Serif',serif", fontSize:40, color:TEXT_HEA, letterSpacing:"-.04em", lineHeight:1.05, transition:"color .3s" }}>Verify phone</h2>
              <p style={{ margin:0, fontSize:15, color:TEXT_SUB, lineHeight:1.65, transition:"color .3s" }}>Enter the phone number your admin registered for your account.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={shake ? "auth-shake" : ""} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* phone input */}
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color: focus ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                    <PhoneIcon />
                  </div>
                  <input
                    placeholder="e.g. +222 XX XX XX XX"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(""); }}
                    onFocus={() => setFocus(true)}
                    onBlur={()  => setFocus(false)}
                    autoFocus
                    type="tel"
                    style={{
                      width:"100%", boxSizing:"border-box",
                      padding:"16px 16px 16px 48px",
                      background: focus ? INPUT_FOC_BG : INPUT_BG,
                      border: `1.5px solid ${focus ? INPUT_FOC_BD : INPUT_BD}`,
                      borderRadius:14, color: INPUT_FG,
                      fontFamily:"'Instrument Sans',sans-serif",
                      fontSize:15, outline:"none",
                      boxShadow: focus ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                      transition:"border-color .2s, background .2s, box-shadow .2s",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  />
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
                    marginTop:8, width:"100%", padding:"16px", borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,#9B8FFF 0%,#6B5FE8 50%,#4F43C0 100%)",
                    color:"#fff", fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing:".02em",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow:"0 8px 32px rgba(79,67,192,0.45)",
                    transition:"transform .15s, box-shadow .15s, opacity .15s",
                    opacity: loading ? .6 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 14px 44px rgba(79,67,192,0.65)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 32px rgba(79,67,192,0.45)"; }}
                  onMouseDown={e  => { if (!loading) e.currentTarget.style.transform="scale(.98)"; }}
                  onMouseUp={e    => { if (!loading) e.currentTarget.style.transform="translateY(-2px)"; }}
                >
                  {loading ? (
                    <><span style={{ width:16, height:16, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> Checking…</>
                  ) : (
                    <>Continue <ArrowIcon /></>
                  )}
                </button>
              </div>
            </form>

            {/* footer */}
            <div style={{ marginTop:44, paddingTop:28, borderTop:`1px solid ${DIV_LINE}`, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontSize:13, color:FOOT_TXT }}>Already have an account?</span>
              <button
                onClick={() => onGoLogin({})}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight:600, color:D?"rgba(155,143,255,0.9)":"rgba(79,67,192,0.9)", padding:0, transition:"opacity .15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity=".7"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                Sign in →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}