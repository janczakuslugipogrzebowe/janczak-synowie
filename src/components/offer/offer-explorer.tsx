"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { tallestServiceCardHeight, expandedOfferGridHeight } from "@/lib/offer/stable-grid";
import {
  expandOfferService,
  openedServices,
  toggleOfferService,
  type OfferOpenState,
} from "@/lib/offer/open-state";
import { TbArrowUpRight, TbCheck, TbChevronDown, TbPhoto } from "react-icons/tb";
import SubpageContainer from "@/components/subpages/subpage-container";
import { safeOfferImage, type OfferIntro } from "@/lib/offer/schema";
import {
  categoryCover,
  visibleOfferCategories,
  type ManagedOfferService,
  type ServiceCatalog,
} from "@/lib/offer/service-catalog";

const displayNumber = (number: number) => String(number).padStart(2, "0");
const TITLE_CLASS = "font-display tracking-[-.045em] leading-[1.08]";

type Props = {
  intro: OfferIntro;
  heading: OfferIntro;
  catalog: ServiceCatalog;
  preview?: boolean;
  initialCategoryId?: string;
  initialServiceId?: string;
};

function GalleryCover({
  src,
  title,
  x = 50,
  y = 50,
}: {
  src: string;
  title: string;
  x?: number;
  y?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || !safeOfferImage(src) || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_15%_20%,#425845_0%,#1c3629_55%,#13271d_100%)]"
        aria-label={`Obszar usług: ${title}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full border border-[#e2cba1]/20" />
        <TbPhoto aria-hidden="true" size={38} strokeWidth={1.15} className="text-[#d7c49b]/65" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={title}
      fill
      priority={false}
      sizes="(min-width:1024px) 40vw, 100vw"
      className="object-cover"
      style={{ objectPosition: `${x}% ${y}%` }}
      onError={() => setFailed(true)}
    />
  );
}

export function ServiceEntry({
  item,
  open,
  onToggle,
  reduced,
  preview,
  className = "",
  expandedHeight,
}: {
  item: ManagedOfferService;
  open: boolean;
  onToggle: () => void;
  reduced: boolean;
  preview: boolean;
  className?: string;
  expandedHeight?: number;
}) {
  const panelId = `szczegoly-${item.id}`;
  const canExpand = Boolean(
    item.details ||
    item.bullets.length ||
    item.note ||
    item.faq.length ||
    item.imageUrl ||
    item.cta !== "none",
  );
  const href = item.cta === "documents" ? "/dokumenty" : item.cta === "contact" ? "/kontakt" : null;

  return (
    <article
      style={{ minHeight: open && expandedHeight ? `${expandedHeight}px` : undefined }}
      id={item.id}
      data-offer-service
      className={`scroll-mt-[190px] h-fit self-start overflow-hidden rounded-[1rem] border border-[#e7dfd2] bg-[#fffdf9] shadow-[0_18px_38px_-34px_rgba(21,43,26,.28)] transition-[box-shadow,border-color,background-color] duration-200 ${open ? "border-[#ded3c1] shadow-[0_26px_56px_-44px_rgba(21,43,26,.34)]" : "hover:border-[#d8ccb9] hover:bg-white"} ${className}`}
    >
      <h4>
        <button
          data-offer-trigger
          type="button"
          disabled={!canExpand}
          aria-expanded={canExpand && open}
          aria-controls={canExpand ? panelId : undefined}
          onClick={onToggle}
          className="group flex min-h-[112px] w-full cursor-pointer items-center justify-between gap-5 px-5 py-6 text-left text-[#1b3427] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#987b51] disabled:cursor-default sm:px-8 sm:py-7"
        >
          <span className="min-w-0 flex-1">
            <span
              className={`block ${TITLE_CLASS} text-[clamp(1.55rem,2.1vw,2.5rem)] transition-colors ${open ? "text-[#916f42]" : "group-hover:text-[#916f42]"}`}
            >
              {item.title}
            </span>
            <span className="mt-2 block max-w-[70ch] text-[clamp(.93rem,1vw,1.04rem)] leading-[1.7] text-[#607064]">
              {item.lead}
            </span>
          </span>
          {canExpand && (
            <span
              aria-hidden="true"
              className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${open ? "border-[#1d392a] bg-[#1d392a] text-white" : "border-[#d6cab7] text-[#886e49] group-hover:border-[#91764e]"}`}
            >
              <TbChevronDown
                size={19}
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </span>
          )}
        </button>
      </h4>

      {canExpand && (
        <motion.div
          id={panelId}
          aria-hidden={!open}
          inert={!open}
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            data-offer-detail-content
            className={`grid gap-7 border-t border-[#efe8dd] px-5 pb-8 pt-7 sm:px-8 lg:gap-8 ${item.imageUrl ? "grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,.78fr)]" : "grid-cols-1"}`}
          >
            <div className="min-w-0">
              {item.details && (
                <div className="whitespace-pre-line text-[clamp(.98rem,1.02vw,1.08rem)] leading-[1.9] text-[#415a47]">
                  {item.details}
                </div>
              )}
              {item.bullets.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {item.bullets.map((point, index) => (
                    <li
                      key={`${index}-${point}`}
                      className="flex items-start gap-3 text-sm leading-[1.7] text-[#4c6253]"
                    >
                      <TbCheck className="mt-1 shrink-0 text-[#a68150]" size={17} />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {item.note && (
                <p className="mt-6 border-l-2 border-[#bd9e6d] pl-4 text-sm leading-[1.8] text-[#5b6d5f]">
                  {item.note}
                </p>
              )}
              {item.faq.length > 0 && (
                <div className="mt-7 space-y-2">
                  <p className="mb-3 text-[.7rem] font-bold uppercase tracking-[.18em] text-[#957449]">
                    Dodatkowe informacje
                  </p>
                  {item.faq.map((qa, index) => (
                    <details
                      key={`${index}-${qa.question}`}
                      className="group/faq rounded-lg border border-[#e5ddcf] bg-[#f9f6ef] px-4 py-3"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-[#284335]">
                        {qa.question}
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-[1.8] text-[#597061]">
                        {qa.answer}
                      </p>
                    </details>
                  ))}
                </div>
              )}
              {href && !preview && (
                <Link
                  href={href}
                  className="mt-7 inline-flex items-center gap-2 border-b border-[#ab895c] pb-1 text-sm font-semibold text-[#83623c] transition-colors hover:text-[#213a29]"
                >
                  {item.cta === "documents" ? "Przejdź do dokumentów" : "Zapytaj o szczegóły"}{" "}
                  <TbArrowUpRight size={17} />
                </Link>
              )}
            </div>
            {item.imageUrl && (
              <div className="relative min-h-[240px] overflow-hidden rounded-xl bg-[#dae0d4] lg:min-h-[300px]">
                <GalleryCover
                  key={item.imageUrl}
                  src={item.imageUrl}
                  title={item.title}
                  x={item.imagePositionX}
                  y={item.imagePositionY}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </article>
  );
}

export default function OfferExplorer({
  intro,
  catalog,
  preview = false,
  initialCategoryId,
  initialServiceId,
}: Props) {
  const categories = useMemo(() => visibleOfferCategories(catalog), [catalog]);
  const firstId = categories.find((c) => c.id === initialCategoryId)?.id ?? categories[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstId);
  const [expandedByCategory, setExpandedByCategory] = useState<OfferOpenState>(() =>
    initialServiceId ? { [firstId]: [initialServiceId] } : {},
  );
  const reduced = Boolean(useReducedMotion());
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const previouslySelected = useRef<string | undefined>(firstId);
  const scrollTarget = useRef<string | null>(null);
  const servicesGrid = useRef<HTMLDivElement>(null);
  const [cardDimensions, setCardDimensions] = useState<{
    categoryId: string;
    tallest: number;
    gridHeight: number;
  } | null>(null);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const services = useMemo(
    () => catalog.items.filter((s) => s.visible && s.categoryId === active?.id),
    [catalog.items, active?.id],
  );
  const openIds = openedServices(expandedByCategory, active?.id ?? "", services[0]?.id);
  const hasOpenService = services.some((item) => openIds.includes(item.id));
  const measured = cardDimensions?.categoryId === active?.id ? cardDimensions : null;

  // Measure each service's fully expanded content even while its drawer is
  // closed. Only the OPEN card gets the tallest expanded height. All CLOSED
  // cards remain compact. A minimum on the grid reserves the same overall
  // height while switching an open drawer between columns or rows.
  useEffect(() => {
    const grid = servicesGrid.current;
    if (!grid || !services.length) {
      setCardDimensions(null);
      return;
    }

    let frame = 0;
    const measure = () => {
      const entries = Array.from(grid.querySelectorAll<HTMLElement>("[data-offer-service]"));
      if (!entries.length) return;
      const dimensions = entries.map((entry) => {
        const button = entry.querySelector<HTMLElement>("[data-offer-trigger]");
        const detail = entry.querySelector<HTMLElement>("[data-offer-detail-content]");
        const css = getComputedStyle(entry);
        const borders = parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
        return {
          header: (button?.getBoundingClientRect().height ?? 0) + borders,
          detail: detail?.getBoundingClientRect().height ?? 0,
        };
      });
      const tallest = tallestServiceCardHeight(dimensions);
      const columns = window.matchMedia("(min-width: 1280px)").matches ? 2 : 1;
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
      const gridHeight = expandedOfferGridHeight(dimensions, columns, gap);
      setCardDimensions((previous) =>
        previous?.categoryId === active?.id &&
        Math.abs(previous.tallest - tallest) <= 1 &&
        Math.abs(previous.gridHeight - gridHeight) <= 1
          ? previous
          : { categoryId: active?.id ?? "", tallest, gridHeight },
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(grid);
    grid
      .querySelectorAll<HTMLElement>("[data-offer-trigger], [data-offer-detail-content]")
      .forEach((el) => resize.observe(el));
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [services, active?.id]);

  const goTo = useCallback(
    (target: string, scroll: boolean, track: boolean) => {
      const category = categories.find((c) => c.id === target || `kategoria-${c.id}` === target);
      const service = catalog.items.find(
        (s) => s.id === target && s.visible && categories.some((c) => c.id === s.categoryId),
      );
      const id = service?.categoryId ?? category?.id;
      if (!id) return false;
      if (track && !preview)
        window.history.pushState(null, "", `#${service ? service.id : `kategoria-${id}`}`);
      scrollTarget.current = scroll ? (service ? service.id : "offer-category-start") : null;
      setActiveId(id);
      // Keep independently opened drawers when switching tabs or following links.
      if (service) {
        const firstInCategory = catalog.items.find((item) => item.visible && item.categoryId === id)?.id;
        setExpandedByCategory((previous) => expandOfferService(previous, id, service.id, firstInCategory));
      }
      return true;
    },
    [catalog.items, categories, preview],
  );

  useEffect(() => {
    if (preview) return;
    const syncHash = () => {
      let hash = "";
      try {
        hash = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (hash) goTo(hash, true, false);
    };
    const initialSync = requestAnimationFrame(syncHash);
    window.addEventListener("popstate", syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(initialSync);
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [goTo, preview]);

  useEffect(() => {
    const target = scrollTarget.current;
    if (!target || preview) return;
    scrollTarget.current = null;
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (!element) return;
      const header = window.matchMedia("(min-width: 768px)").matches ? 88 : 78;
      const offset = header + 94;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [active?.id, expandedByCategory, preview, reduced]);

  useEffect(() => {
    if (previouslySelected.current !== active?.id) {
      tabs.current[active?.id ?? ""]?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "auto",
      });
    }
    previouslySelected.current = active?.id;
  }, [active?.id]);

  const setCategory = (id: string) => {
    if (id === active?.id) {
      const el = document.getElementById("offer-category-start");
      if (el)
        window.scrollTo({
          top: Math.max(
            0,
            el.getBoundingClientRect().top +
              window.scrollY -
              (window.matchMedia("(min-width: 768px)").matches ? 180 : 168),
          ),
          behavior: reduced ? "instant" : "smooth",
        });
      return;
    }
    goTo(id, true, true);
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const move = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!move && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? categories.length - 1
          : (index + move + categories.length) % categories.length;
    const id = categories[next]?.id;
    if (id) {
      setCategory(id);
      tabs.current[id]?.focus();
    }
  };

  return (
    <section
      id="zakres-uslug"
      aria-labelledby="offer-explorer-title"
      className="relative isolate bg-[#f7f3eb] pb-[clamp(5rem,8vw,9rem)] text-[#1d3528]"
    >
      <SubpageContainer className="pb-[clamp(2.1rem,4vw,4.5rem)] pt-[clamp(5.5rem,8vw,9rem)]">
        <div className="grid items-end gap-7 lg:grid-cols-[1.1fr_.65fr] lg:gap-16">
          <div>
            <span className="mb-6 block text-[.73rem] font-bold uppercase tracking-[.22em] text-[#aa8754]">
              {intro.eyebrow}
            </span>
            <h2
              id="offer-explorer-title"
              className={`${TITLE_CLASS} max-w-[940px] text-[clamp(2.9rem,4.6vw,6rem)]`}
              style={{
                fontSize: `clamp(2.9rem, ${(4.4 * intro.headingScale) / 100}vw, ${(6 * intro.headingScale) / 100}rem)`,
              }}
            >
              {intro.title}
            </h2>
          </div>
          {intro.description && (
            <p className="max-w-lg whitespace-pre-line pb-2 text-[clamp(1.02rem,1.15vw,1.23rem)] leading-[1.85] text-[#596c5e]">
              {intro.description}
            </p>
          )}
        </div>
      </SubpageContainer>

      {categories.length > 0 ? (
        <>
          <div
            className="sticky top-[78px] z-30 border-y border-[#dfd4c2] bg-[#f8f4ec]/95 shadow-[0_16px_35px_-35px_rgba(18,43,26,.55)] backdrop-blur-xl md:top-[88px]"
            aria-label="Nawigacja po kategoriach oferty"
          >
            <SubpageContainer className="flex min-h-[69px] items-center gap-4 md:min-h-[78px]">
              <div
                role="tablist"
                aria-label="Kategorie usług"
                className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    ref={(element) => {
                      tabs.current[category.id] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${category.id}`}
                    aria-controls="offer-active-panel"
                    aria-selected={category.id === active?.id}
                    tabIndex={category.id === active?.id ? 0 : -1}
                    onKeyDown={(event) => onTabKey(event, index)}
                    onClick={() => setCategory(category.id)}
                    className={`relative flex min-h-11 shrink-0 snap-start items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2 text-[.84rem] font-semibold transition-[color,background,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b5e] sm:px-5 ${category.id === active?.id ? "bg-[#183729] text-[#fff9ef] shadow-[0_8px_18px_-12px_#12291c]" : "border border-[#e1d4c2] bg-[#fffdf9]/75 text-[#36503e] hover:border-[#bda783] hover:bg-white"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={category.id === active?.id ? "text-[#e6c996]" : "text-[#a08051]"}
                    >
                      {displayNumber(index + 1)}
                    </span>
                    {category.title}
                  </button>
                ))}
              </div>
              <div className="hidden shrink-0 text-xs tabular-nums text-[#9b805d] xl:block">
                {displayNumber(categories.findIndex((c) => c.id === active?.id) + 1)} /{" "}
                {displayNumber(categories.length)}
              </div>
            </SubpageContainer>
          </div>

          <SubpageContainer className="pt-[clamp(2rem,4vw,4.5rem)]">
            <span id="offer-category-start" aria-hidden="true" className="block scroll-mt-[180px]" />
            <div className="sr-only" aria-live="polite">
              Wybrana kategoria: {active?.title}
            </div>
            <div
              id="offer-active-panel"
              role="tabpanel"
              aria-labelledby={`tab-${active?.id}`}
              tabIndex={0}
              className="focus-visible:outline-2 focus-visible:outline-[#bd9e6c]"
            >
              {active && (
                <motion.div
                  key={active.id}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <header
                    id={`kategoria-${active.id}`}
                    className="relative grid overflow-hidden rounded-[1.15rem] bg-[#1c3729] text-[#faf6ed] shadow-[0_22px_60px_-38px_rgba(13,37,20,.5)] lg:grid-cols-[1.08fr_.92fr]"
                  >
                    <div className="relative z-10 flex min-h-[280px] flex-col justify-between gap-6 p-[clamp(1.8rem,4vw,4.3rem)] lg:min-h-[340px]">
                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#e8cd98]">
                        <span>
                          {displayNumber(categories.findIndex((c) => c.id === active.id) + 1)} /{" "}
                          {displayNumber(categories.length)}
                        </span>
                        <span aria-hidden="true" className="h-px w-9 bg-[#c3a777]/60" />
                        <span>Obszar pomocy</span>
                      </div>
                      <div>
                        <h3 className={`${TITLE_CLASS} max-w-[740px] text-[clamp(2.35rem,4vw,5.1rem)]`}>
                          {active.title}
                        </h3>
                        {active.description && (
                          <p className="mt-6 max-w-[590px] text-[clamp(1.01rem,1.13vw,1.2rem)] leading-[1.8] text-[#dce5d8]">
                            {active.description}
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d8bc86]">
                        {services.length}{" "}
                        {services.length === 1 ? "usługa" : services.length < 5 ? "usługi" : "usług"}
                      </p>
                    </div>
                    <div className="relative min-h-[250px] overflow-hidden bg-[#254332] lg:min-h-full">
                      <GalleryCover
                        key={`${active.id}:${categoryCover(active, catalog.items).src}`}
                        src={categoryCover(active, catalog.items).src}
                        title={active.title}
                        x={categoryCover(active, catalog.items).x}
                        y={categoryCover(active, catalog.items).y}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#102419]/25 to-transparent" />
                    </div>
                  </header>
                  <motion.div
                    ref={servicesGrid}
                    className="mt-[clamp(1.4rem,3vw,2.5rem)] grid grid-cols-1 content-start items-start gap-6 xl:grid-cols-2"
                    style={{
                      minHeight:
                        hasOpenService && measured?.gridHeight ? `${measured.gridHeight}px` : undefined,
                    }}
                  >
                    {services.map((item, index) => {
                      const isOpen = openIds.includes(item.id);
                      return (
                        <ServiceEntry
                          key={item.id}
                          item={item}
                          open={isOpen}
                          expandedHeight={measured?.tallest}
                          onToggle={() =>
                            setExpandedByCategory((previous) =>
                              toggleOfferService(previous, active.id, item.id, services[0]?.id),
                            )
                          }
                          reduced={reduced}
                          preview={preview}
                        />
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </SubpageContainer>
        </>
      ) : (
        <SubpageContainer>
          <p className="rounded-lg border border-[#e2d4bf] bg-white/70 p-8 text-[#536656]">
            Aktualnie nie ma opublikowanych usług.
          </p>
        </SubpageContainer>
      )}
    </section>
  );
}
