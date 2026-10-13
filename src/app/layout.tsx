import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import { siteStyles } from "@/lib/site-styles";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Janczak i Synowie | Usługi Pogrzebowe",
    template: "%s | Janczak i Synowie",
  },
  description: "Janczak i Synowie – rodzinna firma pogrzebowa z Żelazkowa. Nowa witryna w przygotowaniu.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <head>
        <style id="janczak-critical-styles" dangerouslySetInnerHTML={{ __html: siteStyles }} />
      </head>
      <body>
        <a className="js-skip" href="#main">Przejdź do treści</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
