import Link from "next/link";
import { Suspense } from "react";
import { TbArrowRight, TbSearch, TbX } from "react-icons/tb";
import { ObituaryCard } from "./obituary-card";
import ObituariesListFrame from "./obituaries-list-frame";
import type { ObituariesListingContent } from "@/lib/obituaries-page/schema";
import { getPublicObituaries } from "@/lib/obituaries/data";

type SearchQuery = { q?: string | string[]; cursor?: string | string[] };

function searchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 90) : "";
}

function SearchFallback() {
  return (
    <div role="status" className="mt-12 border-t border-[#dfd6c5] py-12 text-sm text-[#637062]">
      Wczytywanie nekrologów…
    </div>
  );
}

async function ObituariesResults({ searchParams }: { searchParams: Promise<SearchQuery> }) {
  const params = await searchParams;
  const search = searchValue(params.q);
  const requestedCursor = searchValue(params.cursor);
  // Search runs as a name prefix query. Cursor pagination applies only to the unfiltered feed.
  const cursor = !search && /^[a-zA-Z0-9_-]{8,90}$/.test(requestedCursor) ? requestedCursor : "";
  const { items, nextCursor } = await getPublicObituaries(search, cursor, 12);
  const following = nextCursor
    ? `/nekrologi?${new URLSearchParams({ cursor: nextCursor }).toString()}#lista-nekrologow`
    : null;

  return (
    <>
      <form
        action="/nekrologi"
        method="GET"
        role="search"
        className="mt-9 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center"
      >
        <div className="flex min-h-15 w-full items-center gap-3 rounded-xl border border-[#d8cfbe] bg-white/80 px-5 shadow-[0_10px_35px_-30px_rgba(20,41,30,.25)] focus-within:border-[#b9945e] focus-within:ring-2 focus-within:ring-[#b9945e]/15">
          <TbSearch aria-hidden="true" className="shrink-0 text-[#a38254]" size={22} strokeWidth={1.5} />
          <label htmlFor="obituary-search" className="sr-only">
            Imię lub nazwisko osoby zmarłej
          </label>
          <input
            id="obituary-search"
            type="search"
            name="q"
            maxLength={90}
            defaultValue={search}
            placeholder="Wpisz imię lub nazwisko..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-[#193027] outline-none placeholder:text-[#7a8478] md:text-base"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-15 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#21372b] px-9 text-sm font-semibold text-white transition-colors hover:bg-[#365142] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a38254]"
        >
          Wyszukaj <TbArrowRight aria-hidden="true" size={18} />
        </button>
        {search && (
          <Link
            href="/nekrologi#lista-nekrologow"
            className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#d8cfbe] px-5 text-sm font-medium text-[#5a685a] hover:bg-white"
          >
            <TbX aria-hidden="true" size={17} /> Wyczyść
          </Link>
        )}
      </form>

      {search && (
        <p role="status" className="mt-7 text-sm leading-relaxed text-[#5d6c60]">
          Wyniki wyszukiwania dla: <span className="font-semibold text-[#193027]">{search}</span>
        </p>
      )}

      {items.length > 0 ? (
        <ul
          className="mt-10 grid list-none gap-[clamp(1rem,1.8vw,2rem)] sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-8"
          aria-label="Opublikowane nekrologi"
        >
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <ObituaryCard data={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div role="status" className="mt-10 border-y border-[#d9d0be] py-[clamp(3rem,6vw,6rem)] text-center">
          <p className="font-display text-[clamp(1.9rem,3vw,3.2rem)] leading-tight text-[#193027]">
            {search ? "Nie znaleziono pasujących nekrologów" : "Obecnie nie ma opublikowanych nekrologów"}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-[1.8] text-[#637062]">
            {search
              ? "Spróbuj wpisać samo imię lub nazwisko albo wróć do wszystkich nekrologów."
              : "Gdy pojawią się nowe informacje o uroczystościach pożegnalnych, zostaną opublikowane w tym miejscu."}
          </p>
          {search && (
            <Link
              href="/nekrologi#lista-nekrologow"
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 border-b border-[#ad8b57] text-sm font-semibold text-[#7e633c] hover:text-[#193027]"
            >
              Pokaż wszystkie nekrologi <TbArrowRight aria-hidden="true" size={18} />
            </Link>
          )}
        </div>
      )}

      {!search && (following || cursor) && (
        <nav
          aria-label="Stronicowanie nekrologów"
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          {cursor && (
            <Link
              href="/nekrologi#lista-nekrologow"
              className="inline-flex min-h-12 cursor-pointer items-center rounded-full border border-[#cabb9f] px-6 text-sm font-semibold text-[#4d5f51] transition hover:bg-white"
            >
              Wróć do najnowszych
            </Link>
          )}
          {following && (
            <Link
              href={following}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-[#b49a70] px-7 text-sm font-semibold text-[#193027] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a38254]"
            >
              Następne nekrologi <TbArrowRight aria-hidden="true" size={18} />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default function ObituariesListSection({
  searchParams,
  data,
}: {
  searchParams: Promise<SearchQuery>;
  data: ObituariesListingContent;
}) {
  return (
    <ObituariesListFrame data={data}>
      <Suspense fallback={<SearchFallback />}>
        <ObituariesResults searchParams={searchParams} />
      </Suspense>
    </ObituariesListFrame>
  );
}
