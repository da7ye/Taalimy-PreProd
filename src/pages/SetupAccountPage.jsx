import { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../api";

/* ─── icons ──────────────────────────────────────────────── */
function LockIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

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

/* ── tiny OTP digit box ── */
function OtpBox({ value, onChange, onKeyDown, inputRef, isDark, hasError }) {
  const BG  = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,21,32,0.05)";
  const BD  = hasError
    ? (isDark ? "rgba(224,112,112,0.6)" : "rgba(184,53,53,0.55)")
    : value
      ? (isDark ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.60)")
      : (isDark ? "rgba(255,255,255,0.10)" : "rgba(15,21,32,0.14)");
  const SH  = hasError
    ? (isDark ? "rgba(224,112,112,0.13)" : "rgba(184,53,53,0.10)")
    : value
      ? (isDark ? "rgba(155,143,255,0.13)" : "rgba(79,67,192,0.10)")
      : "none";
  const FG  = isDark ? "#ffffff" : "#0F1520";
  const FGB = value
    ? (isDark ? "rgba(155,143,255,0.10)" : "rgba(79,67,192,0.06)")
    : BG;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        width:56, height:64, textAlign:"center",
        background: FGB,
        border:`2px solid ${BD}`,
        borderRadius:14, color:FG,
        fontFamily:"'Instrument Serif',serif",
        fontSize:26, fontWeight:400, outline:"none",
        boxShadow: SH !== "none" ? `0 0 0 4px ${SH}` : "none",
        transition:"border-color .2s, background .2s, box-shadow .2s",
        appearance:"none", WebkitAppearance:"none",
        caretColor:"transparent",
      }}
    />
  );
}

