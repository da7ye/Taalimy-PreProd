import { useState } from "react";

export function usePersonForm(initial = {}) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    nni: "",
    ...initial,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const valid = () =>
    form.firstname && form.lastname && form.email && form.phone.length >= 8 && form.nni.length >= 8;

  return { form, set, valid, setForm };
}