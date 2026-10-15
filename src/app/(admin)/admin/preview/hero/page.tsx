import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import HeroPreviewReceiver from "@/components/admin/hero-preview-receiver";

async function AuthorizedHeroPreview() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <HeroPreviewReceiver />;
}

export default function HeroPreviewPage() {
  return (
    <Suspense fallback={<main id="main" className="min-h-svh bg-forest-deep" />}>
      <AuthorizedHeroPreview />
    </Suspense>
  );
}
