// ══ TimetablePage.jsx (i18n) ══════════════════════════════

import { useEffect, useState, useMemo } from "react";
import { getTimetables, createTimetable, updateTimetable, deleteTimetable, getClasseNames, getTeacherNames, getAssignments } from "../api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Field, Input, Select, SubmitBtn } from "../components/FormComponents";
import { useToast } from "../components/Toast";
import DetailPanel, { DetailSection, DetailRow } from "../components/DetailPanel";
import { useLanguage } from "../LanguageContext";

const COLOR = "from-[#6c63ff] to-[#3ecfcf]";
const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_STYLE = {
  MONDAY:    { color:"var(--violet)", bg:"var(--violet-dim)", border:"rgba(79,67,192,.2)" },
  TUESDAY:   { color:"var(--teal)",   bg:"var(--teal-dim)",   border:"rgba(14,126,104,.2)" },
  WEDNESDAY: { color:"var(--rose)",   bg:"var(--rose-dim)",   border:"rgba(184,53,53,.2)" },
  THURSDAY:  { color:"var(--amber)",  bg:"var(--amber-dim)",  border:"rgba(168,100,30,.2)" },
  FRIDAY:    { color:"var(--green)",  bg:"var(--green-dim)",  border:"rgba(42,117,64,.2)" },
  SATURDAY:  { color:"var(--blue)",   bg:"var(--blue-dim)",   border:"rgba(30,80,184,.2)" },
  SUNDAY:    { color:"var(--rose)",   bg:"var(--rose-dim)",   border:"rgba(184,53,53,.2)" },
};
const EMPTY = { id:"",dayOfWeek:"",startTime:"",endTime:"",room:"",teacherAssignmentId:"" };

