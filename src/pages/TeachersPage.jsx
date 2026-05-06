import { useEffect, useState, useMemo } from "react";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from "../api";
import { Field, Input, SubmitBtn } from "../components/FormComponents";
import { usePersonForm } from "../hooks/usePersonForm";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLanguage } from "../LanguageContext";

const C_COLOR = "var(--accent)";
const C_BG    = "var(--violet-dim)";

function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "none", border: "none", cursor: "pointer",
      color: "var(--text-muted)", fontSize: 13, fontFamily: "'Instrument Sans', sans-serif",
      padding: 0, marginBottom: 28, transition: "color .13s",
    }}
    onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      {label}
    </button>
  );
}

function PageTitle({ crumb, title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-label" style={{ marginBottom: 6 }}>{crumb}</div>
      <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.03em" }}>{title}</h1>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function TeacherCard({ r, onClick, onEdit, onDelete, t }) {
  return (
    <div className="person-card" style={{ "--card-top": C_COLOR }} onClick={() => onClick(r)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: C_BG, color: C_COLOR, border: `1.5px solid ${C_COLOR}28`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>
          {(r.firstname?.[0] ?? "?").toUpperCase()}
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(r)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.edit")}</button>
          <button onClick={() => onDelete(r)} className="btn-danger" style={{ padding: "5px 12px", fontSize: 12 }}>{t("common.delete")}</button>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{r.firstname} {r.lastname}</div>
        {r.speciality && <span style={{ display: "inline-block", marginTop: 5, padding: "2px 9px", borderRadius: 999, background: C_BG, color: C_COLOR, fontSize: 11.5, fontWeight: 600, border: `1px solid ${C_COLOR}22` }}>{r.speciality}</span>}
      </div>
      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 5 }}>
        {r.email && <div style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✉ {r.email}</div>}
        {r.phone && <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>📞 {r.phone}</div>}
      </div>
      <div style={{ position: "absolute", top: 14, right: 14, width: 7, height: 7, borderRadius: "50%", background: r.isApprove ? "var(--green)" : "var(--amber)", boxShadow: r.isApprove ? "0 0 0 2px var(--green-dim)" : "0 0 0 2px var(--amber-dim)" }} />
    </div>
  );
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function FormPanel({ children, onSubmit }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
      <form onSubmit={onSubmit} style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
        {children}
      </form>
    </div>
  );
}

