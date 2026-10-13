import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";

export const metadata: Metadata = { title: "Nekrologi" };

export default function Page() {
  return <SubpageIntro title="Nekrologi" description="Tutaj pojawią się aktualne nekrologi oraz informacje o uroczystościach pożegnalnych." />;
}