export default function TimetablePage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [viewTarget, setViewTarget]   = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [editForm, setEditForm]       = useState({});
  const [filterDay, setFilterDay]     = useState("ALL");
  const [filterClass, setFilterClass] = useState("ALL");
  const [q, setQ]                     = useState("");
  const [assignments, setAssignments] = useState([]);
  const set     = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const load = () => {
    setLoading(true);
    Promise.all([getTimetables(), getClasseNames(), getTeacherNames(), getAssignments()])
      .then(([tt, , , a]) => { setData(Array.isArray(tt) ? tt : []); setAssignments(Array.isArray(a) ? a : []); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => data.filter(r => {
    const md = filterDay   === "ALL" || r.dayOfWeek  === filterDay;
    const mc = filterClass === "ALL" || r.classeName === filterClass;
    const mq = !q.trim() || [r.teacherName,r.matiereName,r.room,r.classeName].some(x=>x?.toLowerCase().includes(q.toLowerCase()));
    return md && mc && mq;
  }), [data, filterDay, filterClass, q]);

  const classNames = useMemo(() => [...new Set(data.map(r => r.classeName).filter(Boolean))], [data]);
  const byDay = useMemo(() => {
    const m = {}; DAYS.forEach(d => { m[d] = []; });
    filtered.forEach(r => { if (r.dayOfWeek) m[r.dayOfWeek]?.push(r); });
    DAYS.forEach(d => m[d].sort((a,b)=>(a.startTime??"").localeCompare(b.startTime??"")));
    return m;
  }, [filtered]);

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true);
    try { await createTimetable({ ...form, teacherAssignmentId: parseInt(form.teacherAssignmentId)||undefined }); setModal(false); setForm(EMPTY); toast(t("timetable.created")); load(); }
    catch (err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const openEdit = r => {
    setEditForm({ id:r.id, dayOfWeek:r.dayOfWeek??"", startTime:r.startTime??"", endTime:r.endTime??"", room:r.room??"", teacherAssignmentId:r.teacherAssignmentId??"" });
    setViewTarget(null); setEditTarget(r);
  };

  const handleEdit = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateTimetable(editTarget.id, { ...editForm, teacherAssignmentId: parseInt(editForm.teacherAssignmentId)||null }); setEditTarget(null); toast(t("timetable.updated")); load(); }
    catch (err) { toast(err.message,"error"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteTimetable(deleteTarget.id); setDeleteTarget(null); setViewTarget(null); toast(t("timetable.deleted")); load(); }
    catch (err) { toast(err.message,"error"); } finally { setDeleting(false); }
  };

  const daysToShow = filterDay === "ALL" ? DAYS.filter(d=>byDay[d]?.length>0) : [filterDay];
  const v = viewTarget;

  const daySelectOptions = (
    <>
      <option value="">— {t("timetable.fields.day")} —</option>
      {DAYS.map(d => <option key={d} value={d}>{t(`timetable.days.${d}`)}</option>)}
    </>
  );

  return (
    <>
      <div className="page-enter" style={{ padding:"32px 36px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <div className="section-label" style={{ marginBottom:6 }}>{t("timetable.crumb")}</div>
            <h1 style={{ margin:0, fontSize:24, fontFamily:"'Instrument Serif', serif", color:"var(--text)", letterSpacing:"-.03em" }}>{t("timetable.title")}</h1>
            <p style={{ margin:"5px 0 0", fontSize:13.5, color:"var(--text-muted)" }}>
              {loading ? t("common.loading") : t("timetable.sessions", { n: filtered.length })}
            </p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary">{t("timetable.addBtn")}</button>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
          <div className="search-wrap" style={{ flex:"0 0 220px" }}>
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" placeholder={t("timetable.searchPlaceholder")} value={q} onChange={e => setQ(e.target.value)} />
          </div>

          <div style={{ display:"flex", gap:3, padding:4, borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)" }}>
            {["ALL",...DAYS].map(d => {
              const isActive = filterDay === d;
              const ds = d !== "ALL" ? DAY_STYLE[d] : null;
              return (
                <button key={d} onClick={() => setFilterDay(d)} style={{
                  padding:"5px 11px", borderRadius:7, border:"none", cursor:"pointer",
                  background: isActive ? (ds ? ds.bg : "var(--surface-hover)") : "transparent",
                  color: isActive ? (ds ? ds.color : "var(--text)") : "var(--text-muted)",
                  fontSize:12, fontWeight: isActive?600:400,
                  fontFamily:"'Instrument Sans',sans-serif", transition:"all .14s",
                }}>
                  {d === "ALL" ? t("timetable.filterAll") : t(`timetable.daysShort.${d}`)}
                </button>
              );
            })}
          </div>

          {classNames.length > 0 && (
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="t-select" style={{ width:"auto", minWidth:130, fontSize:13 }}>
              <option value="ALL">{t("timetable.allClasses")}</option>
              {classNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width:22, height:22 }} /><p>{t("timetable.loadingMsg")}</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span style={{ fontSize:36 }}>🗓️</span><p>{t("timetable.empty")}</p></div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:30 }}>
            {daysToShow.map(day => byDay[day]?.length > 0 && (
              <div key={day}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <span style={{ padding:"3px 14px", borderRadius:999, background:DAY_STYLE[day].bg, color:DAY_STYLE[day].color, border:`1px solid ${DAY_STYLE[day].border}`, fontSize:11.5, fontWeight:700, letterSpacing:".05em" }}>
                    {t(`timetable.days.${day}`)}
                  </span>
                  <div style={{ flex:1, height:1, background:"var(--border)" }} />
                  <span style={{ fontSize:11.5, color:"var(--text-faint)" }}>{byDay[day].length} session{byDay[day].length!==1?"s":""}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
                  {byDay[day].map((r, i) => {
                    const ds = DAY_STYLE[r.dayOfWeek] || DAY_STYLE.MONDAY;
                    return (
                      <div key={r.id??i} className="card" style={{ padding:"16px 18px", cursor:"pointer", position:"relative" }} onClick={() => setViewTarget(r)}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                          <span style={{ padding:"3px 10px", borderRadius:999, background:ds.bg, color:ds.color, border:`1px solid ${ds.border}`, fontSize:11.5, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
                            {r.startTime}–{r.endTime}
                          </span>
                          {r.room && <span style={{ fontSize:12, color:"var(--text-faint)" }}>{r.room}</span>}
                        </div>
                        <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:3 }}>{r.matiereName??"—"}</div>
                        <div style={{ fontSize:12.5, color:"var(--text-muted)", marginBottom:12 }}>{r.classeName??"—"}</div>
                        <div style={{ paddingTop:10, borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <div style={{ width:22, height:22, borderRadius:6, background:"var(--violet-dim)", color:"var(--violet)", fontFamily:"'Instrument Serif',serif", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              {(r.teacherName?.[0]??"T").toUpperCase()}
                            </div>
                            <span style={{ fontSize:12, color:"var(--text-muted)", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.teacherName??"—"}</span>
                          </div>
                          <div style={{ display:"flex", gap:5 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(r)} className="btn-ghost" style={{ fontSize:11, padding:"3px 9px" }}>{t("common.edit")}</button>
                            <button onClick={() => { setViewTarget(null); setDeleteTarget(r); }} className="btn-danger" style={{ fontSize:11, padding:"3px 9px" }}>{t("common.delete")}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={t("timetable.addTitle")} subtitle={t("timetable.addSub")} icon="🗓️" accentColor="var(--violet)" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label={t("timetable.fields.day")}>
              <Select value={form.dayOfWeek} onChange={set("dayOfWeek")} required>{daySelectOptions}</Select>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label={t("timetable.fields.startTime")}><Input type="time" value={form.startTime} onChange={set("startTime")} required /></Field>
              <Field label={t("timetable.fields.endTime")}><Input type="time" value={form.endTime} onChange={set("endTime")} required /></Field>
            </div>
            <Field label={t("timetable.fields.room")}><Input placeholder={t("timetable.roomPlaceholder")} value={form.room} onChange={set("room")} /></Field>
            <Field label={t("timetable.fields.assignment")}>
              <Select value={form.teacherAssignmentId} onChange={set("teacherAssignmentId")} required>
                <option value="">— {t("timetable.fields.assignment")} —</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.teacherName} · {a.matiereName} · {a.classeName}</option>)}
              </Select>
            </Field>
            <SubmitBtn loading={saving} label={t("timetable.createBtn")} />
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal title={t("timetable.editTitle", { name: editTarget.matiereName ?? "" })} subtitle={t("timetable.editSub")} icon="✏️" accentColor="var(--violet)" onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label={t("timetable.fields.day")}>
              <Select value={editForm.dayOfWeek} onChange={setEdit("dayOfWeek")} required>{daySelectOptions}</Select>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label={t("timetable.fields.startTime")}><Input type="time" value={editForm.startTime} onChange={setEdit("startTime")} required /></Field>
              <Field label={t("timetable.fields.endTime")}><Input type="time" value={editForm.endTime} onChange={setEdit("endTime")} required /></Field>
            </div>
            <Field label={t("timetable.fields.room")}><Input value={editForm.room} onChange={setEdit("room")} /></Field>
            <Field label={t("timetable.fields.assignment")}>
              <Select value={editForm.teacherAssignmentId} onChange={setEdit("teacherAssignmentId")} required>
                <option value="">— {t("timetable.fields.assignment")} —</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.teacherName} · {a.matiereName} · {a.classeName}</option>)}
              </Select>
            </Field>
            <SubmitBtn loading={saving} label={t("timetable.saveBtn")} />
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("timetable.deleteTitle")}
          message={t("timetable.deleteMsg", { subject: deleteTarget.matiereName ?? "", day: t(`timetable.days.${deleteTarget.dayOfWeek}`) })}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}

      {v && (
        <DetailPanel title={v.matiereName??"Entry"} subtitle={v.classeName} avatar="🗓️" color={COLOR} onClose={() => setViewTarget(null)}>
          <DetailSection label={t("timetable.sections.schedule")}>
            <DetailRow icon="📅" label={t("timetable.fields.day")}  value={t(`timetable.days.${v.dayOfWeek}`)} />
            <DetailRow icon="⏰" label={t("timetable.fields.time")} value={`${v.startTime} – ${v.endTime}`} />
            <DetailRow icon="🚪" label={t("timetable.fields.room")} value={v.room} />
          </DetailSection>
          <DetailSection label={t("timetable.sections.assignment")}>
            <DetailRow icon="📐" label={t("timetable.fields.subject")}   value={v.matiereName} />
            <DetailRow icon="🏫" label={t("timetable.fields.class")}     value={v.classeName} />
            <DetailRow icon="🎓" label={t("timetable.fields.teacher")}   value={v.teacherName} />
            <DetailRow icon="🆔" label={t("timetable.fields.assignId")}  value={v.teacherAssignmentId} />
          </DetailSection>
          <DetailSection label={t("timetable.sections.actions")}>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => openEdit(v)} className="btn-ghost" style={{ flex:1, padding:"11px" }}>✏️ {t("common.edit")}</button>
              <button onClick={() => { setViewTarget(null); setDeleteTarget(v); }} className="btn-danger" style={{ flex:1, padding:"11px" }}>🗑 {t("common.delete")}</button>
            </div>
          </DetailSection>
        </DetailPanel>
      )}
    </>
  );
}