"use client";
import { useEffect, useState } from "react";
import { TbSearch } from "react-icons/tb";
import { ObituaryCard } from "@/components/obituaries/obituary-card";
import type { ObituaryRecord } from "@/lib/obituaries/schema";
import type { ObituariesListingContent } from "@/lib/obituaries-page/schema";
import ObituariesListFrame from "./obituaries-list-frame";

/** Uses real published entries from the existing authenticated CMS endpoint, never placeholder profiles. */
export default function ObituariesListPreview({ data }: { data: ObituariesListingContent }) {
  const [items, setItems] = useState<ObituaryRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/obituaries?status=published&sort=recent", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Nie udało się odczytać nekrologów.");
        return response.json();
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(result?.items)) throw new Error("Błędna odpowiedź serwera.");
        setItems(
          (result.items as ObituaryRecord[]).filter((item) => item.status === "published").slice(0, 3),
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, []);
  return (
    <ObituariesListFrame data={data} preview>
      <div className="mt-9 flex items-center gap-3 rounded-xl border border-[#d8cfbe] bg-white/80 px-5 py-5 text-[#788477]">
        <TbSearch aria-hidden="true" size={20} />
        <span className="text-sm">Wpisz imię lub nazwisko...</span>
      </div>
      {status === "loading" ? (
        <p role="status" className="mt-7 text-sm text-[#637062]">
          Wczytywanie nekrologów…
        </p>
      ) : status === "error" ? (
        <p role="alert" className="mt-7 text-sm text-[#637062]">
          Nie udało się wczytać podglądu nekrologów.
        </p>
      ) : items.length ? (
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ObituaryCard key={item.id} data={item} preview compact />
          ))}
        </div>
      ) : (
        <p className="mt-7 text-sm text-[#637062]">Brak opublikowanych nekrologów w podglądzie.</p>
      )}
    </ObituariesListFrame>
  );
}