/* ── password strength ── */
function strengthLevel(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#E07070", "#D4944A", "#4EC9B0", "#56C785"];

export default function SetupAccountPage({ phone, onGoLogin, isDark, onToggleTheme }) {
  const [digits,   setDigits]   = useState(["","","","","",""]);
  const [newPw,    setNewPw]    = useState("");
  const [confirmPw,setConfirmPw]= useState("");
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [codeErr,  setCodeErr]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [focusNew, setFocusNew] = useState(false);
  const [focusCon, setFocusCon] = useState(false);

  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  useEffect(() => { refs[0].current?.focus(); }, []);

  const D = isDark;
  const strength = strengthLevel(newPw);

  /* theming */
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
  const MUTED_TXT   = D ? "rgba(255,255,255,0.28)"  : "rgba(15,21,32,0.30)";
  const STR_BAR_BG  = D ? "rgba(255,255,255,0.07)"  : "rgba(15,21,32,0.07)";

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  /* OTP handlers */
  const handleDigit = (i, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next);
    setCodeErr(false); setError("");
    if (v && i < 5) refs[i+1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits]; next[i] = ""; setDigits(next);
      } else if (i > 0) {
        refs[i-1].current?.focus();
        const next = [...digits]; next[i-1] = ""; setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs[i-1].current?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs[i+1].current?.focus();
    }
  };

  /* paste support */
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let k = 0; k < 6; k++) next[k] = pasted[k] || "";
    setDigits(next);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(""); setCodeErr(false);

    const code = digits.join("");
    if (code.length < 6)  { setError("Please enter the full 6-digit code."); setCodeErr(true); triggerShake(); return; }
    if (!newPw)            { setError("Please enter a new password."); triggerShake(); return; }
    if (newPw.length < 8)  { setError("Password must be at least 8 characters."); triggerShake(); return; }
    if (newPw !== confirmPw){ setError("Passwords do not match."); triggerShake(); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        phone,
        code,
        newPassword:     newPw,
        confirmPassword: confirmPw,
      });
      const res = await fetch(`${BASE_URL}/auth/forget-password?${params}`, { method: "POST" });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (_) { /* plain string 200 */ }

      if (res.ok && !data.businessErrorCode) {
        onGoLogin({ setupSuccess: true });
        return;
      }

      if (data.businessErrorCode === 306 || data.error?.toLowerCase().includes("invalid code")) {
        setError("Invalid code. Please check the SMS and try again.");
        setCodeErr(true); triggerShake(); return;
      }

      setError(data.businessErrorDescription || data.error || "Something went wrong. Please try again.");
      triggerShake();
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const codeComplete = digits.every(d => d !== "");

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
        @keyframes checkPop {
          0%  { transform:scale(0) rotate(-20deg); opacity:0; }
          70% { transform:scale(1.15) rotate(3deg); opacity:1; }
          100%{ transform:scale(1) rotate(0); opacity:1; }
        }
        .setup-enter { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) both; }
        .setup-shake { animation: shakeX .5s ease-out; }
      `}</style>

      <div style={{
        position:"fixed", inset:0, zIndex:9999,
        display:"flex", fontFamily:"'Instrument Sans', sans-serif",
      }}>

        {/* theme toggle */}
        <button onClick={onToggleTheme}
          title={D ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position:"absolute", top:22, right:24, zIndex:100,
            width:40, height:40, borderRadius:11,
            background:TOG_BG, border:`1.5px solid ${TOG_BD}`,
            color:TOG_COL, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", transition:"background .2s, border-color .2s, color .2s, transform .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.background=D?"rgba(255,255,255,0.14)":"rgba(15,21,32,0.12)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.background=TOG_BG; e.currentTarget.style.color=TOG_COL; }}
        >
          {D ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* ════════════════════════════
            LEFT PANEL
        ════════════════════════════ */}
        <div style={{
          width:"52%", flexShrink:0,
          background:"linear-gradient(160deg,#12102A 0%,#0D1A14 65%,#0A0E1F 100%)",
          position:"relative", overflow:"hidden",
          display:"flex", flexDirection:"column",
          padding:"56px 72px",
          animation:"fadeSlideUp .7s cubic-bezier(.22,1,.36,1) both",
        }}>
          <div style={{ position:"absolute", top:"-15%", left:"-10%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,67,192,0.32) 0%,transparent 65%)", animation:"float1 10s ease-in-out infinite", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:640, height:640, borderRadius:"50%", background:"radial-gradient(circle,rgba(78,201,176,0.22) 0%,transparent 65%)", animation:"float2 14s ease-in-out infinite", pointerEvents:"none" }} />
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
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(78,201,176,0.75)", marginBottom:16 }}>Account Setup</div>
            <h1 style={{ margin:"0 0 18px", fontFamily:"'Instrument Serif',serif", fontSize:"clamp(34px,3.2vw,50px)", color:"#fff", letterSpacing:"-.04em", lineHeight:1.1 }}>
              Secure your<br/>
              <span style={{ background:"linear-gradient(90deg,#4EC9B0 0%,#56C785 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>account.</span>
            </h1>
            <p style={{ margin:"0 0 36px", fontSize:15, color:"rgba(255,255,255,0.38)", lineHeight:1.8, maxWidth:340 }}>
              A one-time code was just sent to<br/>
              <span style={{ color:"rgba(155,143,255,0.85)", fontWeight:600 }}>{phone}</span>
            </p>

            {/* password tips */}
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, border:"1px solid rgba(255,255,255,0.08)", padding:"20px 22px", marginBottom:0 }}>
              <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,0.30)", marginBottom:14 }}>Password tips</div>
              {[
                { label:"At least 8 characters",     check: newPw.length >= 8 },
                { label:"One uppercase letter (A–Z)", check: /[A-Z]/.test(newPw) },
                { label:"One number (0–9)",           check: /[0-9]/.test(newPw) },
                { label:"One special character",      check: /[^A-Za-z0-9]/.test(newPw) },
              ].map((tip, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:i<3?10:0 }}>
                  <div style={{
                    width:18, height:18, borderRadius:6, flexShrink:0,
                    background: tip.check ? "rgba(86,199,133,0.20)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${tip.check ? "rgba(86,199,133,0.45)" : "rgba(255,255,255,0.10)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"background .2s, border-color .2s",
                    fontSize:10, color: tip.check ? "#56C785" : "transparent",
                    animation: tip.check ? "checkPop .3s ease-out" : "none",
                  }}>✓</div>
                  <span style={{ fontSize:13, color: tip.check ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.32)", transition:"color .2s" }}>{tip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* footer */}
          <div style={{ position:"relative", borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:24, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#56C785", boxShadow:"0 0 8px #56C785", flexShrink:0 }} />
            <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.25)" }}>Secured with JWT authentication</span>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT PANEL — form
        ════════════════════════════ */}
        <div className="setup-enter" style={{
          flex:1, background:RIGHT_BG,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 64px", position:"relative", overflow:"hidden",
          overflowY:"auto", transition:"background .3s",
        }}>
          <div style={{ position:"absolute", top:"-12%", right:"-8%", width:420, height:420, borderRadius:"50%", background:D?"radial-gradient(circle,rgba(78,201,176,0.10) 0%,transparent 70%)":"radial-gradient(circle,rgba(14,126,104,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-12%", left:"-8%", width:380, height:380, borderRadius:"50%", background:D?"radial-gradient(circle,rgba(155,143,255,0.10) 0%,transparent 70%)":"radial-gradient(circle,rgba(79,67,192,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />

          <div style={{ width:"100%", maxWidth:420, position:"relative" }}>

            {/* back */}
            <button
              onClick={() => onGoLogin({})}
              style={{
                display:"inline-flex", alignItems:"center", gap:7, marginBottom:36,
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
            <div style={{ marginBottom:36 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:14 }}>Set up your account</div>
              <h2 style={{ margin:"0 0 10px", fontFamily:"'Instrument Serif',serif", fontSize:38, color:TEXT_HEA, letterSpacing:"-.04em", lineHeight:1.05 }}>Create password</h2>
              <p style={{ margin:0, fontSize:14.5, color:TEXT_SUB, lineHeight:1.65 }}>Enter the code sent to <strong style={{ color:D?"rgba(155,143,255,0.85)":"rgba(79,67,192,0.85)", fontWeight:600 }}>{phone}</strong> and choose a new password.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={shake ? "setup-shake" : ""} style={{ display:"flex", flexDirection:"column", gap:18 }}>

                {/* ── OTP row ── */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:D?"rgba(255,255,255,0.28)":"rgba(15,21,32,0.30)", marginBottom:12 }}>Verification code</div>
                  <div
                    style={{ display:"flex", gap:8, justifyContent:"space-between" }}
                    onPaste={handlePaste}
                  >
                    {digits.map((d, i) => (
                      <OtpBox
                        key={i}
                        value={d}
                        isDark={D}
                        hasError={codeErr}
                        inputRef={refs[i]}
                        onChange={e  => handleDigit(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                      />
                    ))}
                  </div>
                  {!codeErr && (
                    <div style={{ marginTop:9, fontSize:12.5, color:MUTED_TXT }}>
                      Check your SMS — didn't get it? <button type="button" onClick={() => {}} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'Instrument Sans',sans-serif",fontSize:12.5,fontWeight:600,color:D?"rgba(155,143,255,0.85)":"rgba(79,67,192,0.85)",padding:0 }}>Resend</button>
                    </div>
                  )}
                </div>

                {/* divider */}
                <div style={{ height:1, background:DIV_LINE }} />

                {/* ── new password ── */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:D?"rgba(255,255,255,0.28)":"rgba(15,21,32,0.30)", marginBottom:12 }}>New password</div>
                  <div style={{ position:"relative", marginBottom:10 }}>
                    <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color: focusNew ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                      <LockIcon />
                    </div>
                    <input
                      placeholder="At least 8 characters"
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={e => { setNewPw(e.target.value); setError(""); }}
                      onFocus={() => setFocusNew(true)}
                      onBlur={()  => setFocusNew(false)}
                      style={{
                        width:"100%", boxSizing:"border-box",
                        padding:"15px 50px 15px 48px",
                        background: focusNew ? INPUT_FOC_BG : INPUT_BG,
                        border:`1.5px solid ${focusNew ? INPUT_FOC_BD : INPUT_BD}`,
                        borderRadius:14, color:INPUT_FG,
                        fontFamily:"'Instrument Sans',sans-serif",
                        fontSize:15, outline:"none",
                        boxShadow: focusNew ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                        transition:"border-color .2s, background .2s, box-shadow .2s",
                        appearance:"none", WebkitAppearance:"none",
                      }}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8 }}>
                      <EyeIcon open={showNew} />
                    </button>
                  </div>

                  {/* strength bar */}
                  {newPw.length > 0 && (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:4, borderRadius:4, background:STR_BAR_BG, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:4,
                          width:`${(strength/4)*100}%`,
                          background: STRENGTH_COLORS[strength] || "#transparent",
                          transition:"width .3s ease, background .3s ease",
                        }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color: STRENGTH_COLORS[strength] || "transparent", minWidth:44, transition:"color .3s" }}>
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── confirm password ── */}
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color: focusCon ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                    <LockIcon />
                  </div>
                  <input
                    placeholder="Confirm new password"
                    type={showConf ? "text" : "password"}
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setError(""); }}
                    onFocus={() => setFocusCon(true)}
                    onBlur={()  => setFocusCon(false)}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      padding:"15px 50px 15px 48px",
                      background: focusCon ? INPUT_FOC_BG : INPUT_BG,
                      border:`1.5px solid ${focusCon ? INPUT_FOC_BD : INPUT_BD}`,
                      borderRadius:14, color:INPUT_FG,
                      fontFamily:"'Instrument Sans',sans-serif",
                      fontSize:15, outline:"none",
                      boxShadow: focusCon ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                      transition:"border-color .2s, background .2s, box-shadow .2s",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8 }}>
                    <EyeIcon open={showConf} />
                  </button>
                  {/* match indicator */}
                  {confirmPw.length > 0 && newPw.length > 0 && (
                    <div style={{
                      position:"absolute", right:46, top:"50%", transform:"translateY(-50%)",
                      fontSize:13, fontWeight:700,
                      color: confirmPw === newPw ? "#56C785" : "#E07070",
                      pointerEvents:"none",
                    }}>
                      {confirmPw === newPw ? "✓" : "✕"}
                    </div>
                  )}
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
                  disabled={loading || !codeComplete}
                  style={{
                    marginTop:4, width:"100%", padding:"16px", borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,#4EC9B0 0%,#1AAFA0 50%,#0E7E68 100%)",
                    color:"#fff", fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:15, fontWeight:700,
                    cursor: loading || !codeComplete ? "not-allowed" : "pointer",
                    letterSpacing:".02em",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow: codeComplete ? "0 8px 32px rgba(14,126,104,0.45)" : "none",
                    transition:"transform .15s, box-shadow .15s, opacity .15s",
                    opacity: loading || !codeComplete ? .5 : 1,
                  }}
                  onMouseEnter={e => { if (!loading && codeComplete) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 14px 44px rgba(14,126,104,0.65)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=codeComplete?"0 8px 32px rgba(14,126,104,0.45)":"none"; }}
                  onMouseDown={e  => { if (!loading && codeComplete) e.currentTarget.style.transform="scale(.98)"; }}
                  onMouseUp={e    => { if (!loading && codeComplete) e.currentTarget.style.transform="translateY(-2px)"; }}
                >
                  {loading ? (
                    <><span style={{ width:16, height:16, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> Setting up…</>
                  ) : (
                    <>Activate account <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>
                  )}
                </button>
              </div>
            </form>

            {/* footer */}
            <div style={{ marginTop:36, paddingTop:24, borderTop:`1px solid ${DIV_LINE}`, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontSize:13, color:FOOT_TXT }}>Remember your password?</span>
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