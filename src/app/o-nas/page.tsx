import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "O nas" };

export default function Page() {
  return <SubpageIntro title="O nas" description="Poznaj historię naszej rodzinnej firmy. Przygotowujemy tę część serwisu." />;
}
