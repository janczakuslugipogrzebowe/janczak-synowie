import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import DocumentsPreviewReceiver from "@/components/admin/documents-preview-receiver";

async function AuthorizedPreview() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <DocumentsPreviewReceiver />;
}
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-forest-deep" />}>
      <AuthorizedPreview />
    </Suspense>
  );
}
