import type { ContactMessage } from "./schema";

type MailDetails = Pick<ContactMessage, "name" | "email" | "phone" | "topic" | "message">;

/** Escapes visitor-controlled values before using them in HTML text or attributes. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

function buildReplyLinks(data: MailDetails) {
  // Gmail Compose opens a *new* message. The SMTP Reply-To header is what makes
  // the native Reply button in the received message address the visitor.
  const replySubject = `Re: Zapytanie — ${data.topic}`;
  const gmailUrl = new URL("https://mail.google.com/mail/");
  gmailUrl.searchParams.set("view", "cm");
  gmailUrl.searchParams.set("fs", "1");
  gmailUrl.searchParams.set("to", data.email);
  gmailUrl.searchParams.set("su", replySubject);
  const mailtoUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(replySubject)}`;
  return { gmailUrl: gmailUrl.toString(), mailtoUrl };
}

function field(label: string, value: string, href?: string): string {
  const content = href
    ? `<a href="${escapeHtml(href)}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#234632;text-decoration:underline;text-decoration-color:#bda577;word-break:break-word;">${escapeHtml(value)}</a>`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#20372a;word-break:break-word;">${escapeHtml(value)}</span>`;
  return `<tr><td style="padding:10px 0;vertical-align:top;border-bottom:1px solid #ede7dd;">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;font-weight:bold;line-height:18px;color:#94764a;text-transform:uppercase;">${escapeHtml(label)}</div>
    <div style="padding-top:3px;">${content}</div>
  </td></tr>`;
}

/** Framework-free, email-client-friendly markup: no Tailwind, scripts or external assets. */
export function buildContactEmail(data: MailDetails, receivedAt: Date = new Date()) {
  const { gmailUrl, mailtoUrl } = buildReplyLinks(data);
  const date = formatDate(receivedAt);
  const safeMessage = escapeHtml(data.message).replace(/\r\n?|\n/g, "<br />");
  const phoneLink = data.phone ? `tel:${data.phone.replace(/[^+\d]/g, "")}` : undefined;
  const contactRows = [
    field("Imię i nazwisko", data.name),
    field("Adres e-mail", data.email, `mailto:${data.email}`),
    ...(data.phone ? [field("Telefon", data.phone, phoneLink)] : []),
    field("Data otrzymania", date),
  ].join("");

  const html = `<!doctype html>
<html lang="pl"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" />
<title>Nowe zapytanie — Janczak i Synowie</title>
<style>
  @media only screen and (max-width: 640px) {
    .mail-outside { padding: 16px 8px !important; }
    .mail-pad { padding: 27px 23px !important; }
    .mail-heading { font-size: 28px !important; }
    .mail-brand { font-size: 27px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#eeebe5;color:#20372a;">
<div role="article" aria-roledescription="wiadomość e-mail" lang="pl">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;background:#eeebe5;">
<tr><td align="center" class="mail-outside" style="padding:42px 16px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;max-width:620px;border-collapse:separate;border-spacing:0;background:#fffdf9;border:1px solid #e0d8ca;border-radius:12px;overflow:hidden;">
<tr><td align="center" class="mail-pad" style="background:#15281e;padding:38px 42px 36px;">
  <div class="mail-brand" style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;color:#fbf5eb;letter-spacing:-.8px;">Janczak i Synowie</div>
  <div style="margin-top:9px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:18px;letter-spacing:3px;font-weight:bold;color:#e2c28e;">USŁUGI POGRZEBOWE</div>
  <div style="height:1px;width:58px;margin:25px auto 23px;background:#ae946b;"></div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:18px;letter-spacing:2px;font-weight:bold;color:#d4b787;">FORMULARZ KONTAKTOWY</div>
  <div class="mail-heading" style="margin-top:9px;font-family:Georgia,'Times New Roman',serif;font-size:33px;line-height:1.2;color:#fffaf2;">Nowa wiadomość ze strony</div>
</td></tr>
<tr><td class="mail-pad" style="padding:40px 44px 34px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.7px;font-weight:bold;color:#977749;line-height:18px;">TEMAT ZAPYTANIA</div>
  <div style="padding:9px 0 26px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.25;color:#1d3426;">${escapeHtml(data.topic)}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;border-top:1px solid #e8e0d5;">${contactRows}</table>
  <div style="padding-top:32px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.7px;font-weight:bold;color:#94764a;line-height:18px;">TREŚĆ WIADOMOŚCI</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:13px;border-collapse:separate;border-spacing:0;background:#f5f1e9;border:1px solid #eae1d3;border-radius:8px;">
  <tr><td style="padding:22px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#20372a;word-break:break-word;overflow-wrap:anywhere;">${safeMessage}</td></tr>
  </table>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:30px;border-collapse:collapse;">
  <tr><td align="center" style="padding:0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;border-spacing:0;">
    <tr><td align="center" bgcolor="#203d2d" style="border-radius:7px;background:#203d2d;">
      <a href="${escapeHtml(gmailUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 27px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:bold;text-decoration:none;color:#ffffff;background:#203d2d;border:1px solid #203d2d;border-radius:7px;">Odpowiedz na wiadomość &rarr;</a>
    </td></tr></table>
  </td></tr>
  <tr><td align="center" style="padding-top:15px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#69756b;">Przycisk otworzy Gmail z adresem odbiorcy i tematem.</td></tr>
  <tr><td align="center" style="padding-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#69756b;">Nie używasz Gmaila? <a href="${escapeHtml(mailtoUrl)}" style="color:#315a3e;text-decoration:underline;">Odpowiedz w aplikacji pocztowej</a></td></tr>
  </table>
</td></tr>
<tr><td align="center" class="mail-pad" style="padding:24px 34px;background:#eee9e0;border-top:1px solid #dfd6c8;">
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:27px;color:#203b2b;">Janczak i Synowie</div>
  <div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:19px;color:#67766b;">Automatyczne powiadomienie z formularza na stronie internetowej.</div>
  <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:19px;color:#67766b;">Aby odpowiedzieć w tym samym wątku, możesz też użyć standardowego „Odpowiedz” w poczcie.</div>
</td></tr>
</table>
</td></tr>
</table>
</div>
</body></html>`;

  const text = [
    "JANCZAK I SYNOWIE — NOWA WIADOMOŚĆ Z FORMULARZA",
    "",
    `Temat: ${data.topic}`,
    `Imię i nazwisko: ${data.name}`,
    `E-mail: ${data.email}`,
    ...(data.phone ? [`Telefon: ${data.phone}`] : []),
    `Data otrzymania: ${date}`,
    "",
    "TREŚĆ WIADOMOŚCI",
    data.message,
    "",
    `Odpowiedz w Gmailu: ${gmailUrl}`,
    `Odpowiedz w aplikacji pocztowej: ${mailtoUrl}`,
    "",
    "Możesz także użyć standardowego przycisku Odpowiedz — nagłówek Reply-To wskazuje adres klienta.",
  ].join("\n");

  return { html, text, gmailUrl, mailtoUrl };
}
