import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import { getLatestObituaries } from "@/lib/obituaries/data";
import ObituariesPreviewReceiver from "@/components/admin/obituaries-preview-receiver";
async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  const entries = await getLatestObituaries();
  return <ObituariesPreviewReceiver entries={entries} />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-ivory" />}>
      <Authorized />
    </Suspense>
  );
}
