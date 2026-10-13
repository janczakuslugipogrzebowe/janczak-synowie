import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "Galeria" };

export default function Page() {
  return <SubpageIntro title="Galeria" description="Przygotowujemy galerię zdjęć prezentujących naszą firmę i jej otoczenie." />;
}
