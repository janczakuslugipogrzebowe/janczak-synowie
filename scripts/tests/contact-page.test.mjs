import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const { parseContactDetails, parseContactFormSection, DEFAULT_CONTACT_DETAILS, DEFAULT_CONTACT_FORM } =
  await import("../../src/lib/contact-page/schema.ts");
const { parseContactMessage, escapeMailHtml, validateContactField } =
  await import("../../src/lib/contact-mail/schema.ts");
test("strict CMS schemas and default content", () => {
  assert.equal(parseContactDetails(DEFAULT_CONTACT_DETAILS).title, DEFAULT_CONTACT_DETAILS.title);
  assert.equal(parseContactFormSection(DEFAULT_CONTACT_FORM).title, DEFAULT_CONTACT_FORM.title);
  assert.throws(() => parseContactDetails({ ...DEFAULT_CONTACT_DETAILS, extra: "x" }));
  assert.throws(() => parseContactFormSection({ ...DEFAULT_CONTACT_FORM, headingScale: 200 }));
});
test("strict public contact message parsing and HTML escaping", () => {
  const valid = {
    name: "Jan Kowalski",
    email: "test@example.org",
    phone: "",
    topic: "Inna sprawa",
    message: "Dzień dobry, proszę o kontakt.",
    consent: true,
    website: "",
    turnstileToken: "",
  };
  assert.equal(parseContactMessage(valid).topic, "Inna sprawa");
  assert.throws(() => parseContactMessage({ ...valid, consent: false }));
  assert.throws(() => parseContactMessage({ ...valid, topic: "FAKE" }));
  assert.throws(() => parseContactMessage({ ...valid, name: "X\r\nBcc:" }));
  assert.equal(escapeMailHtml('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
});
test("contact page wires shared components, CMS and server-side SMTP", () => {
  const page = read("src/app/(site)/kontakt/page.tsx");
  assert.match(page, /<SubpageHero data=\{hero\}/);
  assert.match(page, /<ContactFormSection/);
  assert.match(page, /<SubpageBottomCta[^>]*phoneOnly/);
  const api = read("src/app/api/contact/route.ts");
  assert.match(api, /isSameOrigin/);
  assert.match(api, /checkContactQuota/);
  assert.match(api, /verifyTurnstile/);
  assert.match(api, /sendContactMail/);
  const smtp = read("src/lib/contact-mail/send.ts");
  assert.match(smtp, /requireTLS: port === 587/);
  assert.match(smtp, /process\.env\.CONTACT_TO_EMAIL/);
  assert.match(smtp, /replyTo/);
  const editor = read("src/components/admin/contact-page-editor.tsx");
  assert.match(editor, /useCmsEditor/);
  assert.match(editor, /<ContactFormSection[^>]*preview/);
});
test("contact side navigation and phone-only CTA do not self-link", () => {
  assert.match(read("src/components/admin/admin-shell.tsx"), /slug === "kontakt"/);
  assert.match(read("src/components/subpages/subpage-bottom-cta.tsx"), /\{!phoneOnly\s*&&\s*\(?\s*<Link\b/);
  assert.match(read("src/components/contact/contact-form.tsx"), /disabled=\{busy \|\| preview\}/);
});

test("field-level validation matches server rules and clears on valid input", () => {
  assert.match(validateContactField("name", ""), /imię/i);
  assert.equal(validateContactField("name", "Jan Kowalski"), null);
  assert.match(validateContactField("email", "x@"), /e-mail/i);
  assert.equal(validateContactField("email", "kontakt@example.com"), null);
  assert.match(validateContactField("phone", "123"), /telefonu/i);
  assert.equal(validateContactField("phone", "+48 605 043 008"), null);
  assert.equal(validateContactField("phone", ""), null);
  assert.match(validateContactField("message", "abc"), /10 znaków/i);
  assert.equal(validateContactField("message", "Proszę o kontakt."), null);
  assert.match(validateContactField("consent", false), /informacj/i);
  assert.equal(validateContactField("consent", true), null);
  const sample = {
    name: "Jan Kowalski",
    email: "x@example.com",
    phone: "123",
    topic: "Inna sprawa",
    message: "Wiadomość testowa.",
    consent: true,
    website: "",
    turnstileToken: "",
  };
  assert.throws(() => parseContactMessage(sample));
  assert.doesNotThrow(() => parseContactMessage({ ...sample, phone: "+48 605 043 008" }));
});
test("name and surname require two valid name parts; short Polish numbers are rejected", () => {
  for (const name of [
    "Jf",
    "Jan",
    "J Kowalski",
    "Jan K",
    "Jan 123",
    "Jan Kowalski2",
    "Jan @Kowalski",
    "Jan\nKowalski",
  ]) {
    assert.ok(validateContactField("name", name), `Expected invalid name: ${JSON.stringify(name)}`);
  }
  for (const name of [
    "Jan Kowalski",
    "  Anna-Maria  Żółć  ",
    "Ola O'Connor",
    "Jan van der Berg",
    "Żaneta Świątek",
  ]) {
    assert.equal(validateContactField("name", name), null, `Expected valid name: ${name}`);
  }
  for (const phone of ["51708874", "12345678", "1234567890", "+48 517 088 74", "123 ABC 789"]) {
    assert.ok(validateContactField("phone", phone), `Expected invalid phone: ${phone}`);
  }
  for (const phone of [
    "",
    "517088744",
    "517 088 744",
    "+48 517 088 744",
    "48 517088744",
    "+44 20 7946 0958",
  ]) {
    assert.equal(validateContactField("phone", phone), null, `Expected valid phone: ${phone}`);
  }
  const complete = {
    name: "Jan Kowalski",
    email: "test@example.org",
    phone: "517088744",
    topic: "Inna sprawa",
    message: "Proszę o kontakt w sprawie usługi.",
    consent: true,
    website: "",
    turnstileToken: "",
  };
  assert.throws(() => parseContactMessage({ ...complete, name: "Jf" }), /imię|poprawność|pola/i);
  assert.throws(() => parseContactMessage({ ...complete, phone: "51708874" }), /pola|poprawność/i);
  assert.doesNotThrow(() => parseContactMessage(complete));
});

test("contact form exposes inline errors and map is embedded immediately", () => {
  const form = read("src/components/contact/contact-form.tsx");
  assert.match(form, /noValidate/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /aria-describedby/);
  assert.match(form, /onBlur/);
  assert.match(form, /validateContactField/);
  assert.match(form, /firstInvalid/);
  const map = read("src/components/contact/contact-location.tsx");
  const details = read("src/components/contact/contact-details-section.tsx");
  const formSection = read("src/components/contact/contact-form-section.tsx");
  assert.match(details, /<ContactLocation/);
  assert.doesNotMatch(formSection, /<ContactLocation|<iframe/);
  assert.match(formSection, /data\.helpTitle/);
  assert.match(map, /<iframe/);
  assert.match(map, /src=\{embedUrl\}/);
  assert.doesNotMatch(map, /showMap|setShowMap/);
  const admin = read("src/app/(admin)/admin/(protected)/company/page.tsx");
  assert.match(admin, /mapsEmbedUrl/);
});

test("published CMS content from before redesign remains valid; new content is editable", () => {
  const legacyDetails = { eyebrow: "KONTAKT", title: "Kontakt", headingScale: 100 };
  const legacyForm = {
    eyebrow: "FORMULARZ",
    title: "Wiadomość",
    description: "Opis",
    locationTitle: "Nasza siedziba",
    submitLabel: "Wyślij",
    headingScale: 100,
  };
  assert.equal(parseContactDetails(legacyDetails).mapTitle, DEFAULT_CONTACT_DETAILS.mapTitle);
  assert.equal(parseContactFormSection(legacyForm).helpTitle, DEFAULT_CONTACT_FORM.helpTitle);
  assert.equal(
    parseContactFormSection({ ...DEFAULT_CONTACT_FORM, helpTitle: "Nowy nagłówek" }).helpTitle,
    "Nowy nagłówek",
  );
  assert.throws(() => parseContactFormSection({ ...DEFAULT_CONTACT_FORM, helpTitle: "" }));
});

test("Google Maps attribution is not obscured by custom overlays", () => {
  const map = read("src/components/contact/contact-location.tsx");
  assert.match(map, /<iframe/);
  assert.doesNotMatch(map, /pointer-events-none relative z-10 mt-auto/);
  assert.match(map, /border-t border-\[#e7dfd2\]/);
  assert.match(map, /Wyznacz trasę/);
});

test("editors bind the new fields to the correct sections", () => {
  const editor = read("src/components/admin/contact-page-editor.tsx");
  assert.match(editor, /ed\.update\("mapTitle",/);
  assert.match(editor, /ed\.update\("helpTitle",/);
  assert.match(editor, /ed\.update\("helpDescription",/);
  const sidebar = read("src/components/admin/admin-shell.tsx");
  assert.match(sidebar, /Formularz i informacje/);
});

test("contact map has one clean frame and the support panel uses full-width copy without a feather decoration", () => {
  const location = read("src/components/contact/contact-location.tsx");
  const formSection = read("src/components/contact/contact-form-section.tsx");
  assert.match(location, /<article[\s\S]*?rounded-\[24px\] border border-\[#d8cfbf\]/);
  assert.doesNotMatch(location, /p-\[7px\]|sm:p-\[9px\]|rounded-\[17px\] border/);
  assert.match(location, /<iframe[\s\S]*?src=\{embedUrl\}/);
  assert.match(location, /border-t border-\[#e7dfd2\]/);
  assert.doesNotMatch(formSection, /TbFeather|max-w-\[470px\]|max-w-\[530px\]/);
  assert.match(formSection, /w-full whitespace-pre-line/);
  assert.match(formSection, /\{data\.helpDescription\}/);
});

test("branded contact email includes safe HTML, plain text and Gmail reply action", async () => {
  const { buildContactEmail } = await import("../../src/lib/contact-mail/template.ts");
  const email = buildContactEmail(
    {
      name: 'Jan <Kowalski> & "Spółka"',
      email: "klient@example.com",
      phone: "+48 605 043 008",
      topic: "Organizacja pogrzebu",
      message: "Dzień dobry,\nProszę o <kontakt> & informacje.",
    },
    new Date("2026-10-29T17:30:00.000Z"),
  );
  assert.match(email.html, /Janczak i Synowie/);
  assert.match(email.html, /#15281e/);
  assert.match(email.html, /Odpowiedz na wiadomość/);
  assert.match(email.html, /Jan &lt;Kowalski&gt; &amp; &quot;Spółka&quot;/);
  assert.match(email.html, /Dzień dobry,<br \/>Proszę o &lt;kontakt&gt; &amp; informacje\./);
  assert.doesNotMatch(email.html, /<kontakt>|Jan <Kowalski>/);
  assert.match(email.html, /tel:\+48605043008/);
  assert.match(email.text, /29\.10\.2026/);
  assert.match(email.text, /klient@example.com/);
  const gmail = new URL(email.gmailUrl);
  assert.equal(gmail.hostname, "mail.google.com");
  assert.equal(gmail.searchParams.get("to"), "klient@example.com");
  assert.equal(gmail.searchParams.get("su"), "Re: Zapytanie — Organizacja pogrzebu");
  assert.match(email.html, /view=cm&amp;fs=1&amp;to=/);
  assert.match(email.mailtoUrl, /^mailto:klient%40example\.com\?subject=/);
});

test("contact email handles missing phone, long lines and native Reply-To", async () => {
  const { buildContactEmail } = await import("../../src/lib/contact-mail/template.ts");
  const email = buildContactEmail(
    {
      name: "Anna Kowalska",
      email: "anna@example.org",
      phone: "",
      topic: "Inna sprawa",
      message: "A".repeat(190),
    },
    new Date("2026-10-29T18:00:00.000Z"),
  );
  assert.doesNotMatch(email.html, /Telefon<\/div>/);
  assert.doesNotMatch(email.text, /Telefon:/);
  assert.match(email.html, /overflow-wrap:anywhere/);
  assert.match(email.text, /A{190}/);
  const send = read("src/lib/contact-mail/send.ts");
  assert.match(send, /buildContactEmail\(data\)/);
  assert.match(send, /replyTo:\s*\{\s*name:\s*data\.name,\s*address:\s*data\.email\s*\}/);
  assert.match(send, /subject:\s*`Nowe zapytanie/);
  assert.doesNotMatch(send, /escapeMailHtml\(/);
});
