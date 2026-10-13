"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Strona główna" },
  { href: "/o-nas", label: "O nas" },
  { href: "/oferta", label: "Oferta" },
  { href: "/nekrologi", label: "Nekrologi" },
  { href: "/dokumenty", label: "Dokumenty" },
  { href: "/galeria", label: "Galeria" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="js-header">
      <div className="js-header-inner">
        <Link href="/" className="js-brand" onClick={() => setMenuOpen(false)} aria-label="Janczak i Synowie – strona główna">
          <span className="js-brand-title">Janczak i Synowie</span>
          <span className="js-brand-subtitle">USŁUGI POGRZEBOWE</span>
        </Link>

        <nav className="js-nav" aria-label="Nawigacja główna">
          {links.slice(0, 6).map(({ href, label }) => (
            <Link key={href} href={href} className="js-nav-link" aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/kontakt" className="js-contact" aria-current={pathname === "/kontakt" ? "page" : undefined}>
          Kontakt <span className="js-contact-arrow" aria-hidden="true">↗</span>
        </Link>

        <button
          type="button"
          className="js-menu-toggle"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={menuOpen}
          aria-controls="js-mobile-navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <nav id="js-mobile-navigation" className="js-mobile-nav" data-open={menuOpen ? "true" : "false"} aria-label="Nawigacja mobilna">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className="js-mobile-link" aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
