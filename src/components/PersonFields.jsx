import { Field, Input } from "./FormComponents";

export default function PersonFields({ form, set }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="First Name">
          <Input placeholder="Ahmed" value={form.firstname} onChange={set("firstname")} required />
        </Field>
        <Field label="Last Name">
          <Input placeholder="Ould Mohamed" value={form.lastname} onChange={set("lastname")} required />
        </Field>
      </div>
      <Field label="Email Address">
        <Input type="email" placeholder="user@school.mr" value={form.email} onChange={set("email")} required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Phone" hint="Min. 8 characters">
          <Input placeholder="22xxxxxx" value={form.phone} onChange={set("phone")} required minLength={8} />
        </Field>
        <Field label="NNI" hint="National ID number">
          <Input placeholder="NNI number" value={form.nni} onChange={set("nni")} required minLength={8} />
        </Field>
      </div>
    </>
  );
}