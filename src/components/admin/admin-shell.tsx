"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { notify } from "@/components/ui/toast-provider";
import {
  TbBuildingEstate,
  TbExternalLink,
  TbLogout,
  TbMenu2,
  TbX,
  TbLayoutDashboard,
  TbFileText,
  TbLayoutGrid,
  TbChevronDown,
  TbChevronRight,
  TbHome,
  TbArticle,
  TbPhoto,
  TbNotes,
  TbHeartHandshake,
  TbFlower,
} from "react-icons/tb";
import { PAGE_LABELS, PAGE_SLUGS, type PageSlug } from "@/lib/pages/schema";

const mainNav = [
  { href: "/admin", label: "Pulpit", Icon: TbLayoutDashboard },
  { href: "/admin/company", label: "Firma i kontakt", Icon: TbBuildingEstate },
  { href: "/admin/obituaries", label: "Nekrologi", Icon: TbFileText },
];

function SiteTree({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const current = pathname.startsWith("/admin/site/home")
    ? "home"
    : (PAGE_SLUGS.find((slug) => pathname.startsWith(`/admin/site/${slug}`)) ?? "home");
  const [expanded, setExpanded] = useState<string | null>(current);
  const sections: { id: string; label: string; href: string; Icon: typeof TbPhoto }[] = [
    { id: "hero", label: "Hero", href: "/admin/site/home/hero", Icon: TbPhoto },
    { id: "about", label: "O nas", href: "/admin/site/home/about", Icon: TbArticle },
    { id: "guidance", label: "Co zrobić", href: "/admin/site/home/guidance", Icon: TbHeartHandshake },
    { id: "services", label: "Usługi", href: "/admin/site/home/services", Icon: TbLayoutGrid },
    { id: "florist", label: "Kwiaciarnia", href: "/admin/site/home/florist", Icon: TbFlower },
    { id: "obituaries", label: "Nekrologi", href: "/admin/site/home/obituaries", Icon: TbFileText },
  ];
  const active = (href: string) => pathname === href;
  const sectionStyle = (href: string) =>
    `flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${active(href) ? "bg-[#e3c997]/16 font-semibold text-champagne" : "text-white/65 hover:bg-white/8 hover:text-white"}`;
  return (
    <div className="space-y-1 pl-3">
      <button
        type="button"
        aria-expanded={expanded === "home"}
        aria-controls="site-home-sections"
        onClick={() => setExpanded((x) => (x === "home" ? null : "home"))}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/10"
      >
        <TbHome size={18} strokeWidth={1.6} />
        <span className="flex-1">Strona główna</span>
        {expanded === "home" ? <TbChevronDown size={16} /> : <TbChevronRight size={16} />}
      </button>
      {expanded === "home" && (
        <div id="site-home-sections" className="space-y-1 border-l border-white/15 py-1 pl-3 ml-5">
          {sections.map(({ id, label, href, Icon }) => (
            <Link
              key={id}
              href={href}
              onClick={onNavigate}
              aria-current={active(href) ? "page" : undefined}
              className={sectionStyle(href)}
            >
              <Icon size={17} strokeWidth={1.65} />
              {label}
            </Link>
          ))}
        </div>
      )}
      {PAGE_SLUGS.map((slug: PageSlug) => {
        const href = `/admin/site/${slug}`;
        return (
          <div key={slug}>
            <button
              type="button"
              aria-expanded={expanded === slug}
              onClick={() => setExpanded((x) => (x === slug ? null : slug))}
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/10"
            >
              <TbNotes size={18} strokeWidth={1.6} />
              <span className="flex-1">{PAGE_LABELS[slug]}</span>
              {expanded === slug ? <TbChevronDown size={16} /> : <TbChevronRight size={16} />}
            </button>
            {expanded === slug && (
              <div className="ml-5 border-l border-white/15 py-1 pl-3">
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active(href) ? "page" : undefined}
                  className={sectionStyle(href)}
                >
                  <TbArticle size={17} strokeWidth={1.65} />
                  Wprowadzenie
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  const [opened, setOpened] = useState(false),
    [busy, setBusy] = useState(false);
  const inSite = pathname === "/admin/site" || pathname.startsWith("/admin/site/");
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/session/logout", { method: "POST", credentials: "same-origin" });
      if (!r.ok) throw new Error();
      await signOut(auth);
      router.replace("/admin/login");
      router.refresh();
    } catch {
      notify.error("Nie udało się wylogować", "Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-dvh lg:pl-[270px] 3xl:pl-[320px]">
      {opened && (
        <button
          type="button"
          aria-label="Zamknij nawigację"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpened(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#14241c] text-white transition-transform lg:translate-x-0 3xl:w-[320px] ${opened ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link href="/admin" className="border-b border-white/10 px-7 py-8" onClick={() => setOpened(false)}>
          <span className="block font-display text-[29px] font-semibold leading-none">Janczak i Synowie</span>
          <span className="mt-2 block text-[9px] font-bold uppercase tracking-[.27em] text-champagne">
            Panel administracyjny
          </span>
        </Link>
        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 [scrollbar-width:thin]"
          aria-label="Panel administracyjny"
        >
          {mainNav.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpened(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${active ? "bg-[#e3c997]/15 text-champagne" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.7} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/admin/site"
            onClick={() => setOpened(false)}
            aria-current={pathname === "/admin/site" ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${inSite ? "bg-[#e3c997]/15 text-champagne" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
          >
            <TbLayoutGrid className="size-5 shrink-0" strokeWidth={1.7} />
            Edytor witryny
          </Link>
          {inSite && <SiteTree key={pathname} pathname={pathname} onNavigate={() => setOpened(false)} />}
        </nav>
        <div className="shrink-0 space-y-1 border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/75 hover:bg-white/10"
          >
            <TbExternalLink size={19} />
            Otwórz witrynę
          </Link>
          <button
            disabled={busy}
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-white/75 hover:bg-white/10 disabled:opacity-50"
          >
            <TbLogout size={19} />
            {busy ? "Wylogowywanie…" : "Wyloguj"}
          </button>
        </div>
      </aside>
      <button
        type="button"
        onClick={() => setOpened((v) => !v)}
        aria-label={opened ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={opened}
        className="fixed right-4 top-4 z-[60] inline-flex size-11 items-center justify-center rounded-xl border border-[#d9dccf] bg-white text-[#18281e] shadow-md lg:hidden"
      >
        {opened ? <TbX size={24} /> : <TbMenu2 size={24} />}
      </button>
      <div className="flex min-h-dvh flex-col">
        <div className="mx-auto w-full max-w-[1700px] flex-1 px-5 pb-9 pt-20 md:px-9 lg:py-12 3xl:max-w-[2300px] 3xl:px-14">
          {children}
        </div>
      </div>
    </div>
  );
}
