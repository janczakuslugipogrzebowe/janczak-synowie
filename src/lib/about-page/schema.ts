import { safeGalleryImage } from "@/lib/gallery/schema";

export const ABOUT_SECTIONS = ["history", "people", "values", "village"] as const;
export type AboutSection = (typeof ABOUT_SECTIONS)[number];

export type AboutBase = {
  eyebrow: string;
  title: string;
  lead: string;
  headingScale: number;
};
export type AboutPhoto = { imageUrl: string; imagePositionX: number; imagePositionY: number };
export type AboutMilestone = { year: string; title: string; description: string };
export type AboutPerson = { name: string; role: string; description: string };
export type AboutPrinciple = { title: string; description: string };
export type AboutHistory = AboutBase & AboutPhoto & { description: string; milestones: AboutMilestone[] };
export type AboutPeople = AboutBase &
  AboutPhoto & { description: string; photoCaption: string; people: AboutPerson[] };
export type AboutValues = AboutBase & { principles: AboutPrinciple[] };
export type AboutVillage = AboutBase & AboutPhoto & { description: string; buttonLabel: string };
export type AboutContent = {
  history: AboutHistory;
  people: AboutPeople;
  values: AboutValues;
  village: AboutVillage;
};

export const ABOUT_DEFAULTS: AboutContent = {
  history: {
    eyebrow: "NASZA HISTORIA",
    title: "Rodzinna firma. Osobiste zaangażowanie.",
    lead: "Z Żelazkowem związana jest nasza codzienna praca i odpowiedzialność za przygotowanie godnego pożegnania.",
    description:
      "Janczak i Synowie to rodzinna firma pogrzebowa, która od wielu lat wspiera rodziny w organizacji uroczystości pożegnalnych. Wiemy, jak ważne są w tym czasie spokój, zrozumienie i możliwość rozmowy z kimś, kto wyjaśni kolejne kroki.\n\nW naszej pracy łączymy doświadczenie z indywidualnym podejściem. Omawiamy z bliskimi przebieg ceremonii, pomagamy w formalnościach i dbamy o szczegóły ustalone z rodziną.",
    imageUrl: "/onas1.jpg",
    imagePositionX: 50,
    imagePositionY: 50,
    headingScale: 100,
    milestones: [],
  },
  people: {
    eyebrow: "LUDZIE",
    title: "Za naszą firmą stoją ludzie",
    lead: "Osobista rozmowa i wzajemne zaufanie mają dla nas szczególne znaczenie.",
    description:
      "W rodzinnej firmie ważne jest dla nas bezpośrednie zaangażowanie. Każda rodzina i każde pożegnanie mają swoją historię, dlatego poświęcamy czas na rozmowę, wyjaśnienie możliwości i spokojne ustalenie szczegółów.",
    imageUrl: "/onas2.jpg",
    imagePositionX: 50,
    imagePositionY: 45,
    headingScale: 100,
    photoCaption: "",
    people: [],
  },
  values: {
    eyebrow: "NASZE PODEJŚCIE",
    title: "To, co jest dla nas ważne",
    lead: "Sposób, w jaki pracujemy, ma znaczenie na każdym etapie przygotowań.",
    headingScale: 100,
    principles: [
      {
        title: "Indywidualne podejście",
        description: "Słuchamy potrzeb rodziny i wspólnie ustalamy charakter oraz przebieg uroczystości.",
      },
      {
        title: "Spokojna komunikacja",
        description:
          "Wyjaśniamy dostępne rozwiązania i pomagamy uporządkować kwestie organizacyjne oraz formalne.",
      },
      {
        title: "Szacunek i dbałość o szczegóły",
        description: "Z uwagą podchodzimy do ustaleń i elementów tworzących godną oprawę pożegnania.",
      },
    ],
  },
  village: {
    eyebrow: "NASZE KORZENIE",
    title: "Żelazków. Miejsce, z którym jesteśmy związani.",
    lead: "Tutaj znajduje się nasza siedziba i stąd na co dzień pomagamy rodzinom.",
    description:
      "Jesteśmy rodzinną firmą pogrzebową z Żelazkowa. Lokalna obecność pozwala nam pozostawać w bezpośrednim kontakcie z rodzinami i omawiać sprawy wymagające indywidualnej uwagi.\n\nZapraszamy do kontaktu telefonicznego lub odwiedzenia naszej siedziby. Szczegółowe dane i wskazówki dojazdu znajdują się na podstronie Kontakt.",
    imageUrl: "/onas3.jpg",
    imagePositionX: 50,
    imagePositionY: 50,
    headingScale: 100,
    buttonLabel: "Poznaj naszą siedzibę",
  },
};

export class AboutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AboutValidationError";
  }
}
export const isAboutSection = (s: string): s is AboutSection => ABOUT_SECTIONS.includes(s as AboutSection);

