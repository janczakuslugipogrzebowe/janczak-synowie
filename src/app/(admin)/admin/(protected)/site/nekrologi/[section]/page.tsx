"use client";
import { useParams } from "next/navigation";
import {
  ObituariesSharedEditor,
  ObituariesListingEditor,
  ObituariesInformationEditor,
} from "@/components/admin/obituaries-page-editor";
export default function ObituariesSectionEditor() {
  const { section } = useParams<{ section: string }>();
  switch (section) {
    case "hero":
    case "bottom":
      return <ObituariesSharedEditor section={section} />;
    case "listing":
      return <ObituariesListingEditor />;
    case "information":
      return <ObituariesInformationEditor />;
    default:
      return (
        <main id="main">
          <p>Nie znaleziono sekcji.</p>
        </main>
      );
  }
}
