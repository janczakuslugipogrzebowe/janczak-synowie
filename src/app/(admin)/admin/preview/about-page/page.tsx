import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import { getPublishedSiteSettings } from "@/lib/settings/data";
import AboutPreviewReceiver from "@/components/admin/about-page-preview-receiver";

async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <AboutPreviewReceiver settings={await getPublishedSiteSettings()} />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#f8f4ec]" />}>
      <Authorized />
    </Suspense>
  );
}
