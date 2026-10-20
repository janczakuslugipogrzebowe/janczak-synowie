import Image from "next/image";
import Link from "next/link";
import type { SubpageBlock } from "@/lib/subpages/schema";
import SubpageContainer from "./subpage-container";
export default function SubpageHero({ data, preview = false }: { data: SubpageBlock; preview?: boolean }) {
  return (
    <section
      aria-label="Wprowadzenie"
      className={`relative isolate overflow-hidden bg-[#15241c] text-[#faf5ed] ${preview ? "min-h-[400px]" : "min-h-[clamp(420px,40vw,620px)]"}`}
    >
      {data.imageUrl && (
        <Image
          src={data.imageUrl}
          alt=""
          fill
          priority={!preview}
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#07120e]/95 via-[#0b1712]/75 to-[#0c1913]/20"
        style={{ opacity: data.overlay / 100 + 0.08 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#091510]/45 via-transparent to-[#091510]/10"
      />
      <SubpageContainer
        className={`flex flex-col justify-end ${preview ? "min-h-[400px] py-14" : "min-h-[clamp(420px,40vw,620px)] pb-[clamp(4rem,7vw,7rem)] pt-28"}`}
      >
        <nav
          aria-label="Okruszki"
          className="mb-6 flex items-center gap-3 text-[clamp(.7rem,.78vw,.83rem)] font-semibold uppercase tracking-[.20em] text-[#E6C991]"
        >
          <span aria-hidden="true" className="mr-1 h-px w-9 bg-[#E6C991]" />
          <Link className="cursor-pointer transition hover:text-white" href="/">
            Strona główna
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{data.title}</span>
        </nav>
        <h1
          className="max-w-5xl font-display font-medium leading-[.98] tracking-[-.045em]"
          style={{
            fontSize: `clamp(3.7rem, ${(6.2 * data.headingScale) / 100}vw, ${(7.8 * data.headingScale) / 100}rem)`,
          }}
        >
          {data.title}
        </h1>
        <p className="mt-7 max-w-[760px] text-[clamp(1.05rem,1.33vw,1.35rem)] leading-[1.75] text-[#f2efea]/95">
          {data.description}
        </p>
      </SubpageContainer>
    </section>
  );
}
