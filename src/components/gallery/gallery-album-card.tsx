import Image from "next/image";
import Link from "next/link";
import { TbArrowUpRight } from "react-icons/tb";
import type { GalleryAlbum } from "@/lib/gallery/albums";
export default function GalleryAlbumCard({ album, count }: { album: GalleryAlbum; count: number }) {
  return (
    <Link
      href={`/galeria/${album.slug}`}
      className="group relative isolate block aspect-[1.75/1] min-h-[245px] overflow-hidden rounded-[14px] border border-[#bca983]/35 bg-[#193027] shadow-[13px_17px_35px_-27px_rgba(29,30,20,.48)] outline-offset-4 transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#a88753]"
    >
      <Image
        src={album.coverUrl}
        alt=""
        fill
        sizes="(min-width:1000px) 44vw, 90vw"
        className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.055]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08120d]/90 via-[#0b1711]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[#fbf7ee] sm:p-8">
        <div>
          <h3 className="font-display text-[clamp(1.65rem,2.7vw,2.7rem)] leading-none">{album.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#f4ebdb]/85 sm:text-sm">
            {album.description}
          </p>
          <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[.17em] text-[#e2c58e]">
            {count} {count === 1 ? "zdjęcie" : count >= 2 && count <= 4 ? "zdjęcia" : "zdjęć"}
          </span>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#e3c690] text-[#e3c690] transition group-hover:bg-[#e3c690] group-hover:text-[#17261e]">
          <TbArrowUpRight size={22} />
        </span>
      </div>
    </Link>
  );
}
