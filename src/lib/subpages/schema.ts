import { safeGalleryImage } from "@/lib/gallery/schema";
import { isPageSlug, type PageSlug, PAGE_LABELS } from "@/lib/pages/schema";
export const SUBPAGE_SECTIONS = ["hero", "albums", "about", "bottom"] as const;
export type SubpageSection = (typeof SUBPAGE_SECTIONS)[number];
export type SubpageBlock = {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  overlay: number;
  headingScale: number;
  ctaText: string;
};
export const isSubpageSection = (s: string): s is SubpageSection =>
  SUBPAGE_SECTIONS.includes(s as SubpageSection);
const galleryDefaults: Record<SubpageSection, SubpageBlock> = {
  hero: {
    eyebrow: "",
    title: "Galeria",
    description:
      "W naszej galerii przybliżamy miejsca, wyposażenie, pojazdy oraz florystyczną oprawę uroczystości. Zapraszamy do poznania szczegółów naszej pracy i elementów, które pomagają nam przygotowywać godne i spokojne pożegnania.",
    imageUrl: "/hero-galeria.png",
    overlay: 62,
    headingScale: 100,
    ctaText: "",
  },
  albums: {
    eyebrow: "NASZA GALERIA",
    title: "Zobacz, jak dbamy o każdy szczegół",
    description:
      "Zobacz naszą siedzibę, przestrzenie przygotowywane na uroczystości, pojazdy i wybrane kompozycje kwiatowe. Każdy album przybliża inny element naszej codziennej pracy i podejścia do ostatniego pożegnania.",
    imageUrl: "/galeria-home-tlo.png",
    overlay: 0,
    headingScale: 100,
    ctaText: "",
  },
  about: {
    eyebrow: "GALERIA NASZEJ PRACY",
    title: "Każdy szczegół ma znaczenie",
    description:
      "W galerii przedstawiamy miejsca, wyposażenie i kompozycje, które przybliżają charakter naszej pracy. W każdym elemencie przygotowań kierujemy się szacunkiem, starannością i troską o godny przebieg pożegnania.",
    imageUrl: "/galeria-home-tlo.png",
    overlay: 0,
    headingScale: 100,
    ctaText: "Indywidualne podejście|Troska o detale|Doświadczenie i zaangażowanie",
  },
  bottom: {
    eyebrow: "JESTEŚMY DO PAŃSTWA DYSPOZYCJI",
    title: "Porozmawiajmy o tym, jak możemy pomóc",
    description:
      "Rozumiemy, jak ważne w trudnych chwilach jest poczucie bezpieczeństwa i możliwość uzyskania spokojnej, rzetelnej informacji. Chętnie odpowiemy na pytania dotyczące naszych usług, organizacji uroczystości oraz dostępnych form wsparcia.",
    imageUrl: "/bottom-galeria.png",
    overlay: 70,
    headingScale: 100,
    ctaText: "Przejdź do kontaktu",
  },
};
/** Reuse the exact same hero and closing CTA component across subpages,
 * while allowing dedicated imagery and copy for each page. */
const documentsDefaults: Pick<Record<SubpageSection, SubpageBlock>, "hero" | "bottom"> = {
  hero: {
    eyebrow: "POMOC W FORMALNOŚCIACH",
    title: "Dokumenty",
    description:
      "Najważniejsze formularze i informacje związane z organizacją pogrzebu. W trudnych chwilach służymy spokojną i życzliwą pomocą przy formalnościach.",
    imageUrl: "/hero-dokumenty.png",
    overlay: 62,
    headingScale: 100,
    ctaText: "",
  },
  bottom: {
    eyebrow: "JESTEŚMY DO PAŃSTWA DYSPOZYCJI",
    title: "Pomożemy przejść przez formalności",
    description:
      "Jeśli pojawią się pytania dotyczące dokumentów lub organizacji uroczystości, mogą Państwo liczyć na nasze wsparcie i rzetelną informację.",
    imageUrl: "/bottom-dokumenty.png",
    overlay: 70,
    headingScale: 100,
    ctaText: "Przejdź do kontaktu",
  },
};

/** Dedicated Nekrologi imagery and copy; existing obituary CMS records are not changed. */
const obituariesDefaults: Pick<Record<SubpageSection, SubpageBlock>, "hero" | "bottom"> = {
  hero: {
    eyebrow: "",
    title: "Nekrologi",
    description:
      "Z szacunkiem przekazujemy informacje o osobach, które odeszły, oraz o terminach i miejscach uroczystości pożegnalnych.",
    imageUrl: "/hero-nekrologi.png",
    overlay: 62,
    headingScale: 100,
    ctaText: "",
  },
  bottom: {
    eyebrow: "JESTEŚMY DO PAŃSTWA DYSPOZYCJI",
    title: "Służymy pomocą w organizacji pożegnania",
    description:
      "W trudnych chwilach ważne jest wsparcie i możliwość uzyskania rzetelnych informacji. Jesteśmy do Państwa dyspozycji, aby odpowiedzieć na pytania dotyczące organizacji uroczystości i pomóc w niezbędnych formalnościach.",
    imageUrl: "/bottom-nekrologi.png",
    overlay: 70,
    headingScale: 100,
    ctaText: "Przejdź do kontaktu",
  },
};

