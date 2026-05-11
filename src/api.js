// export const BASE_URL = "http://144.91.85.23/api/v1";
export const BASE_URL = "/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Teachers
export const getTeachers = () => request("/teachers");
export const createTeacher = (data) => request("/teachers", { method: "POST", body: JSON.stringify(data) });

// Students
export const getStudents = () => request("/students");
export const createStudent = (data) => request("/students", { method: "POST", body: JSON.stringify(data) });

// Parents
export const getParents = () => request("/parents");
export const createParent = (data) => request("/parents", { method: "POST", body: JSON.stringify(data) });

// Matieres
export const getMatieres = () => request("/matieres");
export const createMatiere = (data) => request("/matieres", { method: "POST", body: JSON.stringify(data) });

// Levels
export const getLevels = (page = 0, size = 100) => request(`/levels?page=${page}&size=${size}`);
export const createLevel = (data) => request("/levels", { method: "POST", body: JSON.stringify(data) });

// Classes
export const getClasses = (page = 0, size = 100) => request(`/classes?page=${page}&size=${size}`);
export const createClasse = (data) => request("/classes", { method: "POST", body: JSON.stringify(data) });

// Auth
export const approveUser = (phone) => request("/auth/approve-user", { method: "POST", body: JSON.stringify({ phone }) });

export const deleteTeacher    = (id)     => request(`/teachers/${id}`,            { method: "DELETE" });
export const updateTeacher    = (id, d)  => request(`/teachers/${id}`,            { method: "PUT",    body: JSON.stringify(d) });
export const deleteStudent    = (uid)    => request(`/students/${uid}`,            { method: "DELETE" });
export const updateStudent    = (id, d)  => request(`/students/${id}`,            { method: "PUT",    body: JSON.stringify(d) });
export const deactivateParent = (uid)    => request(`/parents/deactivate/${uid}`, { method: "PUT" });
export const updateParent     = (id, d)  => request(`/parents/${id}`,             { method: "PUT",    body: JSON.stringify(d) });
export const deleteLevel      = (id)     => request(`/levels/${id}`,              { method: "DELETE" });
export const updateLevel      = (id, d)  => request(`/levels/${id}`,              { method: "PUT",    body: JSON.stringify(d) });
export const deleteClasse     = (id)     => request(`/classes/${id}`,             { method: "DELETE" });
export const updateClasse     = (id, d)  => request(`/classes/${id}`,             { method: "PUT",    body: JSON.stringify(d) });
export const updateMatiere    = (id, d)  => request(`/matieres/${id}`,            { method: "PUT",    body: JSON.stringify(d) });

// Names — flat {id, name} arrays for dropdowns
export const getCampusNames  = () => request("/campuses/names");
export const getLevelNames   = () => request("/levels/names");
export const getClasseNames  = () => request("/classes/names");
export const getMatiereNames = () => request("/matieres/names");
export const getTeacherNames = () => request("/teachers/names");

// Timetables
export const getTimetables         = ()      => request("/timetables");
export const createTimetable       = (d)     => request("/timetables",                     { method: "POST",   body: JSON.stringify(d) });
export const updateTimetable       = (id, d) => request(`/timetables/${id}`,               { method: "PUT",    body: JSON.stringify(d) });
export const deleteTimetable       = (id)    => request(`/timetables/${id}`,               { method: "DELETE" });
export const getTimetableByClasse  = (id)    => request(`/timetables/classe/${id}/sorted`);
export const getTimetableByTeacher = (id)    => request(`/timetables/teacher/${id}/sorted`);

// Assignments
export const getAssignments   = ()                                => request("/assignments");
export const createAssignment = (teacherId, matiereId, classeId)  => request(`/assignments?teacherId=${teacherId}&matiereId=${matiereId}&classeId=${classeId}`, { method: "POST" });
export const deleteAssignment = (id)                              => request(`/assignments/${id}`, { method: "DELETE" });

// Assignment lookups — teacher-scoped
export const getClassesByTeacher          = (teacherId)             => request(`/assignments/${teacherId}/classes`);
export const getMatieresByTeacherAndClasse = (teacherId, classeId)  => request(`/assignments/${teacherId}/classes/${classeId}/matieres`);

// Absences
export const markAbsences           = (data) => request("/absences",                   { method: "POST", body: JSON.stringify(data) });
export const getAbsencesByTimetable = (id)   => request(`/absences/timetable/${id}`);
export const getAbsencesByStudent   = (id)   => request(`/absences/student/${id}`);

// Approve
export const getNotApprovedUsers = () => request("/users/not-approved");

// Payments
export const payStudent           = (studentId, month, amount) =>
  request(`/payments/paid?studentId=${studentId}&month=${month}&amount=${amount}`, { method: "POST" });
export const getPaymentsByStudent = (id) => request(`/payments/student/${id}`);
export const getPaymentReceipt    = async (paymentId) => {
  const res = await fetch(`${BASE_URL}/payments/recu/${paymentId}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  return new Blob([buffer], { type: "application/pdf" });
};

// Notes (Grades) — paths include /api prefix as shown in OpenAPI spec
export const createNote                    = (data)               => request("/api/notes",                                                                      { method: "POST",   body: JSON.stringify(data) });
export const updateNote                    = (id, data)           => request(`/api/notes/${id}`,                                                                { method: "PUT",    body: JSON.stringify(data) });
export const deleteNote                    = (id)                 => request(`/api/notes/${id}`,                                                                { method: "DELETE" });
export const getNoteById                   = (id)                 => request(`/api/notes/${id}`);
export const getNotesByStudent             = (studentId)          => request(`/api/notes/student/${studentId}`);
export const getNotesByStudentAndTrimestre = (studentId, trId)    => request(`/api/notes/student/${studentId}/trimestre/${trId}`);
export const getClasseStats                = (classeId, matiereId, trId, typeDevoir) =>
  request(`/api/notes/stats/classe/${classeId}/matiere/${matiereId}/trimestre/${trId}?typeDevoir=${typeDevoir}`);
export const getBulletin                   = (studentId, trId)    => request(`/api/notes/bulletin/student/${studentId}/trimestre/${trId}`);
export const getBulletinPdf                = async (studentId, trId) => {
  const res = await fetch(`${BASE_URL}/api/bulletins/student/${studentId}/trimestre/${trId}/pdf/download`);
  if (!res.ok) { const err = await res.text(); throw new Error(err || `HTTP ${res.status}`); }
  const buffer = await res.arrayBuffer();
  return new Blob([buffer], { type: "application/pdf" });
};
// Parent → Children
export const getChildren        = (pid)            => request(`/parents/${pid}/children`);
export const addStudentToParent = (pid, sid)       => request(`/parents/${pid}/add-student/${sid}`, { method: "POST" });
export const getChildTimetable  = (pid, sid)       => request(`/parents/${pid}/children/${sid}/timetable`);
export const getChildNotes      = (pid, sid, trId) => request(`/parents/${pid}/children/${sid}/notes?trimestreId=${trId}`);
export const getChildBulletin   = (pid, sid, trId) => request(`/parents/${pid}/children/${sid}/bulletin?trimestreId=${trId}`);


export const uploadUserPhoto = async (userId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/users/${userId}/upload-photo`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const updateUserPhoto = async (userId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/users/${userId}/photo`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const deleteUserPhoto = (userId) =>
  request(`/users/${userId}/photo`, { method: "DELETE" });