function SidePanel({ title, items, accentColor, accentBg, initial }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: accentBg, color: accentColor, border: `2px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 30, margin: "0 auto 14px" }}>
          {initial || "?"}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{title}</div>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <div className="section-label" style={{ marginBottom: 12 }}>{items.sectionLabel}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.list.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView]         = useState("list");
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [q, setQ]               = useState("");
  const { form, set, setForm }  = usePersonForm();
  const [speciality, setSpeciality] = useState("");
  const [editForm, setEditForm] = useState({});
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const load = () => { setLoading(true); getTeachers().then(setData).catch(e => toast(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    if (!q.trim()) return arr;
    const lq = q.toLowerCase();
    return arr.filter(r => `${r.firstname} ${r.lastname}`.toLowerCase().includes(lq) || r.email?.toLowerCase().includes(lq) || r.speciality?.toLowerCase().includes(lq));
  }, [data, q]);

  const goList = () => { setView("list"); setSelected(null); };

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createTeacher({ registrationRequest: form, speciality }); setForm({ firstname: "", lastname: "", email: "", phone: "", nni: "" }); setSpeciality(""); toast(t("teachers.registered")); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const openEdit = r => { setEditForm({ id: r.id, firstname: r.firstname ?? "", lastname: r.lastname ?? "", email: r.email ?? "", phone: r.phone ?? "", nni: r.nni ?? "", speciality: r.speciality ?? "" }); setSelected(r); setView("edit"); };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateTeacher(selected.id, editForm); toast(t("teachers.updated")); load(); goList(); }
    catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteTeacher(deleteTarget.id); setDeleteTarget(null); toast(t("teachers.deleted")); load(); if (view !== "list") goList(); }
    catch (err) { toast(err.message, "error"); } finally { setDeleting(false); }
  };

  /* ══ LIST ══ */
  if (view === "list") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <PageTitle crumb={t("teachers.crumb")} title={t("teachers.title")} sub={loading ? t("common.loading") : `${filtered.length} ${t("teachers.title").toLowerCase()}`} />
        <button onClick={() => setView("create")} className="btn-primary" style={{ marginBottom: 32 }}>{t("teachers.addBtn")}</button>
      </div>
      <div className="search-wrap" style={{ maxWidth: 300, marginBottom: 24 }}>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="search-input" placeholder={t("teachers.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? <div className="empty-state"><div className="spinner" style={{ width: 22, height: 22 }} /><p>{t("common.loading")}</p></div>
      : filtered.length === 0 ? <div className="empty-state"><span style={{ fontSize: 36 }}>🎓</span><p>{q ? `${t("common.noResults")} "${q}"` : t("teachers.empty")}</p></div>
      : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((r, i) => <TeacherCard key={r.id ?? i} r={r} t={t} onClick={r => { setSelected(r); setView("detail"); }} onEdit={openEdit} onDelete={target => setDeleteTarget(target)} />)}
        </div>}
      {deleteTarget && <ConfirmDialog title={t("teachers.deleteTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })} message={t("teachers.deleteMsg")} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </div>
  );

  /* ══ CREATE ══ */
  if (view === "create") return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("teachers.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("teachers.crumb")} · ${t("teachers.title")}`} title={t("teachers.registerTitle")} sub={t("teachers.registerSub")} />
      <TwoCol
        left={
          <FormPanel onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.firstName")}><Input placeholder={t("fields.firstNamePlaceholder")} value={form.firstname} onChange={set("firstname")} required /></Field>
              <Field label={t("fields.lastName")}><Input placeholder={t("fields.lastNamePlaceholder")} value={form.lastname} onChange={set("lastname")} required /></Field>
            </div>
            <Field label={t("fields.email")}><Input type="email" placeholder={t("fields.emailPlaceholder")} value={form.email} onChange={set("email")} required /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.phone")}><Input placeholder={t("fields.phonePlaceholder")} value={form.phone} onChange={set("phone")} required minLength={8} /></Field>
              <Field label={t("fields.nni")}><Input placeholder={t("fields.nniPlaceholder")} value={form.nni} onChange={set("nni")} required minLength={8} /></Field>
            </div>
            <Field label={t("teachers.speciality")}><Input placeholder={t("teachers.specialityPlaceholder")} value={speciality} onChange={e => setSpeciality(e.target.value)} /></Field>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
              <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("teachers.registerBtn")} /></div>
            </div>
          </FormPanel>
        }
        right={
          <SidePanel
            title={t("teachers.sideNote3")}
            initial={(form.firstname?.[0] ?? "?").toUpperCase()}
            accentColor={C_COLOR} accentBg={C_BG}
            items={{ sectionLabel: t("common.notes"), list: [
              { icon: "📧", text: t("teachers.sideNote1") },
              { icon: "🔢", text: t("teachers.sideNote2") },
              { icon: "✅", text: t("teachers.sideNote3") },
            ]}}
          />
        }
      />
    </div>
  );

  /* ══ EDIT ══ */
  if (view === "edit" && selected) return (
    <div className="page-enter" style={{ padding: "36px 44px" }}>
      <BackBtn label={t("teachers.detailBack")} onClick={goList} />
      <PageTitle crumb={`${t("teachers.crumb")} · ${t("teachers.title")}`} title={t("teachers.editTitle")} sub={t("teachers.editSub", { name: `${selected.firstname} ${selected.lastname}` })} />
      <TwoCol
        left={
          <FormPanel onSubmit={handleEdit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.firstName")}><Input value={editForm.firstname} onChange={setEdit("firstname")} required /></Field>
              <Field label={t("fields.lastName")}><Input value={editForm.lastname} onChange={setEdit("lastname")} required /></Field>
            </div>
            <Field label={t("fields.email")}><Input type="email" value={editForm.email} onChange={setEdit("email")} required /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("fields.phone")}><Input value={editForm.phone} onChange={setEdit("phone")} /></Field>
              <Field label={t("fields.nni")}><Input value={editForm.nni} onChange={setEdit("nni")} /></Field>
            </div>
            <Field label={t("teachers.speciality")}><Input value={editForm.speciality} onChange={setEdit("speciality")} /></Field>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={goList} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>{t("common.cancel")}</button>
              <div style={{ flex: 2 }}><SubmitBtn loading={saving} label={t("teachers.saveBtn")} /></div>
            </div>
          </FormPanel>
        }
        right={
          <SidePanel
            title={t("teachers.editSub", { name: `${selected.firstname} ${selected.lastname}` })}
            initial={(selected.firstname?.[0] ?? "?").toUpperCase()}
            accentColor={C_COLOR} accentBg={C_BG}
            items={{ sectionLabel: t("common.notes"), list: [
              { icon: "💡", text: t("teachers.editNote1") },
              { icon: "📧", text: t("teachers.editNote2") },
            ]}}
          />
        }
      />
    </div>
  );

  /* ══ DETAIL ══ */
  if (view === "detail" && selected) {
    const v = selected;
    return (
      <div className="page-enter" style={{ padding: "36px 44px" }}>
        <BackBtn label={t("teachers.detailBack")} onClick={goList} />
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: 90, background: `linear-gradient(135deg, ${C_COLOR}22 0%, ${C_COLOR}08 100%)`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C_COLOR}18 0%, transparent 60%)` }} />
          </div>
          <div style={{ padding: "0 36px 28px", marginTop: -36 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: C_BG, color: C_COLOR, border: `3px solid var(--bg-card)`, boxShadow: `0 0 0 2px ${C_COLOR}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 32, flexShrink: 0 }}>
                  {(v.firstname?.[0] ?? "T").toUpperCase()}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Instrument Serif', serif", color: "var(--text)", letterSpacing: "-.025em" }}>{v.firstname} {v.lastname}</h2>
                  <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                    {v.speciality && <span style={{ padding: "3px 11px", borderRadius: 999, background: C_BG, color: C_COLOR, fontSize: 12, fontWeight: 600, border: `1px solid ${C_COLOR}30` }}>{v.speciality}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: v.isApprove ? "var(--green-dim)" : "var(--amber-dim)", color: v.isApprove ? "var(--green)" : "var(--amber)", border: `1px solid ${v.isApprove ? "rgba(42,117,64,.25)" : "rgba(168,100,30,.25)"}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.isApprove ? "var(--green)" : "var(--amber)" }} />
                      {v.isApprove ? t("common.approved") : t("common.pending")}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => openEdit(v)} className="btn-ghost" style={{ padding: "10px 20px" }}>✏️ {t("common.edit")}</button>
                <button onClick={() => setDeleteTarget(v)} className="btn-danger" style={{ padding: "10px 20px" }}>🗑 {t("common.delete")}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <StatBox icon="✉️" label={t("teachers.fields.email")}     value={v.email}      color={C_COLOR} bg={C_BG} />
          <StatBox icon="📞" label={t("teachers.fields.phone")}     value={v.phone}      color={C_COLOR} bg={C_BG} />
          <StatBox icon="🪪" label={t("teachers.fields.nni")}       value={v.nni}        color={C_COLOR} bg={C_BG} />
          <StatBox icon="🎓" label={t("teachers.speciality")}       value={v.speciality} color={C_COLOR} bg={C_BG} />
          <StatBox icon="🆔" label={t("teachers.fields.userId")}    value={v.userId}     color={C_COLOR} bg={C_BG} />
          <StatBox icon="🎂" label={t("teachers.fields.dob")}       value={v.dateOfBrith} color={C_COLOR} bg={C_BG} />
        </div>
        {deleteTarget && <ConfirmDialog title={t("teachers.deleteTitle", { name: `${deleteTarget.firstname} ${deleteTarget.lastname}` })} message={t("teachers.deleteMsg")} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      </div>
    );
  }
  return null;
}