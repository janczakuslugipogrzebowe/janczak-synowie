/** CMS copy only. Company address/phones/email come from site settings, SMTP from environment. */
export const CONTACT_PAGE_SECTIONS = ["details", "form"] as const;
export type ContactPageSection = (typeof CONTACT_PAGE_SECTIONS)[number];
export type ContactDetailsContent = {
  eyebrow: string;
  title: string;
  mapTitle: string;
  headingScale: number;
};
export type ContactFormContent = {
  eyebrow: string;
  title: string;
  description: string;
  locationTitle: string; // Legacy CMS field: retained so previously saved sections remain readable.
  helpEyebrow: string;
  helpTitle: string;
  helpDescription: string;
  submitLabel: string;
  headingScale: number;
};
export const DEFAULT_CONTACT_DETAILS: ContactDetailsContent = {
  eyebrow: "BEZPOŚREDNI KONTAKT",
  title: "Jesteśmy do Państwa dyspozycji",
  mapTitle: "Nasza siedziba",
  headingScale: 100,
};
export const DEFAULT_CONTACT_FORM: ContactFormContent = {
  eyebrow: "FORMULARZ KONTAKTOWY",
  title: "Napisz do nas",
  description: "W sprawach wymagających pilnej pomocy prosimy o kontakt telefoniczny.",
  locationTitle: "Nasza siedziba",
  helpEyebrow: "Z UWAŻNOŚCIĄ",
  helpTitle: "Każda sprawa zasługuje na uwagę",
  helpDescription:
    "Możesz napisać do nas w sprawie organizacji uroczystości, formalności lub usług. Opisz krótko swoją sytuację i zostaw adres, na który możemy odpowiedzieć.",
  submitLabel: "Wyślij wiadomość",
  headingScale: 100,
};
export class ContactPageValidationError extends Error {}
export function isContactPageSection(value: string): value is ContactPageSection {
  return CONTACT_PAGE_SECTIONS.includes(value as ContactPageSection);
}
function object(raw: unknown, keys: string[]): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ContactPageValidationError("Nieprawidłowa sekcja.");
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).some((k) => !keys.includes(k)))
    throw new ContactPageValidationError("Nieznane pole sekcji.");
  return v;
}
function line(raw: unknown, max: number, required = true) {
  if (
    typeof raw !== "string" ||
    raw.trim().length > max ||
    (required && !raw.trim()) ||
    /[\u0000-\u001f\u007f]/.test(raw)
  )
    throw new ContactPageValidationError("Nieprawidłowa treść sekcji.");
  return raw.trim();
}
function paragraph(raw: unknown, max: number) {
  if (
    typeof raw !== "string" ||
    !raw.trim() ||
    raw.trim().length > max ||
    /[\u0000-\u0009\u000B-\u001F\u007F]/.test(raw)
  )
    throw new ContactPageValidationError("Nieprawidłowy opis sekcji.");
  return raw.replace(/\r\n/g, "\n").trim();
}
function scale(raw: unknown) {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 65 || raw > 150)
    throw new ContactPageValidationError("Nieprawidłowa wielkość nagłówka.");
  return raw;
}
export function parseContactDetails(raw: unknown): ContactDetailsContent {
  const v = object(raw, ["eyebrow", "title", "mapTitle", "headingScale"]);
  return {
    eyebrow: line(v.eyebrow, 90, false),
    title: line(v.title, 160),
    mapTitle: line(v.mapTitle ?? DEFAULT_CONTACT_DETAILS.mapTitle, 100),
    headingScale: scale(v.headingScale),
  };
}
export function parseContactFormSection(raw: unknown): ContactFormContent {
  const v = object(raw, [
    "eyebrow",
    "title",
    "description",
    "locationTitle",
    "helpEyebrow",
    "helpTitle",
    "helpDescription",
    "submitLabel",
    "headingScale",
  ]);
  return {
    eyebrow: line(v.eyebrow, 90, false),
    title: line(v.title, 160),
    description: line(v.description, 500, false),
    locationTitle: line(v.locationTitle ?? DEFAULT_CONTACT_FORM.locationTitle, 120),
    helpEyebrow: line(v.helpEyebrow ?? DEFAULT_CONTACT_FORM.helpEyebrow, 90, false),
    helpTitle: line(v.helpTitle ?? DEFAULT_CONTACT_FORM.helpTitle, 150),
    helpDescription: paragraph(v.helpDescription ?? DEFAULT_CONTACT_FORM.helpDescription, 500),
    submitLabel: line(v.submitLabel, 70),
    headingScale: scale(v.headingScale),
  };
}
