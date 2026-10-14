"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight, TbMenu2, TbPhoneCall, TbX } from "react-icons/tb";

const links = [
  { href: "/", label: "Strona główna" },
  { href: "/o-nas", label: "O nas" },
  { href: "/oferta", label: "Oferta" },
  { href: "/nekrologi", label: "Nekrologi" },
  { href: "/dokumenty", label: "Dokumenty" },
  { href: "/galeria", label: "Galeria" },
];
export default function SiteHeader() {
  const pathname = usePathname();
  // Route changes unmount the old header state, closing mobile navigation
  // even after browser back/forward navigation without an effect-driven setState.
  return <SiteHeaderContent key={pathname} pathname={pathname} />;
}

function SiteHeaderContent({ pathname }: { pathname: string }) {
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [opened, setOpened] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 35);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const solid = scrolled || !onHome || opened;
  return <>
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500 ${solid ? "border-white/10 bg-[#111c17]/95 shadow-[0_12px_50px_rgba(0,0,0,.16)] backdrop-blur-xl" : "border-white/15 bg-[#0c1511]/35 backdrop-blur-md"}`}>
      <div className="mx-auto flex h-[78px] w-[min(90%,1680px)] items-center justify-between gap-6 md:h-[88px] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)]">
        <Link href="/" className="group flex shrink-0 flex-col text-ivory" aria-label="Janczak i Synowie — strona główna">
          <span className="font-display text-[27px] font-semibold leading-[.9] tracking-[-.035em] sm:text-[31px] 3xl:text-[36px]">Janczak i Synowie</span>
          <span className="mt-2 text-[8px] font-bold uppercase tracking-[.32em] text-champagne sm:text-[9px]">Usługi pogrzebowe</span>
        </Link>
        <nav aria-label="Nawigacja główna" className="hidden items-center gap-[clamp(.7rem,1.25vw,2.4rem)] xl:flex">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname===link.href ? "page" : undefined} className={`relative whitespace-nowrap py-3 text-[11px] font-semibold uppercase tracking-[.08em] transition-colors hover:text-champagne xl:text-xs 3xl:text-sm ${pathname===link.href ? "text-champagne" : "text-white/85"}`}>
            {link.label}{pathname===link.href && <span className="absolute inset-x-0 bottom-1 h-px bg-champagne" />}
          </Link>)}
        </nav>
        <Link href="/kontakt" className="group hidden shrink-0 items-center gap-3 rounded-full border border-champagne/55 px-5 py-3 text-xs font-bold tracking-wide text-champagne transition-colors hover:border-champagne hover:bg-champagne hover:text-forest-deep xl:inline-flex 3xl:px-7 3xl:py-4 3xl:text-sm">
          <TbPhoneCall aria-hidden="true" className="size-[19px]" /> Kontakt <TbArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <button type="button" className="inline-flex size-11 items-center justify-center rounded-lg border border-white/30 text-ivory xl:hidden" aria-label={opened ? "Zamknij menu" : "Otwórz menu"} aria-expanded={opened} aria-controls="mobile-menu" onClick={()=>setOpened(v=>!v)}>
          {opened ? <TbX size={25} /> : <TbMenu2 size={25} />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {opened && <motion.nav id="mobile-menu" aria-label="Nawigacja mobilna" initial={reduced?false:{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={reduced?undefined:{height:0,opacity:0}} transition={{duration:.25}} className="overflow-hidden border-t border-white/10 bg-[#111c17] xl:hidden">
          <div className="mx-auto flex w-[90%] flex-col gap-1 py-5">
            {[...links,{href:"/kontakt",label:"Kontakt"}].map(link => <Link key={link.href} href={link.href} aria-current={pathname===link.href ? "page" : undefined} onClick={()=>setOpened(false)} className={`rounded-lg px-4 py-3 text-sm font-semibold ${pathname===link.href?"bg-white/10 text-champagne":"text-white/85 hover:bg-white/5"}`}>{link.label}</Link>)}
          </div>
        </motion.nav>}
      </AnimatePresence>
    </header>
    {!onHome && <div aria-hidden="true" className="h-[78px] bg-forest-deep md:h-[88px]" />}
  </>;
}
