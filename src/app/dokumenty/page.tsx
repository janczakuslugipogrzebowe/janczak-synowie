import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "Dokumenty" };

export default function Page() {
  return <SubpageIntro title="Dokumenty" description="W tym miejscu udostępnimy formularze oraz przydatne dokumenty do pobrania." />;
}
