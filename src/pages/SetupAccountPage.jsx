import { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../api";

/* ─── icons ──────────────────────────────────────────────── */
function LockIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

function BackIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

/* ── tiny OTP digit box ── */
function OtpBox({ value, onChange, onKeyDown, inputRef, isDark, hasError }) {
  const BG  = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,21,32,0.035)";
  const BD  = hasError
    ? (isDark ? "rgba(224,112,112,0.6)" : "rgba(184,53,53,0.55)")
    : value
      ? (isDark ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.60)")
      : (isDark ? "rgba(255,255,255,0.10)" : "rgba(15,21,32,0.13)");
  const SH  = hasError
    ? (isDark ? "rgba(224,112,112,0.13)" : "rgba(184,53,53,0.10)")
    : value
      ? (isDark ? "rgba(155,143,255,0.14)" : "rgba(79,67,192,0.10)")
      : "none";
  const FG  = isDark ? "#ffffff" : "#0F1520";
  const FGB = value
    ? (isDark ? "rgba(155,143,255,0.10)" : "rgba(79,67,192,0.05)")
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
        width:"100%", aspectRatio:"1", maxWidth:52, height:56, textAlign:"center",
        background: FGB,
        border:`2px solid ${BD}`,
        borderRadius:13, color:FG,
        fontFamily:"'Instrument Serif',serif",
        fontSize:24, fontWeight:400, outline:"none",
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

  /* ── tokens (mirrors LoginPage / AuthPage) ── */
  const PAGE_BG = D
    ? "radial-gradient(circle at 18% 18%, rgba(78,201,176,0.16) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(107,95,232,0.16) 0%, transparent 42%), #0B0A16"
    : "radial-gradient(circle at 18% 18%, rgba(78,201,176,0.08) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(107,95,232,0.09) 0%, transparent 42%), #F6F6FC";
  const CARD_BG    = D ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.86)";
  const CARD_BD    = D ? "rgba(255,255,255,0.09)"  : "rgba(15,21,32,0.07)";
  const CARD_SH    = D ? "0 30px 90px rgba(0,0,0,0.55)" : "0 30px 80px rgba(31,25,80,0.10)";
  const TEXT_HEA    = D ? "#ffffff"                 : "#0F1520";
  const TEXT_SUB    = D ? "rgba(255,255,255,0.40)"  : "rgba(15,21,32,0.48)";
  const TEXT_TINY   = D ? "rgba(78,201,176,0.85)"   : "rgba(14,126,104,0.85)";
  const INPUT_BG    = D ? "rgba(255,255,255,0.05)"  : "rgba(15,21,32,0.035)";
  const INPUT_BD    = D ? "rgba(255,255,255,0.10)"  : "rgba(15,21,32,0.13)";
  const INPUT_FG    = D ? "#ffffff"                 : "#0F1520";
  const INPUT_FOC_BD = D ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.55)";
  const INPUT_FOC_SH = D ? "rgba(155,143,255,0.14)" : "rgba(79,67,192,0.10)";
  const INPUT_FOC_BG = D ? "rgba(255,255,255,0.09)" : "rgba(15,21,32,0.02)";
  const ICON_COL    = D ? "rgba(255,255,255,0.30)"  : "rgba(15,21,32,0.32)";
  const ICON_FOC    = D ? "rgba(155,143,255,0.9)"   : "rgba(79,67,192,0.9)";
  const DIV_LINE    = D ? "rgba(255,255,255,0.08)"  : "rgba(15,21,32,0.08)";
  const FOOT_TXT    = D ? "rgba(255,255,255,0.30)"  : "rgba(15,21,32,0.40)";
  const TOG_BG      = D ? "rgba(255,255,255,0.08)"  : "rgba(15,21,32,0.06)";
  const TOG_BD      = D ? "rgba(255,255,255,0.13)"  : "rgba(15,21,32,0.11)";
  const TOG_COL     = D ? "rgba(255,255,255,0.55)"  : "rgba(15,21,32,0.55)";
  const ERR_BG      = D ? "rgba(224,112,112,0.10)"  : "rgba(184,53,53,0.07)";
  const ERR_BD      = D ? "rgba(224,112,112,0.22)"  : "rgba(184,53,53,0.18)";
  const ERR_COL     = D ? "#E07070"                 : "#B83535";
  const BACK_COL    = D ? "rgba(255,255,255,0.55)"  : "rgba(15,21,32,0.50)";
  const BACK_BD     = D ? "rgba(255,255,255,0.10)"  : "rgba(15,21,32,0.10)";
  const MUTED_TXT   = D ? "rgba(255,255,255,0.32)"  : "rgba(15,21,32,0.34)";
  const STR_BAR_BG  = D ? "rgba(255,255,255,0.08)"  : "rgba(15,21,32,0.07)";
  const LINK_COL    = D ? "rgba(155,143,255,0.90)"  : "rgba(79,67,192,0.90)";

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
  const tips = [
    { label:"8+ characters", check: newPw.length >= 8 },
    { label:"Uppercase",     check: /[A-Z]/.test(newPw) },
    { label:"Number",        check: /[0-9]/.test(newPw) },
    { label:"Symbol",        check: /[^A-Za-z0-9]/.test(newPw) },
  ];

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
        @keyframes cardIn {
          from{ opacity:0; transform:translateY(18px) scale(.98); }
          to  { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes floatA {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(30px,-24px) scale(1.06); }
        }
        @keyframes floatB {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(-24px,28px) scale(1.04); }
        }
        .sp-card { animation: cardIn .55s cubic-bezier(.22,1,.36,1) both; }
        .sp-shake { animation: shakeX .5s ease-out; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Instrument Sans', sans-serif",
        background: PAGE_BG, transition: "background .3s",
        overflow: "auto", padding: "40px 24px",
      }}>
        {/* ambient orbs */}
        <div style={{ position:"fixed", top:"-10%", left:"-8%", width:420, height:420, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(78,201,176,0.16) 0%,transparent 68%)" : "radial-gradient(circle,rgba(78,201,176,0.08) 0%,transparent 68%)", animation:"floatA 12s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-14%", right:"-8%", width:460, height:460, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(107,95,232,0.16) 0%,transparent 68%)" : "radial-gradient(circle,rgba(107,95,232,0.09) 0%,transparent 68%)", animation:"floatB 15s ease-in-out infinite", pointerEvents:"none" }} />

        {/* theme toggle */}
        <button onClick={onToggleTheme}
          title={D ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position: "fixed", top: 22, right: 24, zIndex: 100,
            width: 40, height: 40, borderRadius: 11,
            background: TOG_BG, border: `1.5px solid ${TOG_BD}`,
            color: TOG_COL, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background .2s, border-color .2s, color .2s, transform .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.background=D?"rgba(255,255,255,0.14)":"rgba(15,21,32,0.10)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.background=TOG_BG; e.currentTarget.style.color=TOG_COL; }}
        >
          {D ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* ── card ── */}
        <div className="sp-card" style={{
          width: "100%", maxWidth: 440, position: "relative",
          background: CARD_BG, border: `1px solid ${CARD_BD}`,
          borderRadius: 26, padding: "38px 38px 34px",
          boxShadow: CARD_SH,
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          transition: "background .3s, border-color .3s",
        }}>

          {/* back to login */}
          <button
            onClick={() => onGoLogin({})}
            style={{
              display:"inline-flex", alignItems:"center", gap:6, marginBottom:24,
              background:"none", border:`1px solid ${BACK_BD}`, borderRadius:9,
              padding:"6px 12px", cursor:"pointer", color:BACK_COL,
              fontFamily:"'Instrument Sans',sans-serif", fontSize:12.5, fontWeight:500,
              transition:"background .15s, color .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background=D?"rgba(255,255,255,0.08)":"rgba(15,21,32,0.05)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
            onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=BACK_COL; }}
          >
            <BackIcon /> Back to sign in
          </button>

          {/* brand mark */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#1AAFA0,#4EC9B0)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:21, color:"#fff", boxShadow:"0 4px 22px rgba(14,126,104,0.45)" }}>T</div>
          </div>

          {/* heading */}
          <div style={{ textAlign:"center", marginBottom:26 }}>
            <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:10, transition:"color .3s" }}>Set up your account</div>
            <h2 style={{ margin:"0 0 8px", fontFamily:"'Instrument Serif',serif", fontSize:30, color:TEXT_HEA, letterSpacing:"-.03em", lineHeight:1.1, transition:"color .3s" }}>Create password</h2>
            <p style={{ margin:0, fontSize:13.5, color:TEXT_SUB, lineHeight:1.55, transition:"color .3s" }}>
              Enter the code sent to <strong style={{ color: D ? "rgba(155,143,255,0.9)" : "rgba(79,67,192,0.9)", fontWeight:600 }}>{phone}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={shake ? "sp-shake" : ""} style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* ── OTP row ── */}
              <div>
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
                  <div style={{ marginTop:9, fontSize:12.5, color:MUTED_TXT, textAlign:"center" }}>
                    Didn't get it? <button type="button" onClick={() => {}} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'Instrument Sans',sans-serif",fontSize:12.5,fontWeight:600,color:LINK_COL,padding:0 }}>Resend code</button>
                  </div>
                )}
              </div>

              <div style={{ height:1, background:DIV_LINE }} />

              {/* ── new password ── */}
              <div>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color: focusNew ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                    <LockIcon />
                  </div>
                  <input
                    placeholder="New password"
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setError(""); }}
                    onFocus={() => setFocusNew(true)}
                    onBlur={()  => setFocusNew(false)}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      padding:"14px 46px 14px 45px",
                      background: focusNew ? INPUT_FOC_BG : INPUT_BG,
                      border:`1.5px solid ${focusNew ? INPUT_FOC_BD : INPUT_BD}`,
                      borderRadius:13, color:INPUT_FG,
                      fontFamily:"'Instrument Sans',sans-serif",
                      fontSize:14.5, outline:"none",
                      boxShadow: focusNew ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                      transition:"border-color .2s, background .2s, box-shadow .2s",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8 }}>
                    <EyeIcon open={showNew} />
                  </button>
                </div>

                {/* strength bar + inline tips */}
                {newPw.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <div style={{ flex:1, height:4, borderRadius:4, background:STR_BAR_BG, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:4,
                          width:`${(strength/4)*100}%`,
                          background: STRENGTH_COLORS[strength] || "transparent",
                          transition:"width .3s ease, background .3s ease",
                        }} />
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:600, color: STRENGTH_COLORS[strength] || "transparent", minWidth:38, textAlign:"right", transition:"color .3s" }}>
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {tips.map((tip, i) => (
                        <span key={i} style={{
                          fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
                          color: tip.check ? "#56C785" : MUTED_TXT,
                          background: tip.check ? (D ? "rgba(86,199,133,0.14)" : "rgba(42,117,64,0.09)") : (D ? "rgba(255,255,255,0.05)" : "rgba(15,21,32,0.04)"),
                          border: `1px solid ${tip.check ? "rgba(86,199,133,0.35)" : (D ? "rgba(255,255,255,0.08)" : "rgba(15,21,32,0.08)")}`,
                          transition:"color .2s, background .2s, border-color .2s",
                        }}>
                          {tip.check ? "✓ " : ""}{tip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── confirm password ── */}
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color: focusCon ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
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
                    padding:"14px 68px 14px 45px",
                    background: focusCon ? INPUT_FOC_BG : INPUT_BG,
                    border:`1.5px solid ${focusCon ? INPUT_FOC_BD : INPUT_BD}`,
                    borderRadius:13, color:INPUT_FG,
                    fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:14.5, outline:"none",
                    boxShadow: focusCon ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                    transition:"border-color .2s, background .2s, box-shadow .2s",
                    appearance:"none", WebkitAppearance:"none",
                  }}
                />
                {confirmPw.length > 0 && newPw.length > 0 && (
                  <span style={{
                    position:"absolute", right:44, top:"50%", transform:"translateY(-50%)",
                    fontSize:13, fontWeight:700,
                    color: confirmPw === newPw ? "#56C785" : "#E07070",
                    pointerEvents:"none",
                  }}>
                    {confirmPw === newPw ? "✓" : "✕"}
                  </span>
                )}
                <button type="button" onClick={() => setShowConf(v => !v)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8 }}>
                  <EyeIcon open={showConf} />
                </button>
              </div>

              {/* error */}
              {error && (
                <div style={{ padding:"12px 14px", borderRadius:12, background:ERR_BG, border:`1px solid ${ERR_BD}`, display:"flex", gap:9, alignItems:"center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ERR_COL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize:13, color:ERR_COL }}>{error}</span>
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading || !codeComplete}
                style={{
                  marginTop:4, width:"100%", padding:"14.5px", borderRadius:13, border:"none",
                  background:"linear-gradient(135deg,#4EC9B0 0%,#1AAFA0 50%,#0E7E68 100%)",
                  color:"#fff", fontFamily:"'Instrument Sans',sans-serif",
                  fontSize:14.5, fontWeight:700,
                  cursor: loading || !codeComplete ? "not-allowed" : "pointer",
                  letterSpacing:".02em",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow: codeComplete ? "0 8px 28px rgba(14,126,104,0.42)" : "none",
                  transition:"transform .15s, box-shadow .15s, opacity .15s",
                  opacity: loading || !codeComplete ? .5 : 1,
                }}
                onMouseEnter={e => { if (!loading && codeComplete) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 38px rgba(14,126,104,0.60)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=codeComplete?"0 8px 28px rgba(14,126,104,0.42)":"none"; }}
                onMouseDown={e  => { if (!loading && codeComplete) e.currentTarget.style.transform="scale(.98)"; }}
                onMouseUp={e    => { if (!loading && codeComplete) e.currentTarget.style.transform="translateY(-2px)"; }}
              >
                {loading ? (
                  <><span style={{ width:15, height:15, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> Setting up…</>
                ) : (
                  <>Activate account <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>
                )}
              </button>
            </div>
          </form>

          {/* footer */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${DIV_LINE}`, textAlign:"center" }}>
            <span style={{ fontSize:13, color:FOOT_TXT }}>Remember your password? </span>
            <button
              onClick={() => onGoLogin({})}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight:600, color:LINK_COL, padding:0, transition:"opacity .15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity=".7"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Sign in →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}