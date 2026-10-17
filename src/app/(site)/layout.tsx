import SiteHeader from "@/components/site-header";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only fixed left-5 top-3 z-[100] rounded bg-white px-4 py-3 text-forest focus:not-sr-only"
      >
        Przejdź do treści
      </a>
      <SiteHeader />
      {children}
    </>
  );
}