function record(raw: unknown, allowed: readonly string[], label: string) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new AboutValidationError(`Nieprawidłowe dane: ${label}.`);
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw new AboutValidationError(`Nieznane pole: ${label}.`);
  return value;
}
function line(raw: unknown, label: string, max = 150, required = true): string {
  if (
    typeof raw !== "string" ||
    raw.trim().length > max ||
    (required && !raw.trim()) ||
    /[\u0000-\u001f\u007f]/.test(raw)
  )
    throw new AboutValidationError(`Nieprawidłowa treść: ${label}.`);
  return raw.trim();
}
function paragraph(raw: unknown, label: string, max = 2400, required = true): string {
  if (
    typeof raw !== "string" ||
    raw.trim().length > max ||
    (required && !raw.trim()) ||
    /[\u0000-\u0009\u000B-\u001F\u007F]/.test(raw)
  )
    throw new AboutValidationError(`Nieprawidłowy opis: ${label}.`);
  return raw.replace(/\r\n/g, "\n").trim();
}
function integer(raw: unknown, label: string, min: number, max: number) {
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < min || raw > max)
    throw new AboutValidationError(`Pole ${label} musi mieścić się w zakresie ${min}–${max}.`);
  return raw;
}
function basic(v: Record<string, unknown>, defaults: AboutBase): AboutBase {
  return {
    eyebrow: line(v.eyebrow ?? defaults.eyebrow, "etykieta", 90, false),
    title: line(v.title, "nagłówek", 170),
    lead: paragraph(v.lead ?? defaults.lead, "wprowadzenie", 450, false),
    headingScale: integer(v.headingScale ?? defaults.headingScale, "wielkość nagłówka", 65, 150),
  };
}
function photo(v: Record<string, unknown>, defaults: AboutPhoto): AboutPhoto {
  const imageUrl = line(v.imageUrl ?? defaults.imageUrl, "zdjęcie", 800, false);
  if (imageUrl && !safeGalleryImage(imageUrl))
    throw new AboutValidationError(
      "Zdjęcie musi być lokalnym plikiem public/ lub dozwolonym adresem Vercel Blob.",
    );
  return {
    imageUrl,
    imagePositionX: integer(v.imagePositionX ?? defaults.imagePositionX, "pozycja pozioma zdjęcia", 0, 100),
    imagePositionY: integer(v.imagePositionY ?? defaults.imagePositionY, "pozycja pionowa zdjęcia", 0, 100),
  };
}
function entries<T>(
  raw: unknown,
  max: number,
  keys: readonly (keyof T & string)[],
  parse: (v: Record<string, unknown>, index: number) => T,
): T[] {
  if (!Array.isArray(raw) || raw.length > max)
    throw new AboutValidationError(`Lista może zawierać maksymalnie ${max} pozycji.`);
  return raw.map((entry, index) => parse(record(entry, keys, `pozycja ${index + 1}`), index));
}
export function parseAboutSection<S extends AboutSection>(section: S, raw: unknown): AboutContent[S] {
  const d = ABOUT_DEFAULTS[section];
  const allowed = [...Object.keys(d)];
  const v = record(raw, allowed, section);
  const common = basic(v, d);
  switch (section) {
    case "history": {
      const original = ABOUT_DEFAULTS.history;
      return {
        ...common,
        ...photo(v, original),
        description: paragraph(v.description, "historia", 3200),
        milestones: entries<AboutMilestone>(v.milestones ?? [], 8, ["year", "title", "description"], (e) => ({
          year: line(e.year, "rok lub okres", 35),
          title: line(e.title, "nazwa wydarzenia", 130),
          description: paragraph(e.description, "opis wydarzenia", 420),
        })),
      } as AboutContent[S];
    }
    case "people": {
      const original = ABOUT_DEFAULTS.people;
      return {
        ...common,
        ...photo(v, original),
        description: paragraph(v.description, "o zespole", 2400),
        photoCaption: line(v.photoCaption ?? "", "podpis fotografii", 200, false),
        people: entries<AboutPerson>(v.people ?? [], 6, ["name", "role", "description"], (e) => ({
          name: line(e.name, "imię i nazwisko", 100),
          role: line(e.role, "funkcja", 100, false),
          description: paragraph(e.description, "opis osoby", 600, false),
        })),
      } as AboutContent[S];
    }
    case "values": {
      const original = ABOUT_DEFAULTS.values;
      const principles = entries<AboutPrinciple>(
        v.principles ?? original.principles,
        6,
        ["title", "description"],
        (e) => ({
          title: line(e.title, "zasada", 130),
          description: paragraph(e.description, "opis zasady", 650),
        }),
      );
      if (!principles.length) throw new AboutValidationError("Dodaj przynajmniej jedną zasadę pracy.");
      return { ...common, principles } as AboutContent[S];
    }
    case "village": {
      const original = ABOUT_DEFAULTS.village;
      return {
        ...common,
        ...photo(v, original),
        description: paragraph(v.description, "o Żelazkowie", 2200),
        buttonLabel: line(v.buttonLabel ?? original.buttonLabel, "etykieta przycisku", 65),
      } as AboutContent[S];
    }
  }
  throw new AboutValidationError("Nieznana sekcja.");
}
