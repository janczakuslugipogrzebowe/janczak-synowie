export type ObituaryStatus = "draft" | "published" | "archived" | "trash";
export type ObituarySymbol = "cross" | "candle" | "flower" | "none";
export type ObituaryInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string;
  ceremonyDate: string;
  ceremonyPlace: string;
  ceremonyAddress: string;
  burialPlace: string;
  farewell: string;
  symbol: ObituarySymbol;
  seoIndex: boolean;
};
export type ObituaryRecord = ObituaryInput & {
  id: string;
  slug: string;
  status: ObituaryStatus;
  searchName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  updatedBy: string;
};
export const DEFAULT_OBITUARY: ObituaryInput = {
  firstName: "",
  lastName: "",
  birthDate: "",
  deathDate: "",
  ceremonyDate: "",
  ceremonyPlace: "",
  ceremonyAddress: "",
  burialPlace: "",
  farewell: "",
  symbol: "flower",
  seoIndex: false,
};
export const STATUSES: ObituaryStatus[] = ["draft", "published", "archived", "trash"];
export const STATUS_NAMES: Record<ObituaryStatus, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwum",
  trash: "Kosz",
};
export class ObituaryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObituaryValidationError";
  }
}
const clean = (value: unknown, name: string, max: number, required = false) => {
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u0008\u000B-\u001F\u007F]/.test(value) ||
    (required && !value.trim())
  )
    throw new ObituaryValidationError(`Nieprawidłowe pole: ${name}.`);
  return value.trim();
};
const date = (v: unknown, name: string, withTime = false) => {
  const s = clean(v, name, withTime ? 16 : 10);
  if (!s) return "";
  if (withTime) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s))
      throw new ObituaryValidationError(`Nieprawidłowa data: ${name}.`);
    const [d, t] = s.split("T");
    if (!validDate(d) || Number(t.slice(0, 2)) > 23 || Number(t.slice(3)) > 59)
      throw new ObituaryValidationError(`Nieprawidłowa data: ${name}.`);
  } else if (!validDate(s)) throw new ObituaryValidationError(`Nieprawidłowa data: ${name}.`);
  return s;
};
function validDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    y >= 1850 && y <= 2150 && dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}
export function parseObituaryInput(v: unknown): ObituaryInput {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new ObituaryValidationError("Nieprawidłowe dane nekrologu.");
  const o = v as Record<string, unknown>;
  if (Object.keys(o).some((k) => !(k in DEFAULT_OBITUARY)))
    throw new ObituaryValidationError("Nieznane pole nekrologu.");
  const symbol = o.symbol;
  if (symbol !== "cross" && symbol !== "candle" && symbol !== "flower" && symbol !== "none")
    throw new ObituaryValidationError("Nieprawidłowy motyw graficzny.");
  if (typeof o.seoIndex !== "boolean")
    throw new ObituaryValidationError("Nieprawidłowe ustawienie indeksowania.");
  const result: ObituaryInput = {
    firstName: clean(o.firstName, "Imię", 90, true),
    lastName: clean(o.lastName, "Nazwisko", 120, true),
    birthDate: date(o.birthDate, "Data urodzenia"),
    deathDate: date(o.deathDate, "Data śmierci"),
    ceremonyDate: date(o.ceremonyDate, "Data ceremonii", true),
    ceremonyPlace: clean(o.ceremonyPlace, "Miejsce ceremonii", 170),
    ceremonyAddress: clean(o.ceremonyAddress, "Adres ceremonii", 240),
    burialPlace: clean(o.burialPlace, "Miejsce pochówku", 180),
    farewell: clean(o.farewell, "Pożegnanie", 4000),
    symbol,
    seoIndex: o.seoIndex,
  };
  if (result.birthDate && result.deathDate && result.birthDate > result.deathDate)
    throw new ObituaryValidationError("Data urodzenia nie może być późniejsza niż data śmierci.");
  return result;
}
export function obituarySearchName(first: string, last: string) {
  return `${last} ${first}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
/** Canonical route: full ceremony date. Date of death is only a fallback when ceremony is unknown. */
export function toObituarySlug(input: ObituaryInput) {
  const date = input.ceremonyDate.slice(0, 10) || input.deathDate || "bez-daty";
  const names = `${input.firstName}-${input.lastName}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 130 - date.length - 1)
    .replace(/-$/g, "");
  return `${names}-${date}`;
}
/** Numeric suffixes are allowed for same-name, same-day ceremonies. */
export function hasCurrentObituarySlug(input: ObituaryInput, slug: string) {
  const base = toObituarySlug(input);
  if (slug === base) return true;
  if (!slug.startsWith(`${base}-`)) return false;
  const suffix = slug.slice(base.length + 1);
  return /^[1-9][0-9]*$/.test(suffix) && Number.isSafeInteger(Number(suffix)) && Number(suffix) >= 2;
}
export function isSafeId(value: string) {
  return /^[a-zA-Z0-9_-]{8,90}$/.test(value);
}
export function isSafeSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 160;
}
