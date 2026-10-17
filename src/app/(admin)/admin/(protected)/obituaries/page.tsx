import type { Metadata } from "next";
import ObituariesManager from "@/components/admin/obituaries-manager";
export const metadata: Metadata = { title: "Nekrologi – zarządzanie" };
export default function ObituariesPage() {
  return <ObituariesManager />;
}
