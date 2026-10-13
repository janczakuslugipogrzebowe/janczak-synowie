import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "Kontakt" };

export default function Page() {
  return <SubpageIntro title="Kontakt" description="Dane kontaktowe, lokalizacja i możliwości kontaktu pojawią się tutaj wkrótce." />;
}
