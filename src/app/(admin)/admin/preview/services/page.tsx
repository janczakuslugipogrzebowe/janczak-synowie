import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import ServicesPreviewReceiver from "@/components/admin/services-preview-receiver";
async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <ServicesPreviewReceiver />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-ivory" />}>
      <Authorized />
    </Suspense>
  );
}
