import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import { getPublishedSiteSettings } from "@/lib/settings/data";
import ContactPreviewReceiver from "@/components/admin/contact-preview-receiver";

async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  const settings = await getPublishedSiteSettings();
  return <ContactPreviewReceiver settings={settings} />;
}

export default function Page() {
  return <Suspense fallback={<main className="min-h-dvh bg-[#14241c]" />}><Authorized /></Suspense>;
}
