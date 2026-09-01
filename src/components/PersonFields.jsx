import { Field, Input } from "./FormComponents";
import { useLanguage } from "../LanguageContext";

export default function PersonFields({ form, set }) {
  const { t } = useLanguage();
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label={t("fields.firstName")}>
          <Input placeholder={t("fields.firstNamePlaceholder")} value={form.firstname} onChange={set("firstname")} required />
        </Field>
        <Field label={t("fields.lastName")}>
          <Input placeholder={t("fields.lastNamePlaceholder")} value={form.lastname} onChange={set("lastname")} required />
        </Field>
      </div>
      <Field label={t("fields.email")}>
        <Input type="email" placeholder={t("fields.emailPlaceholder")} value={form.email} onChange={set("email")} required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label={t("fields.phone")} hint={t("fields.phoneHint")}>
          <Input placeholder={t("fields.phonePlaceholder")} value={form.phone} onChange={set("phone")} required minLength={8} />
        </Field>
        <Field label={t("fields.nni")} hint={t("fields.nniHint")}>
          <Input placeholder={t("fields.nniPlaceholder")} value={form.nni} onChange={set("nni")} required minLength={8} />
        </Field>
      </div>
    </>
  );
}