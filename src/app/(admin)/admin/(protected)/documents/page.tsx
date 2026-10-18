"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  TbArrowDown,
  TbArrowUp,
  TbExternalLink,
  TbFilePlus,
  TbFileText,
  TbTrash,
  TbX,
  TbCheck,
  TbAlertCircle,
} from "react-icons/tb";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import {
  DEFAULT_DOCUMENTS,
  parseDocumentLibrary,
  type DocumentCategory,
  type PublicDocument,
} from "@/lib/documents/schema";

const categories: { value: DocumentCategory; label: string }[] = [
  { value: "zus", label: "ZUS" },
  { value: "krus", label: "KRUS" },
  { value: "wbe", label: "WBE" },
  { value: "mswia", label: "MSWiA" },
  { value: "other", label: "Inne" },
];

export default function DocumentsManager() {
  const [draft, setDraft] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  const [saved, setSaved] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  const [published, setPublished] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string; ok: boolean } | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/documents", {
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });
      const state = await response.json();
      if (!response.ok) throw new Error(state.error ?? "Nie udało się pobrać dokumentów.");
      const live = parseDocumentLibrary(state.published);
      const editable = state.draft ? parseDocumentLibrary(state.draft) : live;
      setDraft(editable);
      setSaved(editable);
      setPublished(live);
    } catch (cause) {
      if (!signal?.aborted)
        setError(cause instanceof Error ? cause.message : "Nie udało się pobrać dokumentów.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (!pendingRemoval) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingRemoval(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingRemoval]);

  const unsaved = JSON.stringify(draft) !== JSON.stringify(saved);
  const unpublished = JSON.stringify(draft) !== JSON.stringify(published);
  const update = (id: string, patch: Partial<PublicDocument>) =>
    setDraft((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const add = () => {
    const id = `nowy-${Date.now()}`;
    setDraft((items) => [
      ...items,
      {
        id,
        title: "Nowy dokument",
        description: "",
        category: "other",
        href: "/nowy-dokument.pdf",
        published: false,
      },
    ]);
  };
  const move = (id: string, delta: number) =>
    setDraft((items) => {
      const oldIndex = items.findIndex((item) => item.id === id);
      const nextIndex = oldIndex + delta;
      if (oldIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
      const copy = [...items];
      [copy[oldIndex], copy[nextIndex]] = [copy[nextIndex], copy[oldIndex]];
      return copy;
    });
  const remove = () => {
    setDraft((items) => items.filter((item) => item.id !== pendingRemoval));
    setPendingRemoval(null);
  };
  const save = async (publish: boolean) => {
    if (busy) return;
    setBusy(true);
    setNotification(null);
    try {
      const valid = parseDocumentLibrary(draft);
      const response = await fetch("/api/admin/documents", {
        method: publish ? "POST" : "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid),
        signal: AbortSignal.timeout(20_000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Nie udało się zapisać dokumentów.");
      setDraft(valid);
      setSaved(valid);
      if (publish) setPublished(valid);
      setNotification({
        message: publish ? "Zmiany w dokumentach opublikowane." : "Szkic dokumentów zapisany.",
        ok: true,
      });
    } catch (cause) {
      setNotification({ message: cause instanceof Error ? cause.message : "Błąd zapisu.", ok: false });
    } finally {
      setBusy(false);
    }
  };
  const selected = draft.find((item) => item.id === pendingRemoval);

  return (
    <main id="main">
      <PageHeading eyebrow="Zarządzanie" title="Dokumenty">
        <Link href="/dokumenty" target="_blank" rel="noopener noreferrer" className={subtleButton}>
          <TbExternalLink size={18} /> Strona dokumentów
        </Link>
      </PageHeading>
      {loading ? (
        <div role="status" className="py-16 text-sm text-[#647067]">
          Wczytywanie…
        </div>
      ) : error ? (
        <div role="alert" className={`${surfaceClass} max-w-xl space-y-4 p-6`}>
          <p className="text-[#9c403d]">{error}</p>
          <button onClick={() => void load()} className={subtleButton}>
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#677368]">Kolejność dokumentów odpowiada kolejności na stronie.</p>
            <button onClick={add} disabled={draft.length >= 24} className={primaryButton}>
              <TbFilePlus size={19} /> Dodaj dokument
            </button>
          </div>
          {draft.map((item, index) => (
            <section
              key={item.id}
              aria-label={item.title}
              className={`${surfaceClass} grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 3xl:p-7`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <TbFileText size={24} className="shrink-0 text-[#a68559]" />
                    <h2 className="truncate font-display text-2xl text-[#1d3025]">{item.title}</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eae7df] px-3 py-1 text-xs font-semibold text-[#6b6559]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <Field label="Nazwa">
                  <input
                    className={fieldClass}
                    value={item.title}
                    onChange={(e) => update(item.id, { title: e.target.value })}
                  />
                </Field>
                <Field label="Opis">
                  <textarea
                    rows={3}
                    className={`${fieldClass} resize-y`}
                    value={item.description}
                    onChange={(e) => update(item.id, { description: e.target.value })}
                  />
                </Field>
                <Field label="Plik PDF w public lub oficjalny adres HTTPS">
                  <input
                    className={`${fieldClass} font-mono text-xs`}
                    value={item.href}
                    onChange={(e) => update(item.id, { href: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#425046]">Kategoria</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          aria-pressed={item.category === category.value}
                          onClick={() => update(item.id, { category: category.value })}
                          className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${item.category === category.value ? "border-[#b89b70] bg-[#e9ddc8] text-[#21382b]" : "border-[#deddd4] bg-white text-[#536156] hover:bg-[#f2f0e9]"}`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e5e2d9] bg-[#faf9f6] px-4 py-3 text-sm font-semibold text-[#34483a]">
                    <input
                      type="checkbox"
                      checked={item.published}
                      onChange={(e) => update(item.id, { published: e.target.checked })}
                      className="size-4 cursor-pointer accent-[#1b3027]"
                    />{" "}
                    Publikuj w witrynie
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#ece9e1] pt-4">
                  <button
                    type="button"
                    aria-label={`Przenieś ${item.title} wyżej`}
                    disabled={index === 0}
                    className={subtleButton}
                    onClick={() => move(item.id, -1)}
                  >
                    <TbArrowUp size={19} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Przenieś ${item.title} niżej`}
                    disabled={index === draft.length - 1}
                    className={subtleButton}
                    onClick={() => move(item.id, 1)}
                  >
                    <TbArrowDown size={19} />
                  </button>
                  <button
                    type="button"
                    className={`${subtleButton} text-[#9b4440]`}
                    onClick={() => setPendingRemoval(item.id)}
                  >
                    <TbTrash size={18} /> Usuń
                  </button>
                </div>
              </div>
            </section>
          ))}
          <div className="flex flex-wrap justify-end gap-3 pb-10">
            <button
              type="button"
              className={subtleButton}
              disabled={busy || !unsaved}
              onClick={() => void save(false)}
            >
              Zapisz szkic
            </button>
            <button
              type="button"
              className={primaryButton}
              disabled={busy || (!unsaved && !unpublished)}
              onClick={() => void save(true)}
            >
              {busy ? "Zapisywanie…" : "Opublikuj"}
            </button>
          </div>
        </div>
      )}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-5 top-5 z-[100] w-[min(400px,calc(100vw-40px))]"
        >
          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-4 shadow-2xl ${notification.ok ? "border-[#bcd1bd]" : "border-[#ddb1a9]"}`}
          >
            {notification.ok ? (
              <TbCheck size={22} className="shrink-0 text-[#528358]" />
            ) : (
              <TbAlertCircle size={22} className="shrink-0 text-[#b0443e]" />
            )}
            <p className="flex-1 text-sm font-semibold text-[#263a2d]">{notification.message}</p>
            <button aria-label="Zamknij" onClick={() => setNotification(null)} className="text-[#5b665e]">
              <TbX size={18} />
            </button>
          </div>
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#08110b]/70 p-5"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPendingRemoval(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-document-removal"
            className="w-full max-w-md rounded-2xl border border-[#e5dfd3] bg-[#f9f7f2] p-7 shadow-2xl"
          >
            <h2 id="confirm-document-removal" className="font-display text-4xl text-[#1d2b22]">
              Usunąć dokument?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#516056]">
              „{selected.title}” zostanie usunięty z biblioteki po opublikowaniu zmian. Sam plik PDF w
              katalogu public pozostanie bez zmian.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button autoFocus onClick={() => setPendingRemoval(null)} className={subtleButton}>
                Anuluj
              </button>
              <button
                onClick={remove}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#8b3837] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6b2928]"
              >
                <TbTrash /> Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
