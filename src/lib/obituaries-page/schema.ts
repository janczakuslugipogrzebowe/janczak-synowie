export const OBITUARIES_PAGE_SECTIONS = ["listing", "information"] as const;
export type ObituariesPageSection = (typeof OBITUARIES_PAGE_SECTIONS)[number];

export type ObituariesListingContent = {
  eyebrow: string;
  title: string;
  headingScale: number;
};
export type ObituariesInformationContent = {
  eyebrow: string;
  title: string;
  description: string;
  ceremonyTitle: string;
  ceremonyDescription: string;
  burialTitle: string;
  burialDescription: string;
  headingScale: number;
};

export const DEFAULT_OBITUARIES_LISTING: ObituariesListingContent = {
  eyebrow: "PAMIĘTAMY RAZEM",
  title: "Ostatnie pożegnania",
  headingScale: 100,
};
export const DEFAULT_OBITUARIES_INFORMATION: ObituariesInformationContent = {
  eyebrow: "INFORMACJE DLA BLISKICH",
  title: "Szczegóły ostatniego pożegnania",
  description:
    "Każde pożegnanie jest wyjątkowym momentem. Przy opublikowanych nekrologach udostępniamy dostępne informacje dotyczące uroczystości, takie jak data i miejsce ceremonii oraz miejsce pochówku, jeśli zostały podane.",
  ceremonyTitle: "Termin uroczystości",
  ceremonyDescription:
    "W szczegółach nekrologu może znajdować się data, godzina i miejsce ostatniego pożegnania.",
  burialTitle: "Miejsce pochówku",
  burialDescription:
    "Jeśli informacja została udostępniona, można ją sprawdzić po otwarciu wybranego nekrologu.",
  headingScale: 100,
};

export class ObituariesPageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObituariesPageValidationError";
  }
}
export function isObituariesPageSection(value: string): value is ObituariesPageSection {
  return OBITUARIES_PAGE_SECTIONS.includes(value as ObituariesPageSection);
}
function object(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ObituariesPageValidationError("Nieprawidłowa zawartość sekcji.");
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !keys.includes(key)))
    throw new ObituariesPageValidationError("Nieznane pole sekcji.");
  return record;
}
function line(value: unknown, name: string, max: number, required = false): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim()) ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new ObituariesPageValidationError(`Nieprawidłowe pole: ${name}.`);
  return value.trim();
}
function scale(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 65 || value > 150)
    throw new ObituariesPageValidationError("Skala nagłówka musi mieścić się w zakresie 65–150%.");
  return value;
}
export function parseObituariesListing(raw: unknown): ObituariesListingContent {
  const item = object(raw, ["eyebrow", "title", "headingScale"]);
  return {
    eyebrow: line(item.eyebrow, "Etykieta", 100),
    title: line(item.title, "Nagłówek", 160, true),
    headingScale: scale(item.headingScale),
  };
}
export function parseObituariesInformation(raw: unknown): ObituariesInformationContent {
  const item = object(raw, [
    "eyebrow",
    "title",
    "description",
    "ceremonyTitle",
    "ceremonyDescription",
    "burialTitle",
    "burialDescription",
    "headingScale",
  ]);
  return {
    eyebrow: line(item.eyebrow, "Etykieta", 100),
    title: line(item.title, "Nagłówek", 160, true),
    description: line(item.description, "Opis", 1000),
    ceremonyTitle: line(item.ceremonyTitle, "Tytuł: uroczystość", 120, true),
    ceremonyDescription: line(item.ceremonyDescription, "Opis: uroczystość", 500),
    burialTitle: line(item.burialTitle, "Tytuł: pochówek", 120, true),
    burialDescription: line(item.burialDescription, "Opis: pochówek", 500),
    headingScale: scale(item.headingScale),
  };
}
