import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
export const metadata: Metadata = {
  title: { default: "Panel administracyjny", template: "%s | CMS Janczak i Synowie" },
  robots: { index: false, follow: false, noarchive: true },
};
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#f6f5f2] text-[#1f2923]">
        <a href="#main" className="sr-only fixed left-5 top-3 z-[100] bg-white px-4 py-2 focus:not-sr-only">
          Przejdź do treści panelu
        </a>
        {children}
      </div>
    </ToastProvider>
  );
}
