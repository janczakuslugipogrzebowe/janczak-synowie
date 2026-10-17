import type { Metadata } from "next";
import SubpageIntro from "@/components/subpage-intro";
import { getPublishedPage } from "@/lib/pages/data";
import { PAGE_LABELS } from "@/lib/pages/schema";

export const metadata: Metadata = { title: PAGE_LABELS["kontakt"] };
export default async function Page() {
  const content = await getPublishedPage("kontakt");
  return <SubpageIntro content={content} />;
}
