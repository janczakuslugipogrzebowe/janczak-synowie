import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import GalleryPreviewReceiver from "@/components/admin/gallery-preview-receiver";
async function Authorized() {
  if (!(await getAdminUid())) redirect("/admin/login");
  return <GalleryPreviewReceiver />;
}
export default function GalleryPreview() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-ivory" />}>
      <Authorized />
    </Suspense>
  );
}
