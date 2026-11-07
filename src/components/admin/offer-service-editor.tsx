"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TbArrowLeft, TbCheck, TbPhoto, TbPlus, TbTrash } from "react-icons/tb";
import { ServiceEntry } from "@/components/offer/offer-explorer";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import { notify } from "@/components/ui/toast-provider";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import { safeOfferImage } from "@/lib/offer/schema";
import {
  DEFAULT_SERVICE_CATALOG,
  parseServiceCatalog,
  uniqueOfferId,
  type ManagedOfferService,
  type ServiceCatalog,
} from "@/lib/offer/service-catalog";

type Tab = "basic" | "details" | "media" | "faq";
const TABS: { id: Tab; label: string }[] = [
  { id: "basic", label: "Podstawowe" },
  { id: "details", label: "Zakres i opis" },
  { id: "media", label: "Zdjęcie" },
  { id: "faq", label: "Pytania i odpowiedzi" },
];
const blank = (catalog: ServiceCatalog): ManagedOfferService => ({
  id: uniqueOfferId("nowa-usluga", [...catalog.items, ...catalog.categories]),
  categoryId: catalog.categories[0]?.id ?? "",
  title: "",
  lead: "",
  details: "",
  bullets: [],
  note: "",
  imageUrl: "",
  imagePositionX: 50,
  imagePositionY: 50,
  layout: "compact",
  cta: "contact",
  visible: false,
  faq: [],
});

export default function OfferServiceEditor({ serviceId }: { serviceId: string }) {
  const ed = useCmsEditor<ServiceCatalog>(
    "/api/admin/services",
    DEFAULT_SERVICE_CATALOG,
    parseServiceCatalog,
  );
  const original = serviceId === "new" ? undefined : ed.draft.items.find((s) => s.id === serviceId);
  return (
    <main id="main">
      <PageHeading
        eyebrow="Usługi / Edycja treści"
        title={serviceId === "new" ? "Nowa usługa" : "Edycja usługi"}
      >
        <Link href="/admin/services" className={subtleButton}>
          <TbArrowLeft /> Wróć do usług
        </Link>
      </PageHeading>
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (serviceId === "new" || original) && (
        <Form
          key={serviceId}
          initial={original ?? blank(ed.draft)}
          base={ed.draft}
          revision={ed.revision}
          isNew={serviceId === "new"}
        />
      )}
      {ed.phase === "ready" && serviceId !== "new" && !original && (
        <p className="mt-5 text-sm text-[#8f6745]">Nie znaleziono tej usługi.</p>
      )}
    </main>
  );
}

