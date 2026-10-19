import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import { getPublishedSiteSettings } from "@/lib/settings/data";
import FooterPreviewReceiver from "@/components/admin/footer-preview-receiver";
import { getFooterCopyrightYear } from "@/lib/footer/year";

async function AuthorizedPreview() {
  if (!(await getAdminUid())) redirect("/admin/login");
  const [settings, copyrightYear] = await Promise.all([getPublishedSiteSettings(), getFooterCopyrightYear()]);
  return <FooterPreviewReceiver settings={settings} copyrightYear={copyrightYear} />;
}

export default function FooterPreview() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0f1c16]" />}>
      <AuthorizedPreview />
    </Suspense>
  );
}
