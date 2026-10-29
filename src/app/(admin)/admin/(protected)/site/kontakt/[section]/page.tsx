"use client";
import { useParams } from "next/navigation";
import {
  ContactSharedEditor,
  ContactDetailsEditor,
  ContactFormEditor,
} from "@/components/admin/contact-page-editor";
export default function ContactSectionPage() {
  const { section } = useParams<{ section: string }>();
  switch (section) {
    case "hero":
    case "bottom":
      return <ContactSharedEditor section={section} />;
    case "details":
      return <ContactDetailsEditor />;
    case "form":
      return <ContactFormEditor />;
    default:
      return (
        <main id="main">
          <p>Nie znaleziono sekcji.</p>
        </main>
      );
  }
}
