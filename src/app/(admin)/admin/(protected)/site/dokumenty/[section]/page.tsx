"use client";
import { useParams } from "next/navigation";
import {
  DocumentsDownloadsEditor,
  DocumentsGuidanceEditor,
  DocumentsSharedSectionEditor,
} from "@/components/admin/documents-page-editor";

export default function DocumentsSectionPage() {
  const { section } = useParams<{ section: string }>();
  switch (section) {
    case "hero":
    case "bottom":
      return <DocumentsSharedSectionEditor section={section} />;
    case "downloads":
      return <DocumentsDownloadsEditor />;
    case "guidance":
      return <DocumentsGuidanceEditor />;
    default:
      return (
        <main id="main">
          <p>Nie znaleziono sekcji.</p>
        </main>
      );
  }
}
