"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import { TbArrowUpRight, TbCheck, TbAlertCircle, TbShieldCheck } from "react-icons/tb";
import { CONTACT_TOPICS, validateContactField, type ContactField } from "@/lib/contact-mail/schema";

const inputBase =
  "w-full min-h-13 rounded-xl border bg-[#fffefa] px-4 py-3 text-[15px] text-[#1a3224] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#8a968a] disabled:opacity-60";
const inputNormal = "border-[#d7d8ce] focus:border-[#a98c61] focus:ring-4 focus:ring-[#b89b6c]/15";
const inputError =
  "border-[#b83939] bg-[#fff9f8] focus:border-[#a12828] focus:ring-4 focus:ring-[#d25a5a]/15";
const label = "mb-2 block text-[13px] font-semibold text-[#34493a]";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Fields = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
  website: string;
};
const initial: Fields = {
  name: "",
  email: "",
  phone: "",
  topic: CONTACT_TOPICS[0],
  message: "",
  consent: false,
  website: "",
};
const fields: ContactField[] = ["name", "email", "phone", "topic", "message", "consent"];

export default function ContactForm({
  submitLabel,
  preview = false,
}: {
  submitLabel: string;
  preview?: boolean;
}) {
  const [form, setForm] = useState<Fields>(initial);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const errorOf = (field: ContactField) => validateContactField(field, form[field]);
  const visibleError = (field: ContactField) =>
    !preview && (attempted || touched[field]) ? errorOf(field) : null;
  const isInvalid = (field: ContactField) => Boolean(visibleError(field));
  const classFor = (field: ContactField) => `${inputBase} ${isInvalid(field) ? inputError : inputNormal}`;

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setForm((state) => ({ ...state, [key]: value }));
    if (feedback) setFeedback(null);
  }
  const blur = (field: ContactField) => setTouched((state) => ({ ...state, [field]: true }));
  const messageFor = (field: ContactField) =>
    visibleError(field) ? (
      <p
        id={`contact-${field}-error`}
        role="alert"
        className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-[#a02e2e]"
      >
        <TbAlertCircle size={15} className="mt-px shrink-0" aria-hidden="true" />
        {visibleError(field)}
      </p>
    ) : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || busy) return;
    setAttempted(true);
    setFeedback(null);
    const firstInvalid = fields.find((field) => errorOf(field) !== null);
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }
    setBusy(true);
    const formElement = event.currentTarget;
    const token =
      (formElement.elements.namedItem("cf-turnstile-response") as HTMLInputElement | null)?.value || "";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: token }),
      });
      const result: { error?: string; ok?: boolean } = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Nie udało się wysłać wiadomości.");
      setFeedback({ success: true, message: "Wiadomość została wysłana. Dziękujemy za kontakt." });
      setForm(initial);
      setTouched({});
      setAttempted(false);
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Nie udało się wysłać wiadomości.",
      });
    } finally {
      setBusy(false);
      const widget = (window as Window & { turnstile?: { reset: () => void } }).turnstile;
      widget?.reset();
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="space-y-6"
      aria-label="Formularz kontaktowy"
    >
      <div className="flex items-center gap-2.5 border-b border-[#e9e5dc] pb-5 text-xs text-[#687a6c]">
        <TbShieldCheck size={21} className="shrink-0 text-[#9f845d]" aria-hidden="true" />
        Pola oznaczone gwiazdką są wymagane.
      </div>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="contact-name">
            Imię i nazwisko <span className="text-[#aa8051]">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            className={classFor("name")}
            maxLength={110}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={isInvalid("name")}
            aria-describedby={isInvalid("name") ? "contact-name-error" : undefined}
          />
          {messageFor("name")}
        </div>
        <div>
          <label className={label} htmlFor="contact-email">
            Adres e-mail <span className="text-[#aa8051]">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className={classFor("email")}
            maxLength={254}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={isInvalid("email")}
            aria-describedby={isInvalid("email") ? "contact-email-error" : undefined}
          />
          {messageFor("email")}
        </div>
        <div>
          <label className={label} htmlFor="contact-phone">
            Telefon <span className="font-normal text-[#859085]">(opcjonalnie)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={classFor("phone")}
            maxLength={32}
            placeholder="np. +48 500 000 000"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={isInvalid("phone")}
            aria-describedby={isInvalid("phone") ? "contact-phone-error" : undefined}
          />
          {messageFor("phone")}
        </div>
        <div>
          <label className={label} htmlFor="contact-topic">
            Temat <span className="text-[#aa8051]">*</span>
          </label>
          <select
            id="contact-topic"
            name="topic"
            className={classFor("topic")}
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            onBlur={() => blur("topic")}
            aria-invalid={isInvalid("topic")}
            aria-describedby={isInvalid("topic") ? "contact-topic-error" : undefined}
          >
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {messageFor("topic")}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-[13px] font-semibold text-[#34493a]" htmlFor="contact-message">
            Wiadomość <span className="text-[#aa8051]">*</span>
          </label>
          <span className="text-xs tabular-nums text-[#879187]">{form.message.length} / 3500</span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          className={`${classFor("message")} min-h-[185px] resize-y`}
          maxLength={3500}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => blur("message")}
          aria-invalid={isInvalid("message")}
          aria-describedby={isInvalid("message") ? "contact-message-error" : undefined}
        />
        {messageFor("message")}
      </div>
      <div className="absolute -left-[10000px] -top-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Strona internetowa</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>
      <div>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-[13px] leading-[1.75] transition-colors ${isInvalid("consent") ? "border-[#bb4e4e] bg-[#fff9f8] text-[#803a3a]" : "border-[#e5e5dc] bg-[#f8f8f3] text-[#536356]"}`}
        >
          <input
            name="consent"
            type="checkbox"
            className="mt-1 size-[17px] shrink-0 accent-[#284733]"
            checked={form.consent}
            onChange={(e) => {
              set("consent", e.target.checked);
              blur("consent");
            }}
            onBlur={() => blur("consent")}
            aria-invalid={isInvalid("consent")}
            aria-describedby={isInvalid("consent") ? "contact-consent-error" : undefined}
          />
          <span>
            Zapoznałem(-am) się z informacją, że podane dane będą przetwarzane przez Janczak i Synowie w celu
            odpowiedzi na moje zapytanie. <span className="text-[#aa8051]">*</span>
          </span>
        </label>
        {messageFor("consent")}
      </div>
      {siteKey && !preview && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
        </>
      )}
      {attempted && fields.some((field) => errorOf(field)) && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-[#e9bbbb] bg-[#fff4f2] px-4 py-3 text-sm leading-relaxed text-[#902d2d]"
        >
          <TbAlertCircle size={20} className="mt-px shrink-0" aria-hidden="true" />
          Sprawdź zaznaczone pola. Po poprawieniu danych komunikaty znikną automatycznie.
        </p>
      )}
      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${feedback.success ? "bg-[#e8f2e9] text-[#23452c]" : "bg-[#fff0e8] text-[#803e20]"}`}
        >
          {feedback.success ? (
            <TbCheck className="mt-0.5 shrink-0" />
          ) : (
            <TbAlertCircle className="mt-0.5 shrink-0" />
          )}
          {feedback.message}
        </p>
      )}
      <button
        disabled={busy || preview}
        type="submit"
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#21382a] px-8 text-sm font-semibold text-[#fffaf1] transition hover:bg-[#37543c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#21382a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Wysyłanie…" : submitLabel}
        <TbArrowUpRight size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
