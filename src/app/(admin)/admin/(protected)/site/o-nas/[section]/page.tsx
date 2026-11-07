"use client";
import { useParams } from "next/navigation";
import {
  AboutSharedEditor,
  AboutHistoryEditor,
  AboutPeopleEditor,
  AboutValuesEditor,
  AboutVillageEditor,
} from "@/components/admin/about-page-editor";

export default function AboutSectionPage() {
  const { section } = useParams<{ section: string }>();
  switch (section) {
    case "hero":
    case "bottom":
      return <AboutSharedEditor section={section} />;
    case "history":
      return <AboutHistoryEditor />;
    case "people":
      return <AboutPeopleEditor />;
    case "values":
      return <AboutValuesEditor />;
    case "village":
      return <AboutVillageEditor />;
    default:
      return (
        <main id="main">
          <p>Nie znaleziono sekcji.</p>
        </main>
      );
  }
}
