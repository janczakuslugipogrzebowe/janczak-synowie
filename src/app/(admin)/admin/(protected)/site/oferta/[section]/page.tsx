"use client";
import { useParams } from "next/navigation";
import { OfferSharedEditor, OfferIntroEditor, OfferCatalogEditor, OfferFormalitiesEditor, OfferProcessEditor, OfferFloristEditor } from "@/components/admin/offer-page-editor";
export default function OfferEditorSectionPage() {
  const { section } = useParams<{ section: string }>();
  switch (section) {
    case "hero": case "bottom": return <OfferSharedEditor section={section}/>;
    case "intro": return <OfferIntroEditor/>;
    case "catalog": return <OfferCatalogEditor/>;
    case "formalities": return <OfferFormalitiesEditor/>;
    case "process": return <OfferProcessEditor/>;
    case "florist": return <OfferFloristEditor/>;
    default: return <main id="main"><p>Nie znaleziono sekcji.</p></main>;
  }
}
