import Link from "next/link";
export default function AlbumNotFound() {
  return (
    <main id="main" className="min-h-[70dvh] bg-[#f8f4ec] px-6 pb-20 pt-40 text-center">
      <h1 className="font-display text-5xl text-[#182a20]">Nie znaleziono albumu</h1>
      <p className="mt-5 text-[#647166]">Album nie istnieje lub nie jest opublikowany.</p>
      <Link
        href="/galeria"
        className="mt-7 inline-flex rounded-full bg-[#e4c894] px-6 py-3 font-semibold text-[#1a2b20]"
      >
        Wróć do galerii
      </Link>
    </main>
  );
}