function Form({
  initial,
  base,
  revision,
  isNew,
}: {
  initial: ManagedOfferService;
  base: ServiceCatalog;
  revision: string | null;
  isNew: boolean;
}) {
  const router = useRouter();
  const [item, setItem] = useState(initial);
  const [tab, setTab] = useState<Tab>("basic");
  const [newPoint, setNewPoint] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const dirty = JSON.stringify(item) !== JSON.stringify(initial);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = <K extends keyof ManagedOfferService>(key: K, value: ManagedOfferService[K]) =>
    setItem((previous) => ({ ...previous, [key]: value }));
  const payload = () => {
    const next = isNew
      ? { ...item, id: uniqueOfferId(item.title, [...base.items, ...base.categories]) }
      : item;
    return {
      ...base,
      items: isNew ? [...base.items, next] : base.items.map((s) => (s.id === item.id ? next : s)),
    };
  };
  const save = async (publish: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const catalog = parseServiceCatalog(payload());
      const response = await fetch("/api/admin/services", {
        method: publish ? "POST" : "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(revision ? { "If-Match": revision } : {}) },
        body: JSON.stringify(catalog),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Nie udało się zapisać usługi.");
      notify.success(
        publish ? "Usługa opublikowana" : "Szkic zapisany",
        publish ? "Katalog jest aktualny." : "Zmiany nie są jeszcze widoczne publicznie.",
      );
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      notify.error("Nie udało się zapisać", error instanceof Error ? error.message : "Nieznany błąd.");
    } finally {
      setBusy(false);
    }
  };
  const imageSafe = Boolean(item.imageUrl && safeOfferImage(item.imageUrl));
  return (
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(350px,1fr)_minmax(310px,.83fr)]">
      <section className={`${surfaceClass} min-w-0 overflow-hidden`} aria-label="Edycja usługi">
        <div className="border-b border-[#e6dfd2] bg-[#faf7f0] p-5 sm:px-7">
          <p className="text-[.72rem] font-bold uppercase tracking-[.2em] text-[#a18356]">
            {isNew ? "Nowa pozycja" : "Usługa w katalogu"}
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,2.4vw,2.8rem)] leading-tight text-[#203c2b]">
            {item.title || "Wprowadź nazwę usługi"}
          </h2>
          <p className="mt-2 text-sm text-[#718071]">
            {base.categories.find((c) => c.id === item.categoryId)?.title}
          </p>
        </div>
        <div
          className="flex snap-x gap-1 overflow-x-auto border-b border-[#e6dfd2] px-4 py-3 [scrollbar-width:none] sm:px-6"
          role="tablist"
          aria-label="Obszary edycji usługi"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls="service-editor-content"
              type="button"
              onClick={() => setTab(id)}
              className={`min-h-10 shrink-0 snap-start rounded-lg px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#aa8b5b] ${tab === id ? "bg-[#1d3b29] text-white" : "text-[#586e5c] hover:bg-[#f1ede4]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div id="service-editor-content" role="tabpanel" className="min-h-[470px] space-y-6 p-5 sm:p-7">
          {tab === "basic" && (
            <>
              <Field label="Nazwa usługi">
                <input
                  className={fieldClass}
                  maxLength={140}
                  value={item.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </Field>
              <Field label="Kategoria">
                <select
                  className={fieldClass}
                  value={item.categoryId}
                  onChange={(e) => update("categoryId", e.target.value)}
                >
                  {base.categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Krótki opis" hint="Widoczny zawsze, nawet gdy usługa jest zwinięta.">
                <textarea
                  rows={4}
                  maxLength={500}
                  className={fieldClass}
                  value={item.lead}
                  onChange={(e) => update("lead", e.target.value)}
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#f3f0e8] p-4 text-sm font-semibold text-[#294331]">
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={(e) => update("visible", e.target.checked)}
                />{" "}
                Widoczna po publikacji
              </label>
              <Field label="Link w szczegółach">
                <select
                  className={fieldClass}
                  value={item.cta}
                  onChange={(e) => update("cta", e.target.value as ManagedOfferService["cta"])}
                >
                  <option value="contact">Formularz kontaktowy</option>
                  <option value="documents">Dokumenty</option>
                  <option value="none">Bez linku</option>
                </select>
              </Field>
              <p className="text-xs leading-relaxed text-[#708072]">
                Bezpośredni link do usługi: <code>/oferta#{item.id}</code>. Identyfikator pozostaje stały po
                zmianie tytułu.
              </p>
            </>
          )}
          {tab === "details" && (
            <>
              <Field label="Opis szczegółowy" hint="Podziel treść na akapity pustym wierszem. Bez HTML.">
                <textarea
                  className={fieldClass}
                  rows={9}
                  maxLength={5000}
                  value={item.details}
                  onChange={(e) => update("details", e.target.value)}
                />
              </Field>
              <h3 className="font-display text-2xl text-[#203b2a]">Zakres usługi</h3>
              {item.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={fieldClass}
                    aria-label={`Punkt ${i + 1}`}
                    maxLength={240}
                    value={bullet}
                    onChange={(e) =>
                      update(
                        "bullets",
                        item.bullets.map((b, index) => (i === index ? e.target.value : b)),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Usuń punkt ${i + 1}`}
                    className={subtleButton}
                    onClick={() =>
                      update(
                        "bullets",
                        item.bullets.filter((_, index) => index !== i),
                      )
                    }
                  >
                    <TbTrash />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className={fieldClass}
                  value={newPoint}
                  placeholder="Dodaj punkt…"
                  onChange={(e) => setNewPoint(e.target.value)}
                />
                <button
                  type="button"
                  className={subtleButton}
                  disabled={!newPoint.trim() || item.bullets.length >= 12}
                  onClick={() => {
                    update("bullets", [...item.bullets, newPoint.trim()]);
                    setNewPoint("");
                  }}
                >
                  <TbPlus /> Dodaj
                </button>
              </div>
              <Field label="Dodatkowa uwaga (opcjonalnie)">
                <textarea
                  rows={3}
                  maxLength={500}
                  className={fieldClass}
                  value={item.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </Field>
            </>
          )}
          {tab === "media" && (
            <>
              <Field
                label="Zdjęcie usługi"
                hint="Zdjęcie będzie widoczne w rozwiniętych szczegółach. Może również służyć jako zdjęcie kategorii, jeśli kategoria nie ma własnego."
              >
                <input
                  className={fieldClass}
                  placeholder="/uslugi1-home.png"
                  value={item.imageUrl}
                  onChange={(e) => update("imageUrl", e.target.value)}
                />
              </Field>
              {item.imageUrl && !imageSafe && (
                <p className="text-sm text-[#b14639]" role="alert">
                  Podaj poprawną ścieżkę do pliku w public/ lub zatwierdzony adres Vercel Blob.
                </p>
              )}
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#e4e9e0]">
                {imageSafe ? (
                  <Image
                    src={item.imageUrl}
                    alt="Podgląd zdjęcia usługi"
                    fill
                    sizes="650px"
                    className="object-cover"
                    style={{ objectPosition: `${item.imagePositionX}% ${item.imagePositionY}%` }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-[#6e826e]">
                    <TbPhoto /> Bez zdjęcia
                  </div>
                )}
              </div>
              <Field label={`Pozycja pozioma kadru: ${item.imagePositionX}%`}>
                <input
                  className="w-full accent-[#1f402b]"
                  type="range"
                  min={0}
                  max={100}
                  value={item.imagePositionX}
                  onChange={(e) => update("imagePositionX", Number(e.target.value))}
                />
              </Field>
              <Field label={`Pozycja pionowa kadru: ${item.imagePositionY}%`}>
                <input
                  className="w-full accent-[#1f402b]"
                  type="range"
                  min={0}
                  max={100}
                  value={item.imagePositionY}
                  onChange={(e) => update("imagePositionY", Number(e.target.value))}
                />
              </Field>
            </>
          )}
          {tab === "faq" && (
            <>
              <p className="text-sm leading-relaxed text-[#647665]">
                Opcjonalne pytania i odpowiedzi będą widoczne dopiero po rozwinięciu danej usługi.
              </p>
              {item.faq.map((entry, i) => (
                <div key={i} className="space-y-4 rounded-xl border border-[#e6ddd0] bg-[#faf8f3] p-4">
                  <Field label="Pytanie">
                    <input
                      className={fieldClass}
                      maxLength={220}
                      value={entry.question}
                      onChange={(e) =>
                        update(
                          "faq",
                          item.faq.map((f, index) => (i === index ? { ...f, question: e.target.value } : f)),
                        )
                      }
                    />
                  </Field>
                  <Field label="Odpowiedź">
                    <textarea
                      rows={4}
                      maxLength={1100}
                      className={fieldClass}
                      value={entry.answer}
                      onChange={(e) =>
                        update(
                          "faq",
                          item.faq.map((f, index) => (i === index ? { ...f, answer: e.target.value } : f)),
                        )
                      }
                    />
                  </Field>
                  <button
                    type="button"
                    className={subtleButton}
                    onClick={() =>
                      update(
                        "faq",
                        item.faq.filter((_, index) => index !== i),
                      )
                    }
                  >
                    <TbTrash /> Usuń pytanie
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={subtleButton}
                disabled={item.faq.length >= 8}
                onClick={() =>
                  update("faq", [
                    ...item.faq,
                    { question: "Nowe pytanie", answer: "Odpowiedź do uzupełnienia." },
                  ])
                }
              >
                <TbPlus /> Dodaj pytanie
              </button>
            </>
          )}
        </div>
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#ddd4c5] bg-[#fffdf9]/95 p-5 backdrop-blur-lg sm:px-7">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#687b6b]">
            {dirty ? (
              "Niezapisane zmiany"
            ) : (
              <>
                <TbCheck /> Bez lokalnych zmian
              </>
            )}
          </span>
          <div className="flex gap-2">
            <button type="button" className={subtleButton} disabled={busy} onClick={() => void save(false)}>
              Zapisz szkic
            </button>
            <button type="button" className={primaryButton} disabled={busy} onClick={() => void save(true)}>
              {busy ? "Zapisywanie…" : "Opublikuj"}
            </button>
          </div>
        </div>
      </section>
      <aside className="min-w-0 xl:sticky xl:top-5" aria-label="Podgląd na żywo">
        <div className={`${surfaceClass} overflow-hidden p-5 sm:p-6`}>
          <div className="mb-4">
            <p className="text-[.7rem] font-bold uppercase tracking-[.18em] text-[#a08255]">
              Podgląd na żywo
            </p>
            <h2 className="mt-2 font-display text-2xl text-[#1e3829]">Widok w katalogu</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#e7e0d4] bg-[#f7f3eb]">
            <ServiceEntry
              item={{
                ...item,
                title: item.title || "Nazwa usługi",
                lead: item.lead || "Krótki opis usługi",
                imageUrl: imageSafe ? item.imageUrl : "",
              }}
              open={open}
              onToggle={() => setOpen((value) => !value)}
              reduced
              preview
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6f7d70]">
            W podglądzie używamy tego samego komponentu, co na publicznej stronie. Zdjęcie jest opcjonalne.
          </p>
        </div>
      </aside>
    </div>
  );
}
