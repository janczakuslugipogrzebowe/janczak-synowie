import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUid } from "@/lib/admin/session";
import AdminShell from "@/components/admin/admin-shell";

async function Authenticated({ children }: { children: React.ReactNode }) {
  const uid = await getAdminUid();
  if (!uid) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-[#58665b]" role="status">
          Sprawdzanie dostępu…
        </div>
      }
    >
      <Authenticated>{children}</Authenticated>
    </Suspense>
  );
}
