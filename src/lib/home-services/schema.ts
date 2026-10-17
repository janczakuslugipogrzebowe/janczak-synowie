export type HomeService = {
  title: string;
  description: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
};

export type HomeServicesContent = {
  eyebrow: string;
  headline: string;
  backgroundImageUrl: string;
  buttonLabel: string;
  buttonHref: string;
  headingScale: number;
  cardTitleScale: number;
  cardDescriptionScale: number;
  cardImageHeightScale: number;
  cardGapScale: number;
  backgroundOpacity: number;
  services: HomeService[];
};

export const DEFAULT_HOME_SERVICES: HomeServicesContent = {
  eyebrow: "NASZE USŁUGI",
  headline: "Kompleksowa opieka\nz szacunkiem i doświadczeniem",
  backgroundImageUrl: "/uslugi-home.png",
  buttonLabel: "Zobacz więcej",
  buttonHref: "/oferta",
  headingScale: 100,
  cardTitleScale: 100,
  cardDescriptionScale: 100,
  cardImageHeightScale: 100,
  cardGapScale: 100,
  backgroundOpacity: 85,
  services: [
    {
      title: "Organizacja uroczystości pogrzebowych",
      description:
        "Kompleksowa organizacja ceremonii, pomoc w formalnościach ZUS i KRUS oraz bezgotówkowym rozliczeniu pogrzebu.",
      imageUrl: "/uslugi1-home.png",
      imagePositionX: 50,
      imagePositionY: 50,
    },
    {
      title: "Transport zmarłych",
      description:
        "Transport krajowy i międzynarodowy oraz organizacja pogrzebów na cmentarzach w kraju i za granicą.",
      imageUrl: "/uslugi2-home.png",
      imagePositionX: 50,
      imagePositionY: 50,
    },
    {
      title: "Trumny i urny",
      description:
        "Duży wybór trumien, urn i krzyży, dopasowanych do charakteru uroczystości oraz życzeń rodziny.",
      imageUrl: "/uslugi3-home.png",
      imagePositionX: 50,
      imagePositionY: 50,
    },
    {
      title: "Oprawa florystyczna",
      description: "Wieńce, wiązanki i kompozycje kwiatowe przygotowywane przez naszą rodzinną kwiaciarnię.",
      imageUrl: "/uslugi4-home.png",
      imagePositionX: 50,
      imagePositionY: 50,
    },
  ],
};

export class HomeServicesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeServicesValidationError";
  }
}

/** Local image paths and public Vercel Blob only. Never render arbitrary remote URLs. */
export function safeServiceImage(url: string): boolean {
  if (typeof url !== "string" || url.length > 500 || /["'\\()< >\u0000-\u0020]/.test(url)) return false;
  if (
    /^\/[a-zA-Z0-9][a-zA-Z0-9/_-]*\.(png|jpe?g|webp|avif)$/i.test(url) &&
    !url.includes("//") &&
    !url.includes("..")
  )
    return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      (parsed.hostname === "public.blob.vercel-storage.com" ||
        parsed.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(png|jpe?g|webp|avif)$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function safeServicesHref(href: string): boolean {
  return href === "/oferta" || /^\/oferta#[a-z0-9-]{1,70}$/i.test(href);
}

export function parseHomeServices(value: unknown): HomeServicesContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HomeServicesValidationError("Nieprawidłowe dane sekcji usług.");
  const obj = value as Record<string, unknown>;
  const keys = new Set(Object.keys(DEFAULT_HOME_SERVICES));
  if (Object.keys(obj).some((key) => !keys.has(key)))
    throw new HomeServicesValidationError("Nieznane pole w sekcji usług.");

  function text(key: keyof HomeServicesContent, max: number, multiline = false): string {
    const val = obj[key];
    if (
      typeof val !== "string" ||
      !val.trim() ||
      val.trim().length > max ||
      (multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/).test(val)
    ) {
      throw new HomeServicesValidationError(`Nieprawidłowe pole: ${key}.`);
    }
    return val.trim();
  }
  function number(key: keyof HomeServicesContent, min: number, max: number): number {
    const val = obj[key] ?? DEFAULT_HOME_SERVICES[key];
    if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max)
      throw new HomeServicesValidationError(`Pole ${key}: zakres ${min}–${max}.`);
    return val;
  }
  if (!Array.isArray(obj.services) || obj.services.length !== 4)
    throw new HomeServicesValidationError("Wymagane są cztery usługi.");
  const services = obj.services.map((raw, i): HomeService => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new HomeServicesValidationError(`Usługa ${i + 1}: błędny format.`);
    const item = raw as Record<string, unknown>;
    const known = new Set(["title", "description", "imageUrl", "imagePositionX", "imagePositionY"]);
    if (Object.keys(item).some((key) => !known.has(key)))
      throw new HomeServicesValidationError(`Usługa ${i + 1}: nieznane pole.`);
    const getText = (key: "title" | "description" | "imageUrl", max: number) => {
      const val = item[key];
      if (
        typeof val !== "string" ||
        !val.trim() ||
        val.trim().length > max ||
        /[\u0000-\u001F\u007F]/.test(val)
      )
        throw new HomeServicesValidationError(`Usługa ${i + 1}: nieprawidłowe ${key}.`);
      return val.trim();
    };
    const getPos = (key: "imagePositionX" | "imagePositionY") => {
      const val = item[key] ?? DEFAULT_HOME_SERVICES.services[i][key];
      if (typeof val !== "number" || !Number.isInteger(val) || val < 0 || val > 100)
        throw new HomeServicesValidationError(`Usługa ${i + 1}: nieprawidłowe kadrowanie.`);
      return val;
    };
    const imageUrl = getText("imageUrl", 500);
    if (!safeServiceImage(imageUrl))
      throw new HomeServicesValidationError(`Usługa ${i + 1}: niedozwolony adres fotografii.`);
    return {
      title: getText("title", 95),
      description: getText("description", 300),
      imageUrl,
      imagePositionX: getPos("imagePositionX"),
      imagePositionY: getPos("imagePositionY"),
    };
  });
  const result: HomeServicesContent = {
    eyebrow: text("eyebrow", 75),
    headline: text("headline", 180, true),
    backgroundImageUrl: text("backgroundImageUrl", 500),
    buttonLabel: text("buttonLabel", 45),
    buttonHref: text("buttonHref", 90),
    headingScale: number("headingScale", 75, 130),
    cardTitleScale: number("cardTitleScale", 80, 130),
    cardDescriptionScale: number("cardDescriptionScale", 80, 130),
    cardImageHeightScale: number("cardImageHeightScale", 75, 130),
    cardGapScale: number("cardGapScale", 75, 135),
    backgroundOpacity: number("backgroundOpacity", 35, 100),
    services,
  };
  if (!safeServiceImage(result.backgroundImageUrl))
    throw new HomeServicesValidationError("Nieprawidłowy obraz tła.");
  if (!safeServicesHref(result.buttonHref))
    throw new HomeServicesValidationError("Odnośniki usług mogą prowadzić tylko do oferty.");
  return result;
}
