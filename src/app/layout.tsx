import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Janczak i Synowie | Usługi Pogrzebowe", template: "%s | Janczak i Synowie" },
  description: "Janczak i Synowie – rodzinna firma pogrzebowa z Żelazkowa. Godna organizacja ceremonii i wsparcie bliskich.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl" className={`${display.variable} ${body.variable}`}><body className="bg-ivory font-sans text-forest-deep antialiased">{children}</body></html>;
}