/** Shared hero and phone-only closing section for Kontakt. */
const contactDefaults: Pick<Record<SubpageSection, SubpageBlock>, "hero" | "bottom"> = {
  hero: {
    eyebrow: "",
    title: "Kontakt",
    description:
      "Pozostajemy do Państwa dyspozycji w sprawach organizacji uroczystości pogrzebowych, formalności oraz naszych usług.",
    imageUrl: "/hero-kontakt.png",
    overlay: 62,
    headingScale: 100,
    ctaText: "",
  },
  bottom: {
    eyebrow: "POMOC CAŁODOBOWA",
    title: "Jesteśmy blisko, kiedy nas potrzebujesz",
    description: "W sprawach wymagających pilnej pomocy pozostajemy dostępni telefonicznie przez całą dobę.",
    imageUrl: "/bottom-kontakt.png",
    overlay: 70,
    headingScale: 100,
    ctaText: "",
  },
};

/** Migrate only exact v2.0.0 default copy, preserving all custom CMS text. */
export function migrateGalleryPresentation(
  slug: PageSlug,
  section: SubpageSection,
  block: SubpageBlock,
): SubpageBlock {
  if (slug !== "galeria") return block;
  const old: Partial<
    Record<
      SubpageSection,
      {
        description: string;
        title?: string;
        eyebrow?: string;
        ctaText?: string;
      }
    >
  > = {
    hero: {
      description: "Poznaj naszą firmę i miejsca, w których z troską przygotowujemy ostatnie pożegnania.",
      eyebrow: "STRONA GŁÓWNA / GALERIA",
    },
    albums: { description: "Poznaj naszą przestrzeń, wyposażenie, pojazdy i kompozycje kwiatowe." },
    bottom: {
      description: "Chętnie odpowiemy na Państwa pytania i przedstawimy szczegóły naszej oferty.",
      title: "Zapraszamy do kontaktu",
      eyebrow: "CHCESZ DOWIEDZIEĆ SIĘ WIĘCEJ?",
      ctaText: "Skontaktuj się",
    },
  };
  const legacy = old[section],
    current = galleryDefaults[section];
  if (!legacy) return block;
  return {
    ...block,
    description: block.description === legacy.description ? current.description : block.description,
    title: legacy.title && block.title === legacy.title ? current.title : block.title,
    eyebrow: legacy.eyebrow && block.eyebrow === legacy.eyebrow ? current.eyebrow : block.eyebrow,
    ctaText: legacy.ctaText && block.ctaText === legacy.ctaText ? current.ctaText : block.ctaText,
  };
}
export function subpageDefault(slug: PageSlug, section: SubpageSection): SubpageBlock {
  if (slug === "galeria") return galleryDefaults[section];
  if (slug === "kontakt" && (section === "hero" || section === "bottom")) return contactDefaults[section];
  if (slug === "nekrologi" && (section === "hero" || section === "bottom"))
    return obituariesDefaults[section];
  if (slug === "dokumenty" && (section === "hero" || section === "bottom")) return documentsDefaults[section];
  return {
    ...galleryDefaults[section],
    title: section === "hero" ? PAGE_LABELS[slug] : galleryDefaults[section].title,
    imageUrl: "",
    description:
      section === "hero"
        ? `Zapraszamy do zapoznania się z podstroną ${PAGE_LABELS[slug].toLowerCase()}.`
        : galleryDefaults[section].description,
  };
}
export class SubpageValidationError extends Error {}
export function parseSubpageBlock(value: unknown): SubpageBlock {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new SubpageValidationError("Nieprawidłowa sekcja.");
  const obj = value as Record<string, unknown>;
  const names = ["eyebrow", "title", "description", "imageUrl", "overlay", "headingScale", "ctaText"];
  if (Object.keys(obj).some((k) => !names.includes(k)))
    throw new SubpageValidationError("Nieznane pole sekcji.");
  for (const k of ["eyebrow", "title", "description", "imageUrl", "ctaText"]) {
    const v = obj[k];
    if (
      typeof v !== "string" ||
      v.length > (k === "description" ? 1300 : k === "imageUrl" ? 800 : 250) ||
      /[\u0000-\u001f\u007f]/.test(v)
    )
      throw new SubpageValidationError(`Nieprawidłowe pole: ${k}.`);
  }
  if (!(obj.title as string).trim()) throw new SubpageValidationError("Nagłówek jest wymagany.");
  if (obj.imageUrl && !safeGalleryImage(obj.imageUrl as string))
    throw new SubpageValidationError("Nieprawidłowy adres zdjęcia.");
  if (
    typeof obj.overlay !== "number" ||
    obj.overlay < 0 ||
    obj.overlay > 95 ||
    typeof obj.headingScale !== "number" ||
    obj.headingScale < 65 ||
    obj.headingScale > 150
  )
    throw new SubpageValidationError("Nieprawidłowe ustawienia wyglądu.");
  return Object.fromEntries(
    names.map((k) => [k, typeof obj[k] === "string" ? (obj[k] as string).trim() : obj[k]]),
  ) as SubpageBlock;
}
export function validSubpage(slug: string, section: string): slug is PageSlug {
  return isPageSlug(slug) && isSubpageSection(section);
}
