export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
};

export type HomeFaqContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  overlayOpacity: number;
  headingScale: number;
  descriptionScale: number;
  questionScale: number;
  answerScale: number;
  iconScale: number;
  spacingScale: number;
  columnGapScale: number;
  items: FaqItem[];
};

export const DEFAULT_HOME_FAQ: HomeFaqContent = {
  eyebrow: "NAJCZĘŚCIEJ ZADAWANE PYTANIA",
  headline: "Odpowiedzi na ważne pytania",
  description:
    "Zebraliśmy odpowiedzi na najczęstsze pytania, aby ułatwić Państwu znalezienie potrzebnych informacji. Jeśli nie znajdą Państwo odpowiedzi, jesteśmy do dyspozycji.",
  buttonLabel: "Skontaktuj się z nami",
  buttonHref: "/kontakt",
  imageUrl: "/qa-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  overlayOpacity: 42,
  headingScale: 100,
  descriptionScale: 100,
  questionScale: 100,
  answerScale: 100,
  iconScale: 100,
  spacingScale: 100,
  columnGapScale: 100,
  items: [
    {
      id: "faq-documents",
      question: "Jakie dokumenty są potrzebne do organizacji pogrzebu?",
      answer:
        "Lista potrzebnych dokumentów zależy od konkretnej sytuacji. Podczas rozmowy wyjaśnimy Państwu, co należy przygotować, i pomożemy w dopełnieniu formalności. Przydatne formularze znajdują się również w zakładce Dokumenty.",
      visible: true,
    },
    {
      id: "faq-benefit",
      question: "Czy pomagacie w formalnościach związanych z zasiłkiem pogrzebowym?",
      answer:
        "Tak. Na życzenie pomagamy w załatwieniu formalności związanych z zasiłkiem pogrzebowym, w tym dokumentów do ZUS i KRUS. Oferujemy również możliwość bezgotówkowego rozliczenia pogrzebu.",
      visible: true,
    },
    {
      id: "faq-transport",
      question: "Czy organizujecie transport zmarłych z zagranicy?",
      answer:
        "Tak, zapewniamy transport zmarłych zarówno na terenie Polski, jak i z zagranicy. Pomagamy również w organizacji związanych z tym formalności.",
      visible: true,
    },
    {
      id: "faq-cremation",
      question: "Czy można wybrać kremację zamiast tradycyjnego pochówku?",
      answer:
        "Tak. Organizujemy uroczystości pogrzebowe zarówno z pochówkiem tradycyjnym, jak i kremacją. Pomagamy rodzinie ustalić przebieg ceremonii zgodnie z jej życzeniami.",
      visible: true,
    },
    {
      id: "faq-florist",
      question: "Czy można zamówić wieńce i wiązanki na ceremonię?",
      answer:
        "Oczywiście. Prowadzimy własną kwiaciarnię Zielona Przystań, w której przygotowujemy wieńce, wiązanki oraz indywidualne kompozycje florystyczne. Dzięki temu wiele spraw związanych z pożegnaniem można załatwić w jednym miejscu.",
      visible: true,
    },
    {
      id: "faq-contact",
      question: "Czy można kontaktować się z Wami przez całą dobę?",
      answer:
        "Tak. Jesteśmy dostępni całodobowo pod numerem 605 043 008. Mogą Państwo skontaktować się z nami, aby uzyskać pomoc i informacje dotyczące kolejnych kroków.",
      visible: true,
    },
  ],
};

export class HomeFaqValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeFaqValidationError";
  }
}

function text(value: unknown, field: string, max: number) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    /[\u0000-\u0009\u000b-\u001f\u007f]/.test(value)
  )
    throw new HomeFaqValidationError(`Nieprawidłowe pole: ${field}.`);
  return value.trim();
}

export function parseHomeFaq(raw: unknown): HomeFaqContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new HomeFaqValidationError("Nieprawidłowa zawartość FAQ.");
  const r = raw as Record<string, unknown>;
  if (Object.keys(r).some((key) => !(key in DEFAULT_HOME_FAQ)))
    throw new HomeFaqValidationError("Nieznane pole FAQ.");
  const num = (key: keyof HomeFaqContent, min: number, max: number) => {
    const val = r[key] ?? DEFAULT_HOME_FAQ[key];
    if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max)
      throw new HomeFaqValidationError(`Nieprawidłowy parametr: ${key}.`);
    return val;
  };
  const imageUrl = text(r.imageUrl, "imageUrl", 500);
  if (
    !/^\/[a-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i.test(imageUrl) ||
    imageUrl.includes("..") ||
    imageUrl.includes("//")
  )
    throw new HomeFaqValidationError("Zdjęcie musi być plikiem z katalogu public.");
  const buttonHref = text(r.buttonHref, "buttonHref", 200);
  if (!/^\/(?!\/)[a-z0-9/_#-]*$/i.test(buttonHref) || buttonHref.includes(".."))
    throw new HomeFaqValidationError("Przycisk może prowadzić tylko do podstrony tego serwisu.");
  if (!Array.isArray(r.items) || r.items.length > 40)
    throw new HomeFaqValidationError("Lista FAQ musi zawierać maksymalnie 40 pytań.");
  const ids = new Set<string>();
  const items = r.items.map((rawItem: unknown) => {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      throw new HomeFaqValidationError("Nieprawidłowe pytanie FAQ.");
    const item = rawItem as Record<string, unknown>;
    if (Object.keys(item).some((key) => !["id", "question", "answer", "visible"].includes(key)))
      throw new HomeFaqValidationError("Nieznane pole pytania FAQ.");
    if (typeof item.id !== "string" || !/^[a-z0-9_-]{5,80}$/i.test(item.id) || ids.has(item.id))
      throw new HomeFaqValidationError("Nieprawidłowy lub powtórzony identyfikator pytania.");
    if (typeof item.visible !== "boolean")
      throw new HomeFaqValidationError("Nieprawidłowa widoczność pytania.");
    ids.add(item.id);
    return {
      id: item.id,
      question: text(item.question, "question", 200),
      answer: text(item.answer, "answer", 1500),
      visible: item.visible,
    };
  });
  return {
    eyebrow: text(r.eyebrow, "eyebrow", 90),
    headline: text(r.headline, "headline", 140),
    description: text(r.description, "description", 750),
    buttonLabel: text(r.buttonLabel, "buttonLabel", 80),
    buttonHref,
    imageUrl,
    imagePositionX: num("imagePositionX", 0, 100),
    imagePositionY: num("imagePositionY", 0, 100),
    overlayOpacity: num("overlayOpacity", 0, 85),
    headingScale: num("headingScale", 75, 140),
    descriptionScale: num("descriptionScale", 75, 140),
    questionScale: num("questionScale", 75, 140),
    answerScale: num("answerScale", 75, 140),
    iconScale: num("iconScale", 75, 140),
    spacingScale: num("spacingScale", 65, 150),
    columnGapScale: num("columnGapScale", 65, 150),
    items,
  };
}
