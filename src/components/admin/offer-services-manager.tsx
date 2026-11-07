"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TbArrowDown,
  TbArrowUp,
  TbCopy,
  TbEdit,
  TbExternalLink,
  TbEye,
  TbEyeOff,
  TbPhoto,
  TbPlus,
  TbSearch,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import { safeOfferImage } from "@/lib/offer/schema";
import { moveOfferService } from "@/lib/offer/order";
import {
  categoryCover,
  DEFAULT_SERVICE_CATALOG,
  parseServiceCatalog,
  uniqueOfferId,
  type OfferCategoryRecord,
  type ServiceCatalog,
} from "@/lib/offer/service-catalog";

function shiftCategory<T>(items: T[], index: number, direction: number) {
  const next = index + direction;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}
export default function OfferServicesManager() {
  const ed = useCmsEditor<ServiceCatalog>(
    "/api/admin/services",
    DEFAULT_SERVICE_CATALOG,
    parseServiceCatalog,
  );
  const [activeId, setActiveId] = useState<string>("all");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const categoryDialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!editingCategory) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = requestAnimationFrame(() =>
      categoryDialog.current?.querySelector<HTMLElement>("button, input, textarea")?.focus(),
    );
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setEditingCategory(null);
        return;
      }
      if (event.key !== "Tab" || !categoryDialog.current) return;
      const controls = [
        ...categoryDialog.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])",
        ),
      ];
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      }
      if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault();
        controls[0].focus();
      }
    };
    document.addEventListener("keydown", handleKeys);
    return () => {
      cancelAnimationFrame(focus);
      document.removeEventListener("keydown", handleKeys);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [editingCategory]);
  const [filter, setFilter] = useState("");
  const [visibility, setVisibility] = useState<"all" | "shown" | "hidden">("all");
  const [removeService, setRemoveService] = useState<string | null>(null);
  const [removeCategory, setRemoveCategory] = useState<string | null>(null);
  const categories = ed.draft.categories;
  const items = ed.draft.items;
  const currentCategory = categories.find((c) => c.id === activeId);
  const categoryToEdit = categories.find((c) => c.id === editingCategory);
  const shown = useMemo(
    () =>
      items.filter(
        (s) =>
          (activeId === "all" || s.categoryId === activeId) &&
          (visibility === "all" || (visibility === "shown" ? s.visible : !s.visible)) &&
          `${s.title} ${s.lead}`.toLocaleLowerCase("pl").includes(filter.trim().toLocaleLowerCase("pl")),
      ),
    [items, activeId, visibility, filter],
  );

  const setCategoryField = (id: string, field: keyof OfferCategoryRecord, value: string | boolean) =>
    ed.update(
      "categories",
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  const addCategory = () => {
    if (categories.length >= 12) return;
    const id = uniqueOfferId("nowa-kategoria", [...categories, ...items]);
    ed.update("categories", [
      ...categories,
      { id, title: "Nowa kategoria", description: "", imageUrl: "", visible: false },
    ]);
    setActiveId(id);
    setEditingCategory(id);
  };
  const updateServiceVisibility = (id: string) =>
    ed.update(
      "items",
      items.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    );
  const duplicateService = (id: string) => {
    if (items.length >= 60) return;
    const index = items.findIndex((s) => s.id === id);
    if (index < 0) return;
    const source = items[index];
    const copyId = uniqueOfferId(`${source.id}-kopia`, [...items, ...categories]);
    ed.update("items", [
      ...items.slice(0, index + 1),
      {
        ...source,
        id: copyId,
        title: `${source.title} — kopia`,
        visible: false,
        bullets: [...source.bullets],
        faq: source.faq.map((f) => ({ ...f })),
      },
      ...items.slice(index + 1),
    ]);
  };

  return (
    <main id="main" className="space-y-6 pb-20">
      <PageHeading eyebrow="Zarządzanie ofertą" title="Usługi i kategorie">
        <Link href="/admin/site/oferta/catalog" className={subtleButton}>
          <TbExternalLink /> Edytuj teksty strony
        </Link>
        <Link href="/admin/services/new" className={primaryButton}>
          <TbPlus /> Dodaj usługę
        </Link>
      </PageHeading>
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(290px,340px)_minmax(0,1fr)]">
            <aside
              className={`${surfaceClass} overflow-hidden p-4 sm:p-5 xl:sticky xl:top-5`}
              aria-label="Kategorie usług"
            >
              <div className="mb-5 flex items-center justify-between gap-3 px-2">
                <div>
                  <h2 className="font-display text-[30px] leading-tight text-[#1e3829]">Kategorie</h2>
                  <p className="mt-1 text-xs text-[#758277]">{categories.length} w katalogu</p>
                </div>
                <button
                  className={subtleButton}
                  aria-label="Dodaj kategorię"
                  title="Dodaj kategorię"
                  type="button"
                  disabled={categories.length >= 12}
                  onClick={addCategory}
                >
                  <TbPlus size={19} />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId("all");
                    setFilter("");
                  }}
                  aria-pressed={activeId === "all"}
                  className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${activeId === "all" ? "bg-[#19392a] text-white" : "bg-[#f5f1e9] text-[#304c39] hover:bg-[#ebe4d8]"}`}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    Wszystkie usługi <span className="tabular-nums opacity-70">{items.length}</span>
                  </span>
                </button>
                {categories.map((category, index) => {
                  const count = items.filter((s) => s.categoryId === category.id).length;
                  const selected = activeId === category.id;
                  return (
                    <div
                      key={category.id}
                      className={`rounded-xl border transition-colors ${selected ? "border-[#b99e78] bg-[#f9f5ed]" : "border-transparent hover:bg-[#f8f5ee]"}`}
                    >
                      <div className="flex items-center gap-1 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveId(category.id);
                            setFilter("");
                          }}
                          className="min-w-0 flex-1 rounded-lg px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-[#ab885c]"
                          aria-pressed={selected}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-[#20392b]">
                            <span className="shrink-0 text-xs tabular-nums text-[#ad8a57]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="truncate">{category.title}</span>
                          </span>
                          <span className="mt-1.5 flex items-center gap-2 pl-6 text-xs text-[#778577]">
                            {count} {count === 1 ? "usługa" : count < 5 ? "usługi" : "usług"}
                            <span
                              className={`size-1.5 rounded-full ${category.visible ? "bg-[#4a8a65]" : "bg-[#bca98e]"}`}
                            />
                            {category.visible ? "Widoczna" : "Ukryta"}
                          </span>
                        </button>
                        <button
                          type="button"
                          title={`Edytuj kategorię ${category.title}`}
                          aria-label={`Edytuj kategorię ${category.title}`}
                          onClick={() => {
                            setActiveId(category.id);
                            setEditingCategory(category.id);
                          }}
                          className="grid size-9 shrink-0 place-items-center rounded-lg text-[#7f7b6b] transition-colors hover:bg-[#ede4d6] hover:text-[#1d3b29]"
                        >
                          <TbEdit size={17} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 border-t border-[#eee7da] pt-4 text-xs leading-[1.7] text-[#758174]">
                Wybierz kategorię, aby zobaczyć jej usługi. Nazwy, zdjęcia i kolejność kategorii zmienisz
                przez przycisk edycji.
              </div>
            </aside>

            <section className={`${surfaceClass} min-w-0 p-5 sm:p-7`} aria-label="Lista usług">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[.68rem] font-bold uppercase tracking-[.2em] text-[#a18157]">
                    {activeId === "all" ? "Pełny katalog" : "Wybrana kategoria"}
                  </p>
                  <h2 className="font-display text-[clamp(1.8rem,2.3vw,2.7rem)] leading-[1.1] text-[#1d3728]">
                    {currentCategory?.title ?? "Wszystkie usługi"}
                  </h2>
                  <p className="mt-2 text-sm text-[#718173]">{shown.length} pozycji w aktualnym widoku</p>
                </div>
                {currentCategory && (
                  <button
                    type="button"
                    className={subtleButton}
                    onClick={() => setEditingCategory(currentCategory.id)}
                  >
                    <TbEdit /> Ustawienia kategorii
                  </button>
                )}
              </div>
              {currentCategory && (
                <div className="mb-6 flex items-center gap-4 overflow-hidden rounded-xl border border-[#e7e0d5] bg-[#faf8f3] p-3">
                  {safeOfferImage(categoryCover(currentCategory, items).src) ? (
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#dfe6db]">
                      <Image
                        src={categoryCover(currentCategory, items).src}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-[#e5ebe2]">
                      <TbPhoto size={26} className="text-[#829481]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm text-[#4d6252]">
                      {currentCategory.description || "Opis kategorii nie został jeszcze uzupełniony."}
                    </p>
                    <p className="mt-2 text-xs text-[#977b52]">
                      {currentCategory.visible ? "Widoczna na stronie" : "Kategoria ukryta"}
                    </p>
                  </div>
                </div>
              )}
              <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <TbSearch
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9b8e]"
                  />
                  <span className="sr-only">Szukaj usług</span>
                  <input
                    className={`${fieldClass} pl-10`}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Wyszukaj po nazwie lub opisie…"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-[#667569]">
                  Status{" "}
                  <select
                    className={fieldClass}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                  >
                    <option value="all">Wszystkie</option>
                    <option value="shown">Widoczne</option>
                    <option value="hidden">Ukryte</option>
                  </select>
                </label>
              </div>
              <div className="space-y-2">
                {shown.map((s) => {
                  const inGroup = items.filter((x) => x.categoryId === s.categoryId);
                  const pos = inGroup.findIndex((x) => x.id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e9e3d8] bg-[#fffdf9] p-3.5 transition-colors hover:border-[#cfb998] sm:p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          className="block text-sm font-bold text-[#203b2b] hover:text-[#957247]"
                          href={`/admin/services/${s.id}/edit`}
                        >
                          {s.title}
                        </Link>
                        <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-[#7a857b]">{s.lead}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-[.7rem] text-[#8f846f]">
                          {activeId === "all" && (
                            <span>{categories.find((c) => c.id === s.categoryId)?.title}</span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 ${s.visible ? "bg-[#e6f0e6] text-[#3d6a49]" : "bg-[#f2ede5] text-[#927b59]"}`}
                          >
                            {s.visible ? "Widoczna" : "Ukryta"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pos === 0 || activeId === "all" || filter !== "" || visibility !== "all"}
                          title="Przesuń wyżej w kategorii"
                          aria-label={`Przenieś ${s.title} wyżej`}
                          className="rounded-lg p-2 text-[#718274] hover:bg-[#ede7dc] disabled:opacity-30"
                          onClick={() => ed.update("items", moveOfferService(items, s.id, -1))}
                        >
                          <TbArrowUp size={17} />
                        </button>
                        <button
                          type="button"
                          disabled={
                            pos === inGroup.length - 1 ||
                            activeId === "all" ||
                            filter !== "" ||
                            visibility !== "all"
                          }
                          title="Przesuń niżej w kategorii"
                          aria-label={`Przenieś ${s.title} niżej`}
                          className="rounded-lg p-2 text-[#718274] hover:bg-[#ede7dc] disabled:opacity-30"
                          onClick={() => ed.update("items", moveOfferService(items, s.id, 1))}
                        >
                          <TbArrowDown size={17} />
                        </button>
                        <button
                          type="button"
                          title={s.visible ? "Ukryj" : "Pokaż"}
                          aria-label={s.visible ? `Ukryj ${s.title}` : `Pokaż ${s.title}`}
                          className="rounded-lg p-2 text-[#718274] hover:bg-[#ede7dc]"
                          onClick={() => updateServiceVisibility(s.id)}
                        >
                          {s.visible ? <TbEye size={18} /> : <TbEyeOff size={18} />}
                        </button>
                        <button
                          type="button"
                          title="Duplikuj usługę"
                          aria-label={`Duplikuj usługę ${s.title}`}
                          disabled={items.length >= 60}
                          className="rounded-lg p-2 text-[#718274] hover:bg-[#ede7dc]"
                          onClick={() => duplicateService(s.id)}
                        >
                          <TbCopy size={18} />
                        </button>
                        <button
                          type="button"
                          title="Usuń usługę"
                          aria-label={`Usuń usługę ${s.title}`}
                          className="rounded-lg p-2 text-[#af6255] hover:bg-red-50"
                          onClick={() => setRemoveService(s.id)}
                        >
                          <TbTrash size={18} />
                        </button>
                        <Link
                          href={`/admin/services/${s.id}/edit`}
                          title={`Edytuj ${s.title}`}
                          aria-label={`Edytuj ${s.title}`}
                          className="rounded-lg bg-[#edf2e9] p-2 text-[#21402b] hover:bg-[#dce8da]"
                        >
                          <TbEdit size={18} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {shown.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[#ded4c4] px-5 py-10 text-center text-sm text-[#647363]">
                    Nie znaleziono usług dla wybranych filtrów.
                  </p>
                )}
              </div>
              {activeId === "all" && (
                <p className="mt-4 text-xs text-[#7c8779]">
                  Aby zmienić kolejność usług, wybierz konkretną kategorię po lewej stronie.
                </p>
              )}
            </section>
          </div>

          <div
            className={`${surfaceClass} sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 border border-[#d8cbb6] p-4 shadow-[0_16px_45px_-22px_rgba(26,45,29,.32)] sm:px-6`}
          >
            <div>
              <p className="text-sm font-semibold text-[#234030]">
                {ed.unsaved
                  ? "Niezapisane zmiany"
                  : ed.unpublished
                    ? "Szkic oczekuje na publikację"
                    : "Katalog jest aktualny"}
              </p>
              <p className="text-xs text-[#6a7b6a]">Publikacja aktualizuje cały katalog jednocześnie.</p>
            </div>
            <div className="flex gap-2">
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
                {ed.busy ? "Zapisywanie…" : "Opublikuj katalog"}
              </button>
            </div>
          </div>

          {categoryToEdit && (
            <div
              role="presentation"
              className="fixed inset-0 z-[80] flex justify-end bg-[#0b1d13]/50 backdrop-blur-[2px]"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setEditingCategory(null);
              }}
            >
              <section
                ref={categoryDialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-edit-heading"
                className="h-full w-full max-w-[530px] overflow-y-auto bg-[#fffcf7] p-6 shadow-2xl sm:p-8"
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a38559]">
                      Kategoria usług
                    </p>
                    <h2 id="category-edit-heading" className="mt-2 font-display text-4xl text-[#1e3c2b]">
                      Ustawienia kategorii
                    </h2>
                  </div>
                  <button
                    type="button"
                    className={subtleButton}
                    onClick={() => setEditingCategory(null)}
                    aria-label="Zamknij edycję kategorii"
                  >
                    <TbX />
                  </button>
                </div>
                <div className="space-y-5">
                  <Field label="Nazwa kategorii">
                    <input
                      className={fieldClass}
                      value={categoryToEdit.title}
                      maxLength={100}
                      onChange={(e) => setCategoryField(categoryToEdit.id, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Opis kategorii">
                    <textarea
                      rows={4}
                      className={fieldClass}
                      maxLength={700}
                      value={categoryToEdit.description}
                      onChange={(e) => setCategoryField(categoryToEdit.id, "description", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Zdjęcie główne kategorii"
                    hint="Wpisz ścieżkę pliku z public/, np. /uslugi1-home.png. Bez zdjęcia użyjemy fotografii pierwszej widocznej usługi."
                  >
                    <input
                      className={fieldClass}
                      value={categoryToEdit.imageUrl}
                      onChange={(e) => setCategoryField(categoryToEdit.id, "imageUrl", e.target.value)}
                    />
                  </Field>
                  <div className="relative h-48 overflow-hidden rounded-xl bg-[#dfebe0]">
                    {safeOfferImage(categoryCover(categoryToEdit, items).src) ? (
                      <Image
                        src={categoryCover(categoryToEdit, items).src}
                        alt={`Podgląd kategorii ${categoryToEdit.title}`}
                        fill
                        sizes="530px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center gap-2 text-sm text-[#687e70]">
                        <TbPhoto /> Bez zdjęcia
                      </div>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#f2eee5] px-4 py-3 text-sm text-[#254430]">
                    <input
                      type="checkbox"
                      checked={categoryToEdit.visible}
                      onChange={(e) => setCategoryField(categoryToEdit.id, "visible", e.target.checked)}
                    />{" "}
                    Kategoria widoczna na stronie
                  </label>
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#e9dfd2] pt-6">
                    <button
                      type="button"
                      className={subtleButton}
                      disabled={categories.findIndex((c) => c.id === categoryToEdit.id) === 0}
                      onClick={() =>
                        ed.update(
                          "categories",
                          shiftCategory(
                            categories,
                            categories.findIndex((c) => c.id === categoryToEdit.id),
                            -1,
                          ),
                        )
                      }
                    >
                      <TbArrowUp /> Wyżej
                    </button>
                    <button
                      type="button"
                      className={subtleButton}
                      disabled={
                        categories.findIndex((c) => c.id === categoryToEdit.id) === categories.length - 1
                      }
                      onClick={() =>
                        ed.update(
                          "categories",
                          shiftCategory(
                            categories,
                            categories.findIndex((c) => c.id === categoryToEdit.id),
                            1,
                          ),
                        )
                      }
                    >
                      <TbArrowDown /> Niżej
                    </button>
                    <button
                      type="button"
                      className={`${subtleButton} text-[#a14c40]`}
                      disabled={
                        items.some((s) => s.categoryId === categoryToEdit.id) || categories.length <= 1
                      }
                      onClick={() => setRemoveCategory(categoryToEdit.id)}
                    >
                      <TbTrash /> Usuń
                    </button>
                  </div>
                  <button type="button" className={primaryButton} onClick={() => setEditingCategory(null)}>
                    Zakończ edycję
                  </button>
                </div>
              </section>
            </div>
          )}
          <ConfirmDialog
            open={removeService !== null}
            title="Usunąć usługę?"
            description="Usługa zniknie z Oferty dopiero po opublikowaniu katalogu. Pozostałe usługi nie zostaną zmienione."
            confirmLabel="Usuń usługę"
            destructive
            onCancel={() => setRemoveService(null)}
            onConfirm={() => {
              ed.update(
                "items",
                items.filter((s) => s.id !== removeService),
              );
              setRemoveService(null);
            }}
          />
          <ConfirmDialog
            open={removeCategory !== null}
            title="Usunąć kategorię?"
            description="Można usunąć tylko kategorię bez przypisanych usług."
            confirmLabel="Usuń kategorię"
            destructive
            onCancel={() => setRemoveCategory(null)}
            onConfirm={() => {
              if (
                removeCategory &&
                categories.length > 1 &&
                !items.some((s) => s.categoryId === removeCategory)
              ) {
                ed.update(
                  "categories",
                  categories.filter((c) => c.id !== removeCategory),
                );
                setActiveId("all");
                setEditingCategory(null);
              }
              setRemoveCategory(null);
            }}
          />
        </>
      )}
    </main>
  );
}
