import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import FloristPreviewReceiver from "@/components/admin/florist-preview-receiver";
async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <FloristPreviewReceiver />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-ivory" />}>
      <Authorized />
    </Suspense>
  );
}
