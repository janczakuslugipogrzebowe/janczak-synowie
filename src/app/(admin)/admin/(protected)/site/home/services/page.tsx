"use client";
import { DEFAULT_SERVICE_CATALOG, parseServiceCatalog, type ManagedOfferService } from "@/lib/offer/service-catalog";
import { AdminSlider } from "@/components/ui/admin-slider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink } from "react-icons/tb";
import ServicesLivePreview from "@/components/admin/services-live-preview";
import EditorState from "@/components/admin/editor-state";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import {
  DEFAULT_HOME_SERVICES,
  parseHomeServices,
  type HomeService,
  type HomeServicesContent,
} from "@/lib/home-services/schema";

const typography = [
  { key: "headingScale", label: "Wielkość nagłówka", min: 75, max: 130 },
  { key: "cardTitleScale", label: "Nagłówki kart", min: 80, max: 130 },
  { key: "cardDescriptionScale", label: "Opisy kart", min: 80, max: 130 },
  { key: "cardImageHeightScale", label: "Wysokość fotografii", min: 75, max: 130 },
  { key: "cardGapScale", label: "Odległość między kartami", min: 75, max: 135 },
] as const;

export default function ServicesEditor() {
  const ed = useCmsEditor<HomeServicesContent>(
    "/api/admin/home/services",
    DEFAULT_HOME_SERVICES,
    parseHomeServices,
  );
  const [phone, setPhone] = useState(false);
  const [offerChoices, setOfferChoices] = useState<ManagedOfferService[]>(DEFAULT_SERVICE_CATALOG.items);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/services", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(payload => {
        if (controller.signal.aborted || !payload) return;
        const content = parseServiceCatalog(payload.draft ?? payload.published ?? DEFAULT_SERVICE_CATALOG);
        setOfferChoices(content.items.filter(item => item.visible && content.categories.some(cat => cat.id === item.categoryId && cat.visible)));
      }).catch(() => {});
    return () => controller.abort();
  }, []);

  const updateService = (index: number, key: keyof HomeService, value: string | number) => {
    ed.update(
      "services",
      ed.draft.services.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Usługi" />
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji usług" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
            <h2 className="font-display text-3xl font-semibold">Treści</h2>
            <Field label="Etykieta">
              <input
                className={fieldClass}
                value={ed.draft.eyebrow}
                onChange={(e) => ed.update("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Nagłówek">
              <textarea
                rows={3}
                className={`${fieldClass} resize-y`}
                value={ed.draft.headline}
                onChange={(e) => ed.update("headline", e.target.value)}
              />
            </Field>
            <Field label="Tekst odnośników">
              <input
                className={fieldClass}
                value={ed.draft.buttonLabel}
                onChange={(e) => ed.update("buttonLabel", e.target.value)}
              />
            </Field>
            <Field label="Adres oferty">
              <input
                className={fieldClass}
                value={ed.draft.buttonHref}
                onChange={(e) => ed.update("buttonHref", e.target.value)}
              />
            </Field>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Karty usług</h2>
              {ed.draft.services.map((card, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-[#eae7df] bg-[#fbfaf7] p-4 3xl:p-5"
                >
                  <span className="text-xs font-bold tabular-nums tracking-[.17em] text-[#98774c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Field label="Tytuł">
                    <input
                      className={fieldClass}
                      value={card.title}
                      onChange={(e) => updateService(index, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Opis">
                    <textarea
                      rows={4}
                      className={`${fieldClass} resize-y`}
                      value={card.description}
                      onChange={(e) => updateService(index, "description", e.target.value)}
                    />
                  </Field>
                  <Field label="Link do usługi na podstronie Oferta">
                    <select className={fieldClass} value={card.offerTarget ?? "/oferta"}
                      onChange={(e) => updateService(index, "offerTarget", e.target.value)}>
                      <option value="/oferta">Ogólna strona Oferty</option>
                      {card.offerTarget && !["/oferta", "/oferta#kwiaciarnia"].includes(card.offerTarget) && !offerChoices.some(s=>`/oferta#${s.id}`===card.offerTarget) && <option value={card.offerTarget}>Nieaktualne powiązanie — wybierz inne</option>}
                      {offerChoices.map(service => <option key={service.id} value={`/oferta#${service.id}`}>{service.title}</option>)}
                      <option value="/oferta#kwiaciarnia">Własna kwiaciarnia</option>
                    </select>
                  </Field>
                  <Field label="Ścieżka zdjęcia">
                    <input
                      className={fieldClass}
                      value={card.imageUrl}
                      onChange={(e) => updateService(index, "imageUrl", e.target.value)}
                    />
                  </Field>
                  {(["imagePositionX", "imagePositionY"] as const).map((key) => (
                    <AdminSlider
                      key={key}
                      label={key === "imagePositionX" ? "Kadrowanie poziome" : "Kadrowanie pionowe"}
                      value={card[key]}
                      min={0}
                      max={100}
                      onChange={(v) => updateService(index, key, v)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Tło</h2>
              <Field label="Ścieżka fotografii">
                <input
                  className={fieldClass}
                  value={ed.draft.backgroundImageUrl}
                  onChange={(e) => ed.update("backgroundImageUrl", e.target.value)}
                />
              </Field>
              <AdminSlider
                label="Widoczność tła"
                value={ed.draft.backgroundOpacity}
                min={35}
                max={100}
                onChange={(v) => ed.update("backgroundOpacity", v)}
              />
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {typography.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={min}
                  max={max}
                  onChange={(v) => ed.update(key, v)}
                />
              ))}
              <button
                type="button"
                className={subtleButton}
                onClick={() => typography.forEach(({ key }) => ed.update(key, DEFAULT_HOME_SERVICES[key]))}
              >
                Przywróć proporcje
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5">
              <button
                type="button"
                className={subtleButton}
                disabled={ed.busy || !ed.unsaved}
                onClick={() => void ed.save(false)}
              >
                Zapisz szkic
              </button>
              <button
                type="button"
                className={primaryButton}
                disabled={ed.busy || (!ed.unsaved && !ed.unpublished)}
                onClick={() => void ed.save(true)}
              >
                {ed.busy ? "Zapisywanie…" : "Opublikuj"}
              </button>
            </div>
          </section>
          <section
            aria-label="Podgląd usług"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((x) => !x)}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}>
                  <TbExternalLink />
                  Strona
                </Link>
              </div>
            </div>
            <ServicesLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
