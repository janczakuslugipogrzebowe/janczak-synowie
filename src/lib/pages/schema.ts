export const PAGE_SLUGS = ["o-nas", "oferta", "nekrologi", "dokumenty", "galeria", "kontakt"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
export type PageContent = { eyebrow: string; title: string; description: string };
export const PAGE_DEFAULTS: Record<PageSlug, PageContent> = {
  "o-nas": {
    eyebrow: "RODZINNA FIRMA",
    title: "O nas",
    description:
      "Rodzinna firma oparta na doświadczeniu i zaufaniu\n\nJesteśmy rodzinną firmą pogrzebową, która od wielu lat świadczy kompleksowe usługi pogrzebowe, wspierając rodziny w najtrudniejszych chwilach życia. Doskonale rozumiemy, jak ważne w tym czasie są spokój, zrozumienie oraz profesjonalna i życzliwa pomoc.\n\nNaszą działalność opieramy na szacunku, empatii i indywidualnym podejściu do każdej rodziny. Dokładamy wszelkich starań, aby każda ceremonia pożegnalna przebiegała w godnej i spokojnej atmosferze, zgodnie z wolą zmarłego oraz oczekiwaniami jego najbliższych.\n\nDzięki zdobytemu doświadczeniu zapewniamy kompleksową organizację uroczystości pogrzebowych oraz pomoc w dopełnieniu niezbędnych formalności, starając się odciążyć rodziny z obowiązków związanych z przygotowaniem ostatniego pożegnania.",
  },
  oferta: {
    eyebrow: "NASZE USŁUGI",
    title: "Oferta",
    description: "Kompleksowa organizacja uroczystości pogrzebowych i wsparcie w formalnościach.",
  },
  nekrologi: {
    eyebrow: "PAMIĘTAMY RAZEM",
    title: "Nekrologi",
    description: "Informacje o uroczystościach pożegnalnych oraz pamięć o bliskich.",
  },
  dokumenty: {
    eyebrow: "POMOC W FORMALNOŚCIACH",
    title: "Dokumenty",
    description: "Najważniejsze dokumenty i formularze potrzebne przy organizacji pogrzebu.",
  },
  galeria: { eyebrow: "NASZA PRZESTRZEŃ", title: "Galeria", description: "Zdjęcia firmy i jej otoczenia." },
  kontakt: {
    eyebrow: "JESTEŚMY DLA PAŃSTWA",
    title: "Kontakt",
    description: "Skontaktuj się z nami, kiedy potrzebujesz pomocy i wsparcia.",
  },
};
export const PAGE_LABELS: Record<PageSlug, string> = {
  "o-nas": "O nas",
  oferta: "Oferta",
  nekrologi: "Nekrologi",
  dokumenty: "Dokumenty",
  galeria: "Galeria",
  kontakt: "Kontakt",
};
export function isPageSlug(v: string): v is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(v);
}
export class PageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PageValidationError";
  }
}
export function parsePageContent(value: unknown): PageContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new PageValidationError("Niepoprawny format podstrony.");
  const obj = value as Record<string, unknown>;
  const keys = ["eyebrow", "title", "description"];
  if (Object.keys(obj).some((key) => !keys.includes(key)))
    throw new PageValidationError("Nieznane pole podstrony.");
  const out = {} as PageContent;
  for (const k of keys as (keyof PageContent)[]) {
    const v = obj[k];
    if (
      typeof v !== "string" ||
      !v.trim() ||
      v.trim().length > (k === "description" ? 1800 : k === "title" ? 120 : 120) ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(v) ||
      (k !== "description" && /[\n\r]/.test(v))
    )
      throw new PageValidationError(`Niepoprawne pole: ${k}`);
    out[k] = v.trim();
  }
  return out;
}
