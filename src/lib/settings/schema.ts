export type SiteSettings = {
  companyName: string;
  companyDescription: string;
  addressLine: string;
  postalCity: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  availability: string;
  trustSubtitle: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: "Janczak i Synowie – Usługi Pogrzebowe",
  companyDescription: "Rodzinna firma pogrzebowa z Żelazkowa",
  addressLine: "Żelazków 119A",
  postalCity: "62-817 Żelazków",
  primaryPhone: "605 043 008",
  secondaryPhone: "62 307 02 76",
  email: "",
  mapsUrl: "",
  mapsEmbedUrl: "",
  availability: "Pomoc całodobowa",
  trustSubtitle: "Tradycja i zaufanie",
};

export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsValidationError";
  }
}

export function normalizePhone(value: string): string {
  const phone = value.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{9,15}$/.test(phone)) throw new SettingsValidationError("Nieprawidłowy numer telefonu.");
  // Domestic number; country code can be supplied explicitly.
  return phone.startsWith("+") ? phone : `+48${phone}`;
}

export function isAllowedMapsUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return false;
    const h = u.hostname.toLowerCase();
    return (
      h === "maps.app.goo.gl" ||
      ((h === "www.google.com" ||
        h === "google.com" ||
        h === "maps.google.com" ||
        h === "www.google.pl" ||
        h === "google.pl") &&
        (u.pathname.startsWith("/maps") || u.pathname === "/maps"))
    );
  } catch {
    return false;
  }
}

export function directionsUrl(settings: SiteSettings): string | null {
  return settings.mapsUrl && isAllowedMapsUrl(settings.mapsUrl) ? settings.mapsUrl : null;
}

/** Maps -> Udostępnij -> Umieść mapę. CMS accepts either the iframe src or the entire embed snippet. */
export function normalizeMapsEmbed(value: string): string | null {
  const raw = value.trim();
  if (!raw) return "";
  // Never render arbitrary HTML: extract only the src URL from a Google iframe.
  const iframe = /^<iframe\b[\s\S]*<\/iframe>\s*$/i.test(raw);
  const candidate = iframe ? raw.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]?.replace(/&amp;/gi, "&") : raw;
  if (!candidate || candidate.length > 4000) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null;
    if (!["www.google.com", "google.com", "www.google.pl"].includes(url.hostname.toLowerCase())) return null;
    if (url.pathname !== "/maps/embed" || !url.searchParams.has("pb")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function googleMapsEmbedUrl(settings: SiteSettings): string {
  const configured = normalizeMapsEmbed(settings.mapsEmbedUrl || "");
  if (configured) return configured;
  const address = `${settings.addressLine}, ${settings.postalCity}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** Accept older published documents while strictly validating all new writes. */
export function parseSiteSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new SettingsValidationError("Nieprawidłowe dane firmy.");
  const input = value as Record<string, unknown>;
  const allowed = Object.keys(DEFAULT_SITE_SETTINGS);
  if (Object.keys(input).some((key) => !allowed.includes(key)))
    throw new SettingsValidationError("Niedozwolone pole formularza.");
  const merged = { ...DEFAULT_SITE_SETTINGS, ...input } as Record<string, unknown>;
  const result = {} as SiteSettings;
  for (const key of allowed as (keyof SiteSettings)[]) {
    const raw = merged[key];
    if (typeof raw !== "string") throw new SettingsValidationError(`Nieprawidłowe pole: ${key}`);
    const v = key === "mapsEmbedUrl" ? (normalizeMapsEmbed(raw) ?? raw.trim()) : raw.trim();
    const optional = key === "email" || key === "mapsUrl" || key === "mapsEmbedUrl";
    if (
      (!optional && !v) ||
      v.length >
        (key === "mapsEmbedUrl"
          ? 4000
          : key === "mapsUrl"
            ? 1800
            : key === "companyDescription"
              ? 240
              : 120) ||
      /[\u0000-\u001F\u007F]/u.test(v)
    )
      throw new SettingsValidationError(`Niepoprawna wartość: ${key}`);
    result[key] = v;
  }
  normalizePhone(result.primaryPhone);
  normalizePhone(result.secondaryPhone);
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))
    throw new SettingsValidationError("Nieprawidłowy adres e-mail.");
  if (!isAllowedMapsUrl(result.mapsUrl))
    throw new SettingsValidationError(
      "Wklej prawidłowy link Google Maps (maps.app.goo.gl lub google.com/maps).",
    );
  if (normalizeMapsEmbed(result.mapsEmbedUrl) === null)
    throw new SettingsValidationError(
      "Podaj kod iframe z Google Maps lub jego prawidłowy adres src (Udostępnij → Umieść mapę).",
    );
  return result;
}
