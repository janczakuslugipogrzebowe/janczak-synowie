import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "Oferta" };

export default function Page() {
  return <SubpageIntro title="Oferta" description="Wkrótce przedstawimy pełen zakres usług pogrzebowych i wsparcia dla rodzin." />;
}
