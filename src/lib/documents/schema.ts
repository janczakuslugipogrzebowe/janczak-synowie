/** Public documents are empty institutional forms, never user-submitted files. */
export type DocumentCategory = "zus" | "krus" | "wbe" | "mswia" | "other";

export type PublicDocument = {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  href: string;
  published: boolean;
};

export const DEFAULT_DOCUMENTS: PublicDocument[] = [
  {
    id: "zas-kl-zus",
    title: "Wniosek o zasiłek pogrzebowy – ZUS",
    description: "Formularz Z-12 dla osób ubiegających się o zasiłek z Zakładu Ubezpieczeń Społecznych.",
    category: "zus",
    href: "/wniosek-o-wyplate-zasilku-pogrzebowego-z-zus.pdf",
    published: true,
  },
  {
    id: "zas-kl-krus",
    title: "Wniosek o zasiłek pogrzebowy – KRUS",
    description: "Wniosek dotyczący zasiłku pogrzebowego z Kasy Rolniczego Ubezpieczenia Społecznego.",
    category: "krus",
    href: "/wniosek-o-wyplate-zasilku-pogrzebowego-z-krus.pdf",
    published: true,
  },
  {
    id: "zas-kl-wbe",
    title: "Wniosek o zasiłek pogrzebowy – WBE",
    description: "Formularz kierowany do właściwego Wojskowego Biura Emerytalnego.",
    category: "wbe",
    href: "/wniosek-o-wyplate-zasilku-pogrzebowego-z-wbe.pdf",
    published: true,
  },
  {
    id: "zas-kl-mswia",
    title: "Wniosek o zasiłek pogrzebowy – MSWiA",
    description: "Wniosek do Zakładu Emerytalno-Rentowego Ministerstwa Spraw Wewnętrznych i Administracji.",
    category: "mswia",
    href: "/wniosek-o-wyplate-zasilku-pogrzebowego-z-mswia.pdf",
    published: true,
  },
];

export class DocumentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentsValidationError";
  }
}

const MAX_ITEMS = 24;
const MAX_PAYLOAD = 22_000;
const SAFE_ID = /^[a-z0-9][a-z0-9-]{1,70}$/;
const SAFE_LOCAL_PDF = /^\/[a-z0-9][a-z0-9_-]{0,140}\.pdf$/i;
const SAFE_GOV_HOSTS = ["zus.pl", "krus.gov.pl", "gov.pl", "wojsko-polskie.pl"];

export function safeDocumentHref(href: string): boolean {
  if (typeof href !== "string" || href.length > 500 || /[\u0000-\u0020<>"'\\]/.test(href)) return false;
  if (SAFE_LOCAL_PDF.test(href)) return true;
  try {
    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      SAFE_GOV_HOSTS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)) &&
      url.pathname.toLowerCase().endsWith(".pdf")
    );
  } catch {
    return false;
  }
}

function getString(obj: Record<string, unknown>, key: string, max: number, required = true): string {
  const value = obj[key];
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim()) ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    throw new DocumentsValidationError(`Nieprawidłowe pole ${key}.`);
  }
  return value.trim();
}

export function parseDocumentLibrary(raw: unknown): PublicDocument[] {
  if (!Array.isArray(raw) || raw.length > MAX_ITEMS || JSON.stringify(raw).length > MAX_PAYLOAD) {
    throw new DocumentsValidationError("Nieprawidłowa biblioteka dokumentów.");
  }
  const seen = new Set<string>();
  return raw.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new DocumentsValidationError(`Dokument ${index + 1}: nieprawidłowe dane.`);
    }
    const obj = entry as Record<string, unknown>;
    const keys = ["id", "title", "description", "category", "href", "published"];
    if (Object.keys(obj).some((key) => !keys.includes(key))) {
      throw new DocumentsValidationError(`Dokument ${index + 1}: nieznane pole.`);
    }
    const id = getString(obj, "id", 72);
    const title = getString(obj, "title", 130);
    const description = getString(obj, "description", 400, false);
    const category = getString(obj, "category", 20) as DocumentCategory;
    const href = getString(obj, "href", 500);
    if (!SAFE_ID.test(id) || seen.has(id))
      throw new DocumentsValidationError("Identyfikator dokumentu musi być unikalny.");
    if (!["zus", "krus", "wbe", "mswia", "other"].includes(category))
      throw new DocumentsValidationError("Nieprawidłowa kategoria.");
    if (!safeDocumentHref(href))
      throw new DocumentsValidationError(
        "Nieprawidłowy adres PDF. Dozwolone są pliki z public lub oficjalne adresy instytucji.",
      );
    if (typeof obj.published !== "boolean")
      throw new DocumentsValidationError("Nieprawidłowy status publikacji.");
    seen.add(id);
    return { id, title, description, category, href, published: obj.published };
  });
}

export const publishedDocuments = (documents: PublicDocument[]) => documents.filter((item) => item.published);
