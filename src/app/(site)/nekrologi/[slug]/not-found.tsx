import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-[75dvh] bg-ivory px-5 pt-44 text-center">
      <h1 className="font-display text-5xl text-forest-deep">Nie znaleziono nekrologu</h1>
      <p className="mt-5 text-sm text-[#5b675e]">Wpis może być nieopublikowany lub niedostępny.</p>
      <Link
        className="mt-8 inline-flex rounded-full bg-champagne px-6 py-3 font-semibold text-forest-deep"
        href="/nekrologi"
      >
        Wróć do nekrologów
      </Link>
    </main>
  );
}
