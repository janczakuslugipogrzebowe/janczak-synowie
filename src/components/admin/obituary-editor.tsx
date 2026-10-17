"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TbArrowLeft, TbDeviceDesktop, TbDeviceMobile, TbExternalLink } from "react-icons/tb";
import ObituaryDetails from "@/components/obituaries/obituary-details";
import {
  DEFAULT_OBITUARY,
  parseObituaryInput,
  STATUS_NAMES,
  type ObituaryInput,
  type ObituaryRecord,
} from "@/lib/obituaries/schema";
import {
  Field,
  PageHeading,
  fieldClass,
  subtleButton,
  primaryButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import { DatePicker, DateTimePicker } from "@/components/ui/date-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { notify } from "@/components/ui/toast-provider";
export default function ObituaryEditor({ id }: { id?: string }) {
  const router = useRouter(),
    [draft, setDraft] = useState<ObituaryInput>(() => ({ ...DEFAULT_OBITUARY })),
    [saved, setSaved] = useState<ObituaryInput>(() => ({ ...DEFAULT_OBITUARY }));
  const [record, setRecord] = useState<ObituaryRecord | null>(null),
    [loading, setLoading] = useState(Boolean(id)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [, setMessage] = useState(""),
    [phone, setPhone] = useState(false),
    [hasDraft, setHasDraft] = useState(false);
  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    async function load() {
      try {
        const r = await fetch(`/api/admin/obituaries/${id}`, { signal: ac.signal, cache: "no-store" });
        const p = await r.json();
        if (!r.ok) throw new Error(p.error || "Nie udało się pobrać danych.");
        const record = p.record as ObituaryRecord;
        const form = p.draft
          ? parseObituaryInput(p.draft)
          : parseObituaryInput(
              Object.fromEntries(
                Object.keys(DEFAULT_OBITUARY).map((k) => [k, record[k as keyof ObituaryInput]]),
              ),
            );
        if (!ac.signal.aborted) {
          setRecord(record);
          setDraft(form);
          setSaved(form);
          setHasDraft(Boolean(p.draft));
        }
      } catch (e) {
        if (!ac.signal.aborted) setError(e instanceof Error ? e.message : "Błąd pobierania.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => ac.abort();
  }, [id]);
  function field<K extends keyof ObituaryInput>(key: K, value: ObituaryInput[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }
  async function save(publish: boolean) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const valid = parseObituaryInput(draft);
      const r = await fetch(id ? `/api/admin/obituaries/${id}` : "/api/admin/obituaries", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: valid, publish }),
        credentials: "same-origin",
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error || "Nie udało się zapisać nekrologu.");
      if (publish) {
        notify.success("Nekrolog opublikowany", "Zmiany są widoczne na stronie.");
        // Return to the list after a successful publish. A fresh /new visit starts with DEFAULT_OBITUARY.
        router.replace("/admin/obituaries");
        router.refresh();
        return;
      }
      setSaved(valid);
      setHasDraft(record?.status === "published");
      notify.success("Szkic zapisany", "Zmiany nie są jeszcze opublikowane.");
      if (!id) {
        router.replace(`/admin/obituaries/${p.id}/edit`);
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Błąd zapisu.";
      setError(msg);
      notify.error("Nie udało się zapisać nekrologu", msg);
    } finally {
      setBusy(false);
    }
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  return (
    <main id="main">
      <PageHeading eyebrow="ZARZĄDZANIE / NEKROLOGI" title={id ? "Edytuj nekrolog" : "Nowy nekrolog"}>
        <Link href="/admin/obituaries" className={subtleButton}>
          <TbArrowLeft size={17} /> Wróć do listy
        </Link>
      </PageHeading>
      {loading ? (
        <p className="text-sm text-[#647367]">Wczytywanie…</p>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
          <section className={`${surfaceClass} space-y-6 p-5 md:p-7`}>
            {record && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[#eef0e9] px-3 py-2 font-semibold text-[#566a59]">
                  {STATUS_NAMES[record.status]}
                </span>
                {hasDraft && (
                  <span className="rounded-full bg-[#f7ead7] px-3 py-2 font-semibold text-[#8d6539]">
                    Nieopublikowany szkic zmian
                  </span>
                )}
              </div>
            )}
            <div className="space-y-4">
              <h2 className="font-display text-3xl">Dane osoby</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Imię">
                  <input
                    className={fieldClass}
                    maxLength={90}
                    value={draft.firstName}
                    onChange={(e) => field("firstName", e.target.value)}
                  />
                </Field>
                <Field label="Nazwisko">
                  <input
                    className={fieldClass}
                    maxLength={120}
                    value={draft.lastName}
                    onChange={(e) => field("lastName", e.target.value)}
                  />
                </Field>
                <Field label="Data urodzenia">
                  <DatePicker
                    value={draft.birthDate}
                    onChange={(v) => field("birthDate", v)}
                    label="Data urodzenia"
                  />
                </Field>
                <Field label="Data śmierci">
                  <DatePicker
                    value={draft.deathDate}
                    onChange={(v) => field("deathDate", v)}
                    label="Data śmierci"
                  />
                </Field>
              </div>
            </div>
            <div className="space-y-4 border-t border-[#eae8df] pt-6">
              <h2 className="font-display text-3xl">Uroczystość</h2>
              <Field label="Data i godzina">
                <DateTimePicker
                  value={draft.ceremonyDate}
                  onChange={(v) => field("ceremonyDate", v)}
                  label="Data ceremonii"
                />
              </Field>
              <Field label="Miejsce ceremonii">
                <input
                  maxLength={170}
                  className={fieldClass}
                  value={draft.ceremonyPlace}
                  onChange={(e) => field("ceremonyPlace", e.target.value)}
                />
              </Field>
              <Field label="Adres ceremonii">
                <input
                  maxLength={240}
                  className={fieldClass}
                  value={draft.ceremonyAddress}
                  onChange={(e) => field("ceremonyAddress", e.target.value)}
                />
              </Field>
              <Field label="Miejsce pochówku">
                <input
                  maxLength={180}
                  className={fieldClass}
                  value={draft.burialPlace}
                  onChange={(e) => field("burialPlace", e.target.value)}
                />
              </Field>
            </div>
            <div className="space-y-4 border-t border-[#eae8df] pt-6">
              <h2 className="font-display text-3xl">Treść i wygląd</h2>
              <Field label="Treść pożegnania">
                <textarea
                  maxLength={4000}
                  className={`${fieldClass} min-h-36 resize-y`}
                  value={draft.farewell}
                  onChange={(e) => field("farewell", e.target.value)}
                />
              </Field>
              <Field label="Motyw graficzny">
                <CustomSelect
                  value={draft.symbol}
                  onChange={(v) => field("symbol", v as ObituaryInput["symbol"])}
                  label="Motyw graficzny"
                  options={[
                    { value: "flower", label: "Kwiat" },
                    { value: "cross", label: "Krzyż" },
                    { value: "candle", label: "Świeca" },
                    { value: "none", label: "Neutralny" },
                  ]}
                />
              </Field>
              <label className="flex items-start gap-3 rounded-xl border border-[#e9e5dd] bg-[#fbfaf6] p-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-[#21362a]"
                  checked={draft.seoIndex}
                  onChange={(e) => field("seoIndex", e.target.checked)}
                />
                <span>Zezwalaj wyszukiwarkom na indeksowanie tego nekrologu.</span>
              </label>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {record?.status === "trash" ? (
              <p className="text-sm text-[#8e5735]">
                Nekrolog znajduje się w koszu. Przywróć go z listy, aby ponownie edytować.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2 border-t border-[#eae8df] pt-6">
                <button
                  className={subtleButton}
                  type="button"
                  disabled={busy || (!!id && !dirty && !(record?.status === "published" && !hasDraft))}
                  onClick={() => void save(false)}
                >
                  Zapisz szkic
                </button>
                <button
                  className={primaryButton}
                  type="button"
                  disabled={busy}
                  onClick={() => void save(true)}
                >
                  {busy ? "Zapisywanie…" : "Opublikuj"}
                </button>
              </div>
            )}
          </section>
          <section
            aria-label="Podgląd nekrologu"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#617162]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPhone((v) => !v)} className={subtleButton}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                {record?.status === "published" && (
                  <Link
                    href={`/nekrologi/${record.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={subtleButton}
                  >
                    <TbExternalLink /> Strona
                  </Link>
                )}
              </div>
            </div>
            <div
              className={`mx-auto rounded-2xl bg-[#f6f1e8] p-3 sm:p-6 ${phone ? "max-w-[420px]" : "max-w-full"}`}
            >
              <ObituaryDetails entry={draft} preview />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
