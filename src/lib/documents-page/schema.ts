/** Content for the two sections unique to the Dokumenty subpage. Shared hero/footer
 * are deliberately managed by the existing subpages module. */
export const DOCUMENTS_PAGE_SECTIONS = ["downloads", "guidance"] as const;
export type DocumentsPageSection = (typeof DOCUMENTS_PAGE_SECTIONS)[number];

export type DownloadsContent = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  headingScale: number;
};
export type GuidanceStep = { title: string; description: string };
export type GuidanceContent = {
  eyebrow: string;
  title: string;
  description: string;
  headingScale: number;
  steps: [GuidanceStep, GuidanceStep, GuidanceStep];
};

export const DEFAULT_DOWNLOADS: DownloadsContent = {
  eyebrow: "POTRZEBNE FORMULARZE",
  title: "Dokumenty do pobrania",
  description:
    "Przygotowaliśmy najważniejsze formularze związane z formalnościami pogrzebowymi. Mogą je Państwo pobrać w formacie PDF i wypełnić w dogodnym czasie.",
  note: "Nie wiedzą Państwo, który dokument będzie odpowiedni? Chętnie pomożemy w wyborze właściwego formularza.",
  headingScale: 100,
};
export const DEFAULT_GUIDANCE: GuidanceContent = {
  eyebrow: "KROK PO KROKU",
  title: "Spokojnie przez formalności",
  description:
    "Wypełnianie dokumentów w trudnym czasie nie musi oznaczać dodatkowego stresu. Podpowiadamy, od czego zacząć i gdzie uzyskać pomoc.",
  headingScale: 100,
  steps: [
    {
      title: "Wybierz formularz",
      description:
        "Znajdź w powyższej liście dokument właściwy dla instytucji, w której będziesz składać wniosek.",
    },
    {
      title: "Pobierz dokument PDF",
      description:
        "Otwórz lub pobierz formularz i zapoznaj się z informacjami wymaganymi do jego uzupełnienia.",
    },
    {
      title: "Skorzystaj z naszej pomocy",
      description:
        "Jeśli mają Państwo wątpliwości, jesteśmy do dyspozycji i pomożemy odnaleźć potrzebne informacje.",
    },
  ],
};

export class DocumentsPageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentsPageValidationError";
  }
}

export function isDocumentsPageSection(value: string): value is DocumentsPageSection {
  return DOCUMENTS_PAGE_SECTIONS.includes(value as DocumentsPageSection);
}

function record(raw: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new DocumentsPageValidationError("Nieprawidłowa zawartość sekcji.");
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).some((key) => !keys.includes(key)))
    throw new DocumentsPageValidationError("Nieznane pole formularza.");
  return value;
}

function line(value: unknown, name: string, max: number, required = true): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim()) ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new DocumentsPageValidationError(`Nieprawidłowe pole: ${name}.`);
  }
  return value.trim();
}

function scale(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 65 || value > 150)
    throw new DocumentsPageValidationError("Wielkość nagłówka musi mieścić się w przedziale 65–150%.");
  return value;
}

export function parseDownloadsContent(raw: unknown): DownloadsContent {
  const v = record(raw, ["eyebrow", "title", "description", "note", "headingScale"]);
  return {
    eyebrow: line(v.eyebrow, "eyebrow", 100, false),
    title: line(v.title, "title", 150),
    description: line(v.description, "description", 800),
    note: line(v.note, "note", 350, false),
    headingScale: scale(v.headingScale),
  };
}

export function parseGuidanceContent(raw: unknown): GuidanceContent {
  const v = record(raw, ["eyebrow", "title", "description", "headingScale", "steps"]);
  if (!Array.isArray(v.steps) || v.steps.length !== 3)
    throw new DocumentsPageValidationError("Sekcja wymaga dokładnie trzech kroków.");
  const steps = v.steps.map((step: unknown, index: number) => {
    const item = record(step, ["title", "description"]);
    return {
      title: line(item.title, `krok ${index + 1}: tytuł`, 100),
      description: line(item.description, `krok ${index + 1}: opis`, 350),
    };
  }) as GuidanceContent["steps"];
  return {
    eyebrow: line(v.eyebrow, "eyebrow", 100, false),
    title: line(v.title, "title", 150),
    description: line(v.description, "description", 800),
    headingScale: scale(v.headingScale),
    steps,
  };
}
