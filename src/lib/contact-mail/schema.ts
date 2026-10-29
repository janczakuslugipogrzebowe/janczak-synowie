/** Strict server-side parsing for messages sent by anonymous visitors. */
export const CONTACT_TOPICS = [
  "Organizacja pogrzebu",
  "Formalności i dokumenty",
  "Nekrologi",
  "Pytanie o ofertę",
  "Inna sprawa",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];
export type ContactMessage = {
  name: string;
  email: string;
  phone: string;
  topic: ContactTopic;
  message: string;
  consent: true;
  website: string;
  turnstileToken: string;
};
export class ContactValidationError extends Error {}

export type ContactField = "name" | "email" | "phone" | "topic" | "message" | "consent";

/** One set of field-level rules shared by the browser and the API. */
export function validateContactField(field: ContactField, input: string | boolean): string | null {
  if (field === "consent")
    return input === true ? null : "Potwierdź zapoznanie się z informacją o przetwarzaniu danych.";
  const value = typeof input === "string" ? input.trim() : "";
  if (field === "name") {
    if (!value) return "Podaj imię i nazwisko.";
    if (value.length > 110 || /[\u0000-\u001f\u007f]/.test(value))
      return "Wpisz prawidłowe imię i nazwisko (maks. 110 znaków).";
    // Co najmniej dwa człony: imię i nazwisko. Obsługujemy polskie znaki,
    // nazwiska z łącznikiem i apostrofem, bez cyfr, inicjałów i symboli.
    const parts = value.split(/\s+/u);
    const isNamePart = (part: string) =>
      /^\p{L}+(?:[-'’]\p{L}+)*$/u.test(part) && (part.match(/\p{L}/gu)?.length ?? 0) >= 2;
    if (parts.length < 2 || parts.some((part) => !isNamePart(part)))
      return "Wpisz imię i nazwisko (co najmniej dwa wyrazy, bez cyfr i inicjałów).";
  }
  if (field === "email") {
    if (!value) return "Podaj adres e-mail.";
    if (value.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))
      return "Wpisz prawidłowy adres e-mail, np. imie@domena.pl.";
  }
  if (field === "phone" && value) {
    const digits = value.replace(/\D/g, "");
    const hasPlus = value.startsWith("+");
    // Polska: 9 cyfr; z prefiksem 48: dokładnie 11 cyfr.
    // Inne kraje: wymagany prefiks + oraz 9–15 cyfr łącznie.
    const polishDomestic = !hasPlus && digits.length === 9;
    const polishInternational = digits.startsWith("48") && digits.length === 11;
    const foreignInternational =
      hasPlus &&
      !digits.startsWith("48") &&
      /^[1-9]/.test(digits) &&
      digits.length >= 9 &&
      digits.length <= 15;
    if (
      !/^\+?[0-9\s().-]+$/.test(value) ||
      value.length > 32 ||
      !(polishDomestic || polishInternational || foreignInternational)
    )
      return "Podaj 9-cyfrowy numer telefonu (lub numer z prefiksem kraju) albo pozostaw pole puste.";
  }
  if (field === "topic" && !CONTACT_TOPICS.includes(value as ContactTopic))
    return "Wybierz temat wiadomości.";
  if (field === "message") {
    if (!value) return "Wpisz treść wiadomości.";
    if (value.length < 10) return "Wiadomość powinna mieć co najmniej 10 znaków.";
    if (value.length > 3500) return "Wiadomość może mieć maksymalnie 3500 znaków.";
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))
      return "Usuń niedozwolone znaki z wiadomości.";
  }
  return null;
}

const clean = (value: unknown, max: number, mandatory = true): string => {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (mandatory && !value.trim()) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
  )
    throw new ContactValidationError("Sprawdź poprawność danych formularza.");
  return value.trim();
};
export function parseContactMessage(raw: unknown): ContactMessage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ContactValidationError("Nieprawidłowy formularz.");
  const r = raw as Record<string, unknown>;
  if (
    Object.keys(r).some(
      (k) =>
        !["name", "email", "phone", "topic", "message", "consent", "website", "turnstileToken"].includes(k),
    )
  )
    throw new ContactValidationError("Nieprawidłowe pola.");
  const name = clean(r.name, 110);
  const email = clean(r.email, 254);
  const phone = clean(r.phone ?? "", 32, false);
  const topic = clean(r.topic, 80);
  const message = clean(r.message, 3500);
  const website = clean(r.website ?? "", 200, false);
  const turnstileToken = clean(r.turnstileToken ?? "", 2500, false);
  if (
    (["name", "email", "phone", "topic", "message", "consent"] as const).some(
      (field) =>
        validateContactField(
          field,
          field === "consent" ? r.consent === true : { name, email, phone, topic, message }[field],
        ) !== null,
    )
  )
    throw new ContactValidationError("Uzupełnij wymagane pola i sprawdź ich poprawność.");
  return {
    name,
    email,
    phone,
    topic: topic as ContactTopic,
    message,
    website,
    consent: true,
    turnstileToken,
  };
}
export function escapeMailHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
