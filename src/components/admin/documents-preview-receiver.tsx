"use client";

import { useEffect, useState } from "react";
import HomeDocumentsSection from "@/components/home-documents/home-documents-section";
import {
  DEFAULT_HOME_DOCUMENTS,
  parseHomeDocuments,
  type HomeDocumentsContent,
} from "@/lib/home-documents/schema";
import { DEFAULT_DOCUMENTS, parseDocumentLibrary, type PublicDocument } from "@/lib/documents/schema";

const CHANGE = "janczak:home-documents-preview:v1";
const READY = "janczak:home-documents-preview:ready:v1";

export default function DocumentsPreviewReceiver() {
  const [content, setContent] = useState<HomeDocumentsContent>(DEFAULT_HOME_DOCUMENTS);
  const [documents, setDocuments] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setContent(parseHomeDocuments(event.data.content));
        setDocuments(parseDocumentLibrary(event.data.documents));
      } catch {
        /* Invalid intermediate drafts must not break the preview. */
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-forest-deep">
      <HomeDocumentsSection data={content} documents={documents} preview />
    </main>
  );
}
