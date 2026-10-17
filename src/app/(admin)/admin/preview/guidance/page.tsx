import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import GuidancePreviewReceiver from "@/components/admin/guidance-preview-receiver";
async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <GuidancePreviewReceiver />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-forest-deep" />}>
      <Authorized />
    </Suspense>
  );
}
