import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import FaqPreviewReceiver from "@/components/admin/faq-preview-receiver";

async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <FaqPreviewReceiver />;
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#14241c]" />}>
      <Authorized />
    </Suspense>
  );
}
