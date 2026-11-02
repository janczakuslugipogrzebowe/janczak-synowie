/** Images may be local public assets or public Vercel Blob files only. */
export function safeOfferImage(url: string): boolean {
  if (typeof url !== "string" || url.length > 500 || /["'\\()< >\u0000-\u0020]/.test(url)) return false;
  if (/^\/[a-zA-Z0-9][a-zA-Z0-9/_-]*\.(png|jpe?g|webp|avif)$/i.test(url) && !url.includes("//") && !url.includes("..")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password && !u.port &&
      (u.hostname === "public.blob.vercel-storage.com" || u.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(png|jpe?g|webp|avif)$/i.test(u.pathname);
  } catch { return false; }
}

export const OFFER_SECTIONS = ["intro", "catalog", "formalities", "process", "florist"] as const;
export type OfferSection = (typeof OFFER_SECTIONS)[number];
export const isOfferSection = (value: string): value is OfferSection => OFFER_SECTIONS.includes(value as OfferSection);
export const OFFER_CATEGORIES = ["Organizacja uroczystości", "Transport i logistyka", "Wyposażenie i pochówek", "Usługi dodatkowe"] as const;
export type OfferCategory = (typeof OFFER_CATEGORIES)[number];
export type OfferService = {
  id: string;
  category: OfferCategory;
  title: string;
  lead: string;
  details: string;
  bullets: string[];
  note: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  layout: "feature" | "compact";
  cta: "contact" | "documents" | "none";
  visible: boolean;
  faq: { question: string; answer: string }[];
};
export type OfferIntro = { eyebrow: string; title: string; description: string; headingScale: number };
export type OfferCatalog = { eyebrow: string; title: string; description: string; headingScale: number; items: OfferService[] };
export type OfferFormalities = { eyebrow: string; title: string; description: string; benefits: { title: string; description: string; points: string[] }[]; note: string; headingScale: number };
export type OfferProcess = { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[]; headingScale: number };
export type OfferFlorist = { eyebrow: string; title: string; description: string; points: string[]; imageUrl: string; imagePositionX: number; imagePositionY: number; hours: string; headingScale: number };
export type OfferContentMap = { intro: OfferIntro; catalog: OfferCatalog; formalities: OfferFormalities; process: OfferProcess; florist: OfferFlorist };

const service = (id: string, category: OfferCategory, title: string, lead: string, details: string, bullets: string[], imageUrl: string, layout: OfferService["layout"] = "feature"): OfferService => ({
  id, category, title, lead, details, bullets, imageUrl, imagePositionX: 50, imagePositionY: 50,
  layout, cta: "contact", visible: true, note: "", faq: [],
});
export const OFFER_DEFAULTS: OfferContentMap = {
  intro: {
    eyebrow: "NASZA OFERTA", title: "Kompleksowa pomoc w organizacji pożegnania",
    description: "Organizujemy uroczystości pogrzebowe i wspieramy rodziny w sprawach związanych z pochówkiem. Poniżej przedstawiamy szczegółowy zakres naszej pomocy.",
    headingScale: 100,
  },
  catalog: {
    eyebrow: "ZAKRES USŁUG", title: "W czym możemy Państwu pomóc",
    description: "Od pierwszych ustaleń po przebieg ceremonii — przedstawiamy obszary naszej działalności. Szczegółowe możliwości i zakres organizacji uzgadniamy z rodziną.", headingScale: 100,
    items: [
      service("organizacja-pogrzebow", "Organizacja uroczystości", "Organizacja uroczystości pogrzebowych", "Pomagamy przygotować godne pożegnanie, z uwzględnieniem życzeń rodziny i charakteru uroczystości.", "Zajmujemy się uzgodnionymi etapami przygotowań do ceremonii. Doradzamy przy wyborze oprawy, wyposażenia i przebiegu uroczystości, tak aby bliscy mogli skupić się na pożegnaniu.", ["Ustalenie charakteru i przebiegu ceremonii", "Koordynacja przygotowań", "Pomoc w wyborze oprawy pożegnania"], "/uslugi1-home.png"),
      service("oprawa-uroczystosci", "Organizacja uroczystości", "Uroczysta i muzyczna oprawa", "Dbamy o godny charakter ostatniego pożegnania, także o oprawę muzyczną.", "Szczegóły ceremonii i jej oprawy ustalamy wspólnie z rodziną. Możliwości dostosowujemy do miejsca i charakteru uroczystości.", ["Oprawa uroczystości pogrzebowej", "Oprawa muzyczna", "Uzgodnienie indywidualnych elementów ceremonii"], "/uslugi-home.png", "compact"),
      service("transport-zmarlych", "Transport i logistyka", "Transport zmarłych", "Organizujemy transport zmarłych oraz wspieramy rodziny w sprawach związanych z przewozem.", "Pomagamy ustalić organizację transportu oraz niezbędne czynności, również gdy uroczystość odbywa się poza miejscem zamieszkania rodziny.", ["Transport na terenie kraju", "Sprawy związane z transportem międzynarodowym", "Uzgodnienie niezbędnych formalności"], "/uslugi2-home.png"),
      service("pogrzeby-w-kraju-i-za-granica", "Transport i logistyka", "Organizacja pogrzebów w kraju i za granicą", "Pomagamy koordynować uroczystości na cmentarzach w Polsce i za granicą.", "Zakres działań i możliwość realizacji uzgadniamy indywidualnie, z uwzględnieniem lokalnych warunków oraz formalności.", ["Ustalenia z rodziną dotyczące miejsca pochówku", "Koordynacja organizacji uroczystości", "Pomoc w zaplanowaniu transportu"], "/uslugi2-home.png", "compact"),
      service("autokar", "Transport i logistyka", "Autokar dla uczestników uroczystości", "W ramach oferty dostępna jest możliwość zorganizowania przejazdu autokarem.", "Szczegóły i dostępność uzgadniamy podczas przygotowania uroczystości.", ["Ustalenie potrzeb przewozowych", "Omówienie trasy i organizacji przejazdu"], "/uslugi2-home.png", "compact"),
      service("trumny-i-urny", "Wyposażenie i pochówek", "Trumny, urny i krzyże", "Oferujemy wybór elementów wyposażenia potrzebnych do organizacji pochówku.", "Przedstawiamy dostępne trumny, urny i krzyże oraz pomagamy dobrać rozwiązanie do rodzaju ceremonii i oczekiwań rodziny.", ["Trumny", "Urny", "Krzyże"], "/uslugi3-home.png"),
      service("kremacje", "Wyposażenie i pochówek", "Kremacje", "Pomagamy w organizacji uroczystości związanej z kremacją.", "Wyjaśniamy dostępne możliwości, formalności oraz przebieg przygotowań i ustalamy z rodziną szczegóły pożegnania.", ["Omówienie dostępnych form pożegnania", "Pomoc przy organizacji kremacji", "Dobór urny"], "/uslugi3-home.png", "compact"),
      service("ekshumacje", "Usługi dodatkowe", "Ekshumacje", "Pomagamy w organizacji czynności związanych z ekshumacją.", "Zakres i termin realizacji są uzależnione od wymaganych formalności oraz obowiązujących przepisów. Szczegóły omawiamy indywidualnie.", ["Informacje o wymaganych formalnościach", "Ustalenie organizacji działań"], "/uslugi1-home.png", "compact"),
      service("odziez-okolicznosciowa", "Usługi dodatkowe", "Odzież okolicznościowa", "W naszej ofercie znajduje się również odzież okolicznościowa.", "Informacje o dostępnych wariantach i doborze przekazujemy podczas bezpośredniej rozmowy.", ["Dobór odzieży okolicznościowej", "Informacje o aktualnej dostępności"], "/uslugi3-home.png", "compact"),
      service("pomniki-i-nagrobki", "Usługi dodatkowe", "Pomniki i nagrobki", "Udzielamy informacji o dostępnych pomnikach i nagrobkach.", "Możliwości i szczegóły oferty przedstawiamy indywidualnie, z uwzględnieniem potrzeb rodziny.", ["Pomniki", "Nagrobki", "Indywidualne ustalenia"], "/uslugi3-home.png", "compact"),
    ],
  },
  formalities: {
    eyebrow: "POMOC W FORMALNOŚCIACH", title: "Formalności i rozliczenia",
    description: "Pomagamy uporządkować kwestie urzędowe i dokumenty związane z organizacją pogrzebu. Informujemy także o możliwości bezgotówkowego rozliczenia kosztów uroczystości.",
    benefits: [
      { title: "Dokumenty ZUS i KRUS", description: "Na życzenie rodziny pomagamy w formalnościach dotyczących zasiłku pogrzebowego.", points: ["Informacje o potrzebnych dokumentach", "Pomoc w wypełnianiu formalności", "Formularze dostępne w dziale Dokumenty"] },
      { title: "Rozliczenie bezgotówkowe", description: "Przedstawiamy możliwość bezgotówkowego rozliczenia pogrzebu, zależnie od okoliczności i zasad rozliczenia.", points: ["Omówienie sposobu rozliczenia", "Informacje o wymaganych dokumentach", "Indywidualne ustalenie szczegółów"] },
    ],
    note: "Szczegółowy zakres pomocy oraz warunki rozliczenia uzgadniamy indywidualnie.", headingScale: 100,
  },
  process: {
    eyebrow: "KROK PO KROKU", title: "Jak wygląda organizacja pożegnania?",
    description: "Każdą uroczystość przygotowujemy indywidualnie. Poniżej przedstawiamy typowy przebieg współpracy.",
    steps: [
      { title: "Pierwsza rozmowa", description: "Poznajemy potrzeby rodziny i ustalamy, jakiej pomocy Państwo oczekują." },
      { title: "Uzgodnienie szczegółów", description: "Omawiamy przebieg ceremonii, miejsce pożegnania i dostępne rozwiązania." },
      { title: "Przygotowania i dokumenty", description: "Koordynujemy uzgodnione czynności i pomagamy w formalnościach." },
      { title: "Uroczystość pożegnalna", description: "Realizujemy ustalony przebieg ceremonii, dbając o jej godny charakter." },
    ], headingScale: 100,
  },
  florist: {
    eyebrow: "WŁASNA KWIACIARNIA", title: "Florystyczna oprawa pożegnania",
    description: "W naszej kwiaciarni przygotowujemy wieńce, wiązanki i kompozycje kwiatowe, które towarzyszą ostatniemu pożegnaniu. Oferujemy również kwiaty cięte i doniczkowe oraz bukiety okolicznościowe.",
    points: ["Wieńce i wiązanki pogrzebowe", "Kompozycje kwiatowe", "Bukiety okolicznościowe"],
    imageUrl: "/kwiaciarnia-home.png", imagePositionX: 50, imagePositionY: 50,
    hours: "Poniedziałek–piątek 8:00–17:00 · Sobota 8:00–15:00", headingScale: 100,
  },
};

export class OfferValidationError extends Error { constructor(message: string) { super(message); this.name = "OfferValidationError"; } }
const obj = (raw: unknown, keys: readonly string[], label: string): Record<string, unknown> => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new OfferValidationError(`Nieprawidłowa sekcja: ${label}.`);
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).some(k => !keys.includes(k))) throw new OfferValidationError(`Nieznane pole: ${label}.`);
  return v;
};
function line(value: unknown, label: string, max: number, required = true, multiline = false): string {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim()) || (multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/).test(value)) throw new OfferValidationError(`Nieprawidłowe pole: ${label}.`);
  return value.trim();
}
const scale = (v: unknown) => { if (typeof v !== "number" || !Number.isInteger(v) || v < 65 || v > 150) throw new OfferValidationError("Wielkość nagłówka: 65–150%."); return v; };
const pos = (v: unknown) => { if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 100) throw new OfferValidationError("Pozycja zdjęcia: 0–100%."); return v; };
const lines = (v: unknown, label: string, maxItems: number, maxLine: number) => {
  if (!Array.isArray(v) || v.length > maxItems) throw new OfferValidationError(`Nieprawidłowa lista: ${label}.`);
  return v.map((x, i) => line(x, `${label} ${i + 1}`, maxLine));
};
const heading = (v: Record<string, unknown>) => ({ eyebrow: line(v.eyebrow, "etykieta", 100, false), title: line(v.title, "nagłówek", 180), description: line(v.description, "opis", 1500, true, true), headingScale: scale(v.headingScale) });
export function parseOfferSection<S extends OfferSection>(section: S, raw: unknown): OfferContentMap[S] {
  const shared = ["eyebrow", "title", "description", "headingScale"];
  if (section === "intro") {
    const intro = heading(obj(raw, shared, section));
    // Read-only copy migration: preserve custom CMS content; upgrade only the original stock wording.
    if (intro.description === "Zapewniamy wsparcie w przygotowaniu uroczystości pogrzebowych, organizacji transportu, doborze niezbędnego wyposażenia i dopełnieniu formalności. Każdą sprawę omawiamy indywidualnie, z szacunkiem dla potrzeb rodziny.") intro.description = "Organizujemy uroczystości pogrzebowe i wspieramy rodziny w sprawach związanych z pochówkiem. Poniżej przedstawiamy szczegółowy zakres naszej pomocy.";
    return intro as OfferContentMap[S];
  }
  if (section === "catalog") {
    const v = obj(raw, [...shared, "items"], section);
    if (!Array.isArray(v.items) || v.items.length > 24) throw new OfferValidationError("Katalog może zawierać maksymalnie 24 usługi.");
    const unique = new Set<string>();
    const items = v.items.map((rawItem: unknown, i): OfferService => {
      const item = obj(rawItem, ["id", "category", "title", "lead", "details", "bullets", "note", "imageUrl", "imagePositionX", "imagePositionY", "layout", "cta", "visible", "faq"], `usługa ${i + 1}`);
      const id = line(item.id, "identyfikator", 70);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || unique.has(id) || id === "kwiaciarnia") throw new OfferValidationError("Identyfikator usługi jest niepoprawny lub zajęty.");
      unique.add(id);
      if (!OFFER_CATEGORIES.includes(item.category as OfferCategory)) throw new OfferValidationError("Nieznana kategoria usługi.");
      const imageUrl = line(item.imageUrl, "zdjęcie", 500, false);
      if (imageUrl && !safeOfferImage(imageUrl)) throw new OfferValidationError("Nieprawidłowy adres zdjęcia usługi.");
      if (item.layout !== "feature" && item.layout !== "compact") throw new OfferValidationError("Nieznany układ usługi.");
      if (!["contact", "documents", "none"].includes(item.cta as string)) throw new OfferValidationError("Nieprawidłowy przycisk usługi.");
      if (typeof item.visible !== "boolean") throw new OfferValidationError("Nieprawidłowa widoczność usługi.");
      if (!Array.isArray(item.faq) || item.faq.length > 4) throw new OfferValidationError("Maksymalnie cztery pytania na usługę.");
      return { id, category: item.category as OfferCategory, title: line(item.title, "tytuł usługi", 140), lead: line(item.lead, "wprowadzenie", 500), details: line(item.details, "opis szczegółowy", 2500, false, true), bullets: lines(item.bullets, "zakres usługi", 8, 220), note: line(item.note, "uwaga", 350, false, true), imageUrl, imagePositionX: pos(item.imagePositionX), imagePositionY: pos(item.imagePositionY), layout: item.layout as OfferService["layout"], cta: item.cta as OfferService["cta"], visible: item.visible as boolean, faq: item.faq.map((x: unknown) => { const f = obj(x, ["question", "answer"], "FAQ"); return { question: line(f.question, "pytanie", 220), answer: line(f.answer, "odpowiedź", 700, true, true) }; }) };
    });
    return { ...heading(v), items } as OfferContentMap[S];
  }
  if (section === "formalities") {
    const v = obj(raw, [...shared, "benefits", "note"], section);
    if (!Array.isArray(v.benefits) || v.benefits.length !== 2) throw new OfferValidationError("Sekcja formalności wymaga dwóch obszarów.");
    return { ...heading(v), note: line(v.note, "uwaga", 450, false, true), benefits: v.benefits.map((x: unknown) => { const b = obj(x, ["title", "description", "points"], "obszar formalności"); return { title: line(b.title, "nazwa obszaru", 110), description: line(b.description, "opis obszaru", 800, true, true), points: lines(b.points, "punkty formalności", 6, 220) }; }) } as OfferContentMap[S];
  }
  if (section === "process") {
    const v = obj(raw, [...shared, "steps"], section);
    if (!Array.isArray(v.steps) || v.steps.length < 2 || v.steps.length > 6) throw new OfferValidationError("Wymagane są 2–6 etapów współpracy.");
    return { ...heading(v), steps: v.steps.map((x: unknown) => { const s = obj(x, ["title", "description"], "etap współpracy"); return { title: line(s.title, "nazwa etapu", 120), description: line(s.description, "opis etapu", 500, true, true) }; }) } as OfferContentMap[S];
  }
  const v = obj(raw, [...shared, "points", "imageUrl", "imagePositionX", "imagePositionY", "hours"], section);
  const imageUrl = line(v.imageUrl, "zdjęcie kwiaciarni", 500, false);
  if (imageUrl && !safeOfferImage(imageUrl)) throw new OfferValidationError("Nieprawidłowe zdjęcie kwiaciarni.");
  return { ...heading(v), points: lines(v.points, "florystyka", 6, 170), imageUrl, imagePositionX: pos(v.imagePositionX), imagePositionY: pos(v.imagePositionY), hours: line(v.hours, "godziny kwiaciarni", 160, false) } as OfferContentMap[S];
}
