import { OFFER_CATEGORIES, OFFER_DEFAULTS, parseOfferSection, safeOfferImage, type OfferCatalog, type OfferService } from "./schema";

export type OfferCategoryRecord = { id: string; title: string; description: string; visible: boolean; imageUrl: string };
export type ManagedOfferService = Omit<OfferService, "category"> & { categoryId: string };
export type ServiceCatalog = { categories: OfferCategoryRecord[]; items: ManagedOfferService[] };
export class ServiceCatalogValidationError extends Error {
  constructor(message: string) { super(message); this.name = "ServiceCatalogValidationError"; }
}
const categoryIds = ["organizacja-uroczystosci", "transport-i-logistyka", "wyposazenie-i-pochowek", "uslugi-dodatkowe"];
export const slugifyOffer = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52) || "nowa-pozycja";
export function uniqueOfferId(input: string, existing: { id: string }[]): string {
  const base = slugifyOffer(input);
  let id = base, count = 2;
  while (existing.some(x => x.id === id) || id === "kwiaciarnia") id = `${base}-${count++}`;
  return id;
}
export function fromLegacyOffer(legacy: OfferCatalog = OFFER_DEFAULTS.catalog): ServiceCatalog {
  const validated = parseOfferSection("catalog", legacy);
  const descriptions = [
    "Przygotowanie uroczystości oraz oprawa ceremonii pożegnalnej.",
    "Transport zmarłych i organizacja przejazdów związanych z uroczystością.",
    "Wyposażenie ceremonii oraz pomoc w wyborze formy pochówku.",
    "Pozostałe usługi i rozwiązania ustalane indywidualnie z rodziną.",
  ];
  return {
    categories: OFFER_CATEGORIES.map((title, i) => ({ id: categoryIds[i], title, description: descriptions[i], visible: true, imageUrl: "" })),
    items: validated.items.map(({ category, ...item }) => ({ ...item, categoryId: categoryIds[OFFER_CATEGORIES.indexOf(category)] })),
  };
}
export const DEFAULT_SERVICE_CATALOG = fromLegacyOffer();
const record = (x: unknown, allowed: string[], label: string): Record<string, unknown> => {
  if (!x || typeof x !== "object" || Array.isArray(x)) throw new ServiceCatalogValidationError(`Nieprawidłowe dane: ${label}.`);
  const r = x as Record<string, unknown>;
  if (Object.keys(r).some(k => !allowed.includes(k))) throw new ServiceCatalogValidationError(`Nieznane pole: ${label}.`);
  return r;
};
const str = (x: unknown, label: string, max: number, required = true, multiline = false) => {
  if (typeof x !== "string" || x.length > max || (required && !x.trim()) || (multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(x)) throw new ServiceCatalogValidationError(`Nieprawidłowe pole: ${label}.`);
  return x.trim();
};
const idOf = (x: unknown) => {
  const id = str(x, "identyfikator", 70);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id === "kwiaciarnia") throw new ServiceCatalogValidationError("Nieprawidłowy identyfikator.");
  return id;
};
const pos = (x: unknown) => {
  if (!Number.isInteger(x) || (x as number) < 0 || (x as number) > 100) throw new ServiceCatalogValidationError("Kadrowanie musi być w zakresie 0–100%.");
  return x as number;
};
const image = (x: unknown) => {
  const url = str(x, "obraz", 500, false);
  if (url && !safeOfferImage(url)) throw new ServiceCatalogValidationError("Niedozwolony adres zdjęcia.");
  return url;
};
export function parseServiceCatalog(input: unknown): ServiceCatalog {
  const root = record(input, ["categories", "items"], "katalog");
  if (!Array.isArray(root.categories) || root.categories.length > 12 || !root.categories.length) throw new ServiceCatalogValidationError("Katalog musi mieć od 1 do 12 kategorii.");
  if (!Array.isArray(root.items) || root.items.length > 60) throw new ServiceCatalogValidationError("Katalog może mieć maksymalnie 60 usług.");
  const categories: OfferCategoryRecord[] = root.categories.map((raw, i) => {
    const c = record(raw, ["id", "title", "description", "visible", "imageUrl"], `kategoria ${i + 1}`);
    if (typeof c.visible !== "boolean") throw new ServiceCatalogValidationError("Nieprawidłowa widoczność kategorii.");
    return { id: idOf(c.id), title: str(c.title, "nazwa kategorii", 100), description: str(c.description, "opis kategorii", 700, false, true), visible: c.visible, imageUrl: image(c.imageUrl) };
  });
  if (new Set(categories.map(c => c.id)).size !== categories.length) throw new ServiceCatalogValidationError("Powtarzający się identyfikator kategorii.");
  const ids = new Set(categories.map(c => c.id));
  const items: ManagedOfferService[] = root.items.map((raw, i) => {
    const a = record(raw, ["id", "categoryId", "title", "lead", "details", "bullets", "note", "imageUrl", "imagePositionX", "imagePositionY", "layout", "cta", "visible", "faq"], `usługa ${i + 1}`);
    const categoryId = idOf(a.categoryId);
    if (!ids.has(categoryId)) throw new ServiceCatalogValidationError("Usługa jest przypisana do nieistniejącej kategorii.");
    if (typeof a.visible !== "boolean" || !["feature", "compact"].includes(a.layout as string) || !["contact", "documents", "none"].includes(a.cta as string)) throw new ServiceCatalogValidationError("Nieprawidłowe ustawienia usługi.");
    if (!Array.isArray(a.bullets) || a.bullets.length > 12 || !Array.isArray(a.faq) || a.faq.length > 8) throw new ServiceCatalogValidationError("Za dużo punktów lub pytań w usłudze.");
    return {
      id: idOf(a.id), categoryId,
      title: str(a.title, "nazwa usługi", 140), lead: str(a.lead, "krótki opis", 500),
      details: str(a.details, "opis szczegółowy", 5000, false, true),
      bullets: a.bullets.map(b => str(b, "punkt usługi", 240)),
      note: str(a.note, "dodatkowa informacja", 500, false, true),
      imageUrl: image(a.imageUrl), imagePositionX: pos(a.imagePositionX), imagePositionY: pos(a.imagePositionY),
      layout: a.layout as ManagedOfferService["layout"], cta: a.cta as ManagedOfferService["cta"], visible: a.visible as boolean,
      faq: a.faq.map((faq, j) => { const f = record(faq, ["question", "answer"], `pytanie ${j+1}`); return { question: str(f.question, "pytanie", 220), answer: str(f.answer, "odpowiedź", 1100, true, true) }; }),
    };
  });
  if (new Set(items.map(s => s.id)).size !== items.length) throw new ServiceCatalogValidationError("Powtarzający się identyfikator usługi.");
  if (items.some(s => ids.has(s.id))) throw new ServiceCatalogValidationError("Identyfikatory usług i kategorii muszą być różne.");
  return { categories, items };
}
export function visibleOfferCategories(data: ServiceCatalog) {
  return data.categories.filter(c => c.visible && data.items.some(s => s.visible && s.categoryId === c.id));
}

/** One dominant image per category; legacy service photographs remain useful as fallbacks. */
export function categoryCover(category: OfferCategoryRecord, items: ManagedOfferService[]) {
  if (category.imageUrl) return {src: category.imageUrl, x: 50, y: 50};
  const first = items.find(item => item.categoryId === category.id && item.visible && item.imageUrl);
  return first ? {src: first.imageUrl, x: first.imagePositionX, y: first.imagePositionY} : {src: "", x: 50, y: 50};
}
