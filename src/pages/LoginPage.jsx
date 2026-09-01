import { useState, useEffect } from "react";
import { BASE_URL } from "../api";
import { useStandaloneLanguage } from "../LanguageContext";

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

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}

export default function LoginPage({ onLogin, isDark, onToggleTheme, banner, onClearBanner, onGoAuth }) {
  const { t, lang, setLang } = useStandaloneLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [shake,      setShake]      = useState(false);
  const [focusId,    setFocusId]    = useState(false);
  const [focusPw,    setFocusPw]    = useState(false);
  const isRTL = lang === "ar";
  const toggleLang = () => setLang(lang === "fr" ? "ar" : "fr");

  /* auto-dismiss banner after 6s */
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => onClearBanner?.(), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  const D = isDark;

  /* ── tokens ── */
  const PAGE_BG = D
    ? "radial-gradient(circle at 18% 18%, rgba(107,95,232,0.20) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(78,201,176,0.14) 0%, transparent 42%), #0B0A16"
    : "radial-gradient(circle at 18% 18%, rgba(107,95,232,0.10) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(78,201,176,0.09) 0%, transparent 42%), #F6F6FC";
  const CARD_BG   = D ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.86)";
  const CARD_BD   = D ? "rgba(255,255,255,0.09)"  : "rgba(15,21,32,0.07)";
  const CARD_SH   = D ? "0 30px 90px rgba(0,0,0,0.55)" : "0 30px 80px rgba(31,25,80,0.10)";
  const TEXT_HEA  = D ? "#ffffff"                   : "#0F1520";
  const TEXT_SUB  = D ? "rgba(255,255,255,0.40)"    : "rgba(15,21,32,0.48)";
  const TEXT_TINY = D ? "rgba(155,143,255,0.80)"    : "rgba(79,67,192,0.80)";
  const INPUT_BG  = D ? "rgba(255,255,255,0.05)"    : "rgba(15,21,32,0.035)";
  const INPUT_BD  = D ? "rgba(255,255,255,0.10)"    : "rgba(15,21,32,0.13)";
  const INPUT_FG  = D ? "#ffffff"                   : "#0F1520";
  const INPUT_FOC_BD = D ? "rgba(155,143,255,0.65)" : "rgba(79,67,192,0.55)";
  const INPUT_FOC_SH = D ? "rgba(155,143,255,0.14)" : "rgba(79,67,192,0.10)";
  const INPUT_FOC_BG = D ? "rgba(255,255,255,0.09)" : "rgba(15,21,32,0.02)";
  const ICON_COL  = D ? "rgba(255,255,255,0.30)"    : "rgba(15,21,32,0.32)";
  const ICON_FOC  = D ? "rgba(155,143,255,0.9)"     : "rgba(79,67,192,0.9)";
  const DIV_LINE  = D ? "rgba(255,255,255,0.08)"    : "rgba(15,21,32,0.08)";
  const FOOT_TXT  = D ? "rgba(255,255,255,0.30)"    : "rgba(15,21,32,0.40)";
  const TOG_BG    = D ? "rgba(255,255,255,0.08)"    : "rgba(15,21,32,0.06)";
  const TOG_BD    = D ? "rgba(255,255,255,0.13)"    : "rgba(15,21,32,0.11)";
  const TOG_COL   = D ? "rgba(255,255,255,0.55)"    : "rgba(15,21,32,0.55)";
  const ERR_BG    = D ? "rgba(224,112,112,0.10)"    : "rgba(184,53,53,0.07)";
  const ERR_BD    = D ? "rgba(224,112,112,0.22)"    : "rgba(184,53,53,0.18)";
  const ERR_COL   = D ? "#E07070"                   : "#B83535";
  const SUC_BG    = D ? "rgba(86,199,133,0.10)"     : "rgba(42,117,64,0.08)";
  const SUC_BD    = D ? "rgba(86,199,133,0.25)"     : "rgba(42,117,64,0.20)";
  const SUC_COL   = D ? "#56C785"                   : "#2A7540";
  const LINK_COL  = D ? "rgba(155,143,255,0.90)"    : "rgba(79,67,192,0.90)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError(t("login.errFillFields"));
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
          ? t("login.errInvalidCredentials")
          : err.message || t("login.errFailed")
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
        @keyframes cardIn {
          from{ opacity:0; transform:translateY(18px) scale(.98); }
          to  { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes bannerIn {
          from{ opacity:0; transform:translateY(-8px); }
          to  { opacity:1; transform:translateY(0); }
        }
        @keyframes floatA {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(30px,-24px) scale(1.06); }
        }
        @keyframes floatB {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(-24px,28px) scale(1.04); }
        }
        .lp-card { animation: cardIn .55s cubic-bezier(.22,1,.36,1) both; }
        .lp-shake { animation: shakeX .5s ease-out; }
        .lp-banner { animation: bannerIn .3s ease-out both; }
      `}</style>

      <div dir={isRTL ? "rtl" : "ltr"} style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: isRTL ? "'Cairo','Noto Naskh Arabic',sans-serif" : "'Instrument Sans', sans-serif",
        background: PAGE_BG, transition: "background .3s",
        overflow: "hidden", padding: 24,
      }}>
        {/* ambient orbs */}
        <div style={{ position:"absolute", top:"-10%", left:"-8%", width:420, height:420, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(107,95,232,0.20) 0%,transparent 68%)" : "radial-gradient(circle,rgba(107,95,232,0.10) 0%,transparent 68%)", animation:"floatA 12s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-14%", right:"-8%", width:460, height:460, borderRadius:"50%", background: D ? "radial-gradient(circle,rgba(78,201,176,0.14) 0%,transparent 68%)" : "radial-gradient(circle,rgba(78,201,176,0.09) 0%,transparent 68%)", animation:"floatB 15s ease-in-out infinite", pointerEvents:"none" }} />

        {/* language toggle */}
        <button onClick={toggleLang}
          title={t("sidebar.changeLanguage")}
          style={{
            position: "absolute", top: 22, right: 70, zIndex: 100,
            display: "flex", alignItems: "center", gap: 6,
            height: 40, padding: "0 12px", borderRadius: 11,
            background: TOG_BG, border: `1.5px solid ${TOG_BD}`,
            color: TOG_COL, cursor: "pointer",
            transition: "background .2s, border-color .2s, color .2s, transform .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.background=D?"rgba(255,255,255,0.14)":"rgba(15,21,32,0.10)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.background=TOG_BG; e.currentTarget.style.color=TOG_COL; }}
        >
          <GlobeIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{lang}</span>
        </button>

        {/* theme toggle */}
        <button onClick={onToggleTheme}
          title={D ? t("common.switchToLight") : t("common.switchToDark")}
          style={{
            position: "absolute", top: 22, right: 24, zIndex: 100,
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
        <div className="lp-card" style={{
          width: "100%", maxWidth: 404, position: "relative",
          background: CARD_BG, border: `1px solid ${CARD_BD}`,
          borderRadius: 26, padding: "44px 38px 34px",
          boxShadow: CARD_SH,
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          transition: "background .3s, border-color .3s",
        }}>

          {/* brand mark */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:30 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#4F43C0,#9B8FFF)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Instrument Serif',serif", fontSize:21, color:"#fff", boxShadow:"0 4px 22px rgba(79,67,192,0.5)" }}>T</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:19, color:TEXT_HEA, letterSpacing:"-.02em", lineHeight:1, transition:"color .3s" }}>Taalimy</div>
              <div style={{ fontSize:9, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color: D ? "rgba(255,255,255,0.28)" : "rgba(15,21,32,0.34)", marginTop:5 }}>{t("login.staffPortal")}</div>
            </div>
          </div>

          {/* banner */}
          {banner && (
            <div className="lp-banner" style={{
              marginBottom:22, padding:"12px 14px", borderRadius:12,
              background:SUC_BG, border:`1px solid ${SUC_BD}`,
              display:"flex", gap:9, alignItems:"flex-start",
            }}>
              <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, background:D?"rgba(86,199,133,0.20)":"rgba(42,117,64,0.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:SUC_COL, fontWeight:700, marginTop:1 }}>✓</div>
              <span style={{ fontSize:13, color:SUC_COL, lineHeight:1.45, flex:1 }}>{banner}</span>
              <button type="button" onClick={onClearBanner} style={{ background:"none", border:"none", cursor:"pointer", color:SUC_COL, opacity:.6, padding:0, fontSize:13, flexShrink:0, marginTop:1 }}>✕</button>
            </div>
          )}

          {/* heading */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:10, transition:"color .3s" }}>{t("login.welcomeBack")}</div>
            <h2 style={{ margin:"0 0 8px", fontFamily:"'Instrument Serif',serif", fontSize:32, color:TEXT_HEA, letterSpacing:"-.03em", lineHeight:1.05, transition:"color .3s" }}>{t("login.signIn")}</h2>
            <p style={{ margin:0, fontSize:13.5, color:TEXT_SUB, lineHeight:1.5, transition:"color .3s" }}>{t("login.signInSub")}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={shake ? "lp-shake" : ""} style={{ display:"flex", flexDirection:"column", gap:14 }}>

              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color: focusId ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                  <UserIcon />
                </div>
                <input
                  placeholder={t("login.identifierPlaceholder")}
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(""); }}
                  onFocus={() => setFocusId(true)}
                  onBlur={()  => setFocusId(false)}
                  autoFocus
                  style={{
                    width:"100%", boxSizing:"border-box",
                    padding:"14px 14px 14px 45px",
                    background: focusId ? INPUT_FOC_BG : INPUT_BG,
                    border: `1.5px solid ${focusId ? INPUT_FOC_BD : INPUT_BD}`,
                    borderRadius:13, color: INPUT_FG,
                    fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:14.5, outline:"none",
                    boxShadow: focusId ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                    transition:"border-color .2s, background .2s, box-shadow .2s",
                    appearance:"none", WebkitAppearance:"none",
                  }}
                />
              </div>

              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color: focusPw ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                  <LockIcon />
                </div>
                <input
                  placeholder={t("login.passwordPlaceholder")}
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onFocus={() => setFocusPw(true)}
                  onBlur={()  => setFocusPw(false)}
                  style={{
                    width:"100%", boxSizing:"border-box",
                    padding:"14px 46px 14px 45px",
                    background: focusPw ? INPUT_FOC_BG : INPUT_BG,
                    border: `1.5px solid ${focusPw ? INPUT_FOC_BD : INPUT_BD}`,
                    borderRadius:13, color: INPUT_FG,
                    fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:14.5, outline:"none",
                    boxShadow: focusPw ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                    transition:"border-color .2s, background .2s, box-shadow .2s",
                    appearance:"none", WebkitAppearance:"none",
                  }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: ICON_COL, padding:6, display:"flex", alignItems:"center", borderRadius:8, transition:"color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = D ? "rgba(255,255,255,0.7)" : "rgba(15,21,32,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = ICON_COL}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>

              {error && (
                <div style={{ padding:"12px 14px", borderRadius:12, background:ERR_BG, border:`1px solid ${ERR_BD}`, display:"flex", gap:9, alignItems:"center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ERR_COL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize:13, color:ERR_COL }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop:6, width:"100%", padding:"14.5px",
                  borderRadius:13, border:"none",
                  background:"linear-gradient(135deg,#9B8FFF 0%,#6B5FE8 50%,#4F43C0 100%)",
                  color:"#fff", fontFamily:"'Instrument Sans',sans-serif",
                  fontSize:14.5, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing:".02em",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 8px 28px rgba(79,67,192,0.42)",
                  transition:"transform .15s, box-shadow .15s, opacity .15s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 38px rgba(79,67,192,0.58)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 28px rgba(79,67,192,0.42)"; }}
                onMouseDown={e  => { if (!loading) e.currentTarget.style.transform="scale(.98)"; }}
                onMouseUp={e    => { if (!loading) e.currentTarget.style.transform="translateY(-2px)"; }}
              >
                {loading ? (
                  <><span style={{ width:15, height:15, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> {t("login.signingIn")}</>
                ) : (
                  <>{t("login.signIn")} <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                )}
              </button>
            </div>
          </form>

          {/* footer */}
          {onGoAuth && (
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${DIV_LINE}`, textAlign:"center" }}>
              <span style={{ fontSize:13, color:FOOT_TXT }}>{t("login.firstTimeHere")}</span>
              <button
                onClick={onGoAuth}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight:600, color:LINK_COL, padding:0, transition:"opacity .15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity=".7"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                {t("login.setupAccount")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}