import { useState } from "react";
import { BASE_URL } from "../api";
import { useStandaloneLanguage } from "../LanguageContext";

/* ─── tiny icons ─────────────────────────────────────────── */
function PhoneIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}

export default function AuthPage({ onGoLogin, onGoSetup, isDark, onToggleTheme }) {
  const { t, lang, setLang } = useStandaloneLanguage();
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [focus,   setFocus]   = useState(false);
  const [shake,   setShake]   = useState(false);

  const D = isDark;
  const isRTL = lang === "ar";
  const toggleLang = () => setLang(lang === "fr" ? "ar" : "fr");

  /* ── tokens (mirrors LoginPage) ── */
  const PAGE_BG = D
    ? "radial-gradient(circle at 18% 18%, rgba(107,95,232,0.20) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(78,201,176,0.14) 0%, transparent 42%), #0B0A16"
    : "radial-gradient(circle at 18% 18%, rgba(107,95,232,0.10) 0%, transparent 42%), radial-gradient(circle at 84% 82%, rgba(78,201,176,0.09) 0%, transparent 42%), #F6F6FC";
  const CARD_BG    = D ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.86)";
  const CARD_BD    = D ? "rgba(255,255,255,0.09)"  : "rgba(15,21,32,0.07)";
  const CARD_SH    = D ? "0 30px 90px rgba(0,0,0,0.55)" : "0 30px 80px rgba(31,25,80,0.10)";
  const TEXT_HEA    = D ? "#ffffff"                 : "#0F1520";
  const TEXT_SUB    = D ? "rgba(255,255,255,0.40)"  : "rgba(15,21,32,0.48)";
  const TEXT_TINY   = D ? "rgba(155,143,255,0.80)"  : "rgba(79,67,192,0.80)";
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
  const LINK_COL    = D ? "rgba(155,143,255,0.90)"  : "rgba(79,67,192,0.90)";
  const BACK_COL    = D ? "rgba(255,255,255,0.55)"  : "rgba(15,21,32,0.50)";
  const BACK_BD     = D ? "rgba(255,255,255,0.10)"  : "rgba(15,21,32,0.10)";

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = phone.trim();
    if (!trimmed) {
      setError(t("auth.errEnterPhone"));
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
        setError(t("auth.errPhoneNotFound"));
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
      setError(t("auth.errUnexpected"));
      triggerShake();
    } catch (err) {
      setError(err.message || t("auth.errNetwork"));
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
        .ap-card { animation: cardIn .55s cubic-bezier(.22,1,.36,1) both; }
        .ap-shake { animation: shakeX .5s ease-out; }
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
        <div className="ap-card" style={{
          width: "100%", maxWidth: 404, position: "relative",
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
              display:"inline-flex", alignItems:"center", gap:6, marginBottom:26,
              background:"none", border:`1px solid ${BACK_BD}`, borderRadius:9,
              padding:"6px 12px", cursor:"pointer", color:BACK_COL,
              fontFamily:"'Instrument Sans',sans-serif", fontSize:12.5, fontWeight:500,
              transition:"background .15s, color .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background=D?"rgba(255,255,255,0.08)":"rgba(15,21,32,0.05)"; e.currentTarget.style.color=D?"#fff":"#0F1520"; }}
            onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=BACK_COL; }}
          >
            <BackIcon /> {t("auth.backToSignIn")}
          </button>

          {/* brand mark */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:26 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#4F43C0,#9B8FFF)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 22px rgba(79,67,192,0.5)" }}>
              <PhoneIcon color="#fff" />
            </div>
          </div>

          {/* heading */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:TEXT_TINY, marginBottom:10, transition:"color .3s" }}>{t("auth.firstTimeAccess")}</div>
            <h2 style={{ margin:"0 0 8px", fontFamily:"'Instrument Serif',serif", fontSize:32, color:TEXT_HEA, letterSpacing:"-.03em", lineHeight:1.05, transition:"color .3s" }}>{t("auth.verifyPhone")}</h2>
            <p style={{ margin:0, fontSize:13.5, color:TEXT_SUB, lineHeight:1.55, transition:"color .3s" }}>{t("auth.verifyPhoneSub")}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={shake ? "ap-shake" : ""} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* phone input */}
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color: focus ? ICON_FOC : ICON_COL, transition:"color .2s", pointerEvents:"none", display:"flex" }}>
                  <PhoneIcon />
                </div>
                <input
                  placeholder={t("auth.phonePlaceholder")}
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(""); }}
                  onFocus={() => setFocus(true)}
                  onBlur={()  => setFocus(false)}
                  autoFocus
                  type="tel"
                  style={{
                    width:"100%", boxSizing:"border-box",
                    padding:"14px 14px 14px 45px",
                    background: focus ? INPUT_FOC_BG : INPUT_BG,
                    border: `1.5px solid ${focus ? INPUT_FOC_BD : INPUT_BD}`,
                    borderRadius:13, color: INPUT_FG,
                    fontFamily:"'Instrument Sans',sans-serif",
                    fontSize:14.5, outline:"none",
                    boxShadow: focus ? `0 0 0 4px ${INPUT_FOC_SH}` : "none",
                    transition:"border-color .2s, background .2s, box-shadow .2s",
                    appearance:"none", WebkitAppearance:"none",
                  }}
                />
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
                disabled={loading}
                style={{
                  marginTop:6, width:"100%", padding:"14.5px", borderRadius:13, border:"none",
                  background:"linear-gradient(135deg,#9B8FFF 0%,#6B5FE8 50%,#4F43C0 100%)",
                  color:"#fff", fontFamily:"'Instrument Sans',sans-serif",
                  fontSize:14.5, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing:".02em",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 8px 28px rgba(79,67,192,0.42)",
                  transition:"transform .15s, box-shadow .15s, opacity .15s",
                  opacity: loading ? .6 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 38px rgba(79,67,192,0.58)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 28px rgba(79,67,192,0.42)"; }}
                onMouseDown={e  => { if (!loading) e.currentTarget.style.transform="scale(.98)"; }}
                onMouseUp={e    => { if (!loading) e.currentTarget.style.transform="translateY(-2px)"; }}
              >
                {loading ? (
                  <><span style={{ width:15, height:15, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite", flexShrink:0 }} /> {t("auth.checking")}</>
                ) : (
                  <>{t("auth.continueBtn")} <ArrowIcon /></>
                )}
              </button>
            </div>
          </form>

          {/* footer */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${DIV_LINE}`, textAlign:"center" }}>
            <span style={{ fontSize:13, color:FOOT_TXT }}>{t("auth.alreadyHaveAccount")}</span>
            <button
              onClick={() => onGoLogin({})}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", fontSize:13, fontWeight:600, color:LINK_COL, padding:0, transition:"opacity .15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity=".7"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              {t("auth.signIn")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}