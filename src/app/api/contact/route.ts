import { parseContactMessage, ContactValidationError } from "@/lib/contact-mail/schema";
import { sendContactMail, smtpReady } from "@/lib/contact-mail/send";
import { checkContactQuota, verifyTurnstile } from "@/lib/contact-mail/guard";
import { isSameOrigin } from "@/lib/admin/origin";
const json = (payload: unknown, status: number) =>
  Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Nieprawidłowe pochodzenie formularza." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return json({ error: "Wymagany formularz JSON." }, 415);
  if (!smtpReady())
    return json({ error: "Formularz jest tymczasowo niedostępny. Prosimy o kontakt telefoniczny." }, 503);
  try {
    const raw = await request.text();
    if (raw.length > 8000) return json({ error: "Wiadomość jest zbyt długa." }, 413);
    const message = parseContactMessage(JSON.parse(raw));
    // Quiet success for honeypot bots; no message is sent.
    if (message.website) return json({ ok: true }, 200);
    if (!(await verifyTurnstile(message.turnstileToken, request)))
      return json({ error: "Nie udało się zweryfikować formularza. Spróbuj ponownie." }, 400);
    if (!(await checkContactQuota(request)))
      return json({ error: "Przekroczono limit wiadomości. Spróbuj ponownie później." }, 429);
    await sendContactMail(message);
    return json({ ok: true }, 200);
  } catch (error) {
    if (error instanceof ContactValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    // Never expose SMTP credentials, sender/recipient addresses or provider details.
    console.error("Contact form failed", error instanceof Error ? error.name : "unknown");
    return json({ error: "Nie udało się wysłać wiadomości. Prosimy spróbować później lub zadzwonić." }, 503);
  }
}
