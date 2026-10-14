import type { ReactNode } from "react";

export const fieldClass = "w-full min-h-11 rounded-lg border border-[#dcded6] bg-white px-3.5 py-2.5 text-sm text-[#1f2923] outline-none transition-colors focus:border-[#9d8662] focus:ring-2 focus:ring-[#b49a71]/20 placeholder:text-[#a0a69e]";
export const subtleButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#dcded6] bg-white px-4 py-2 text-sm font-semibold text-[#38483e] transition-colors hover:bg-[#eeede8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8662] disabled:cursor-not-allowed disabled:opacity-45";
export const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#1b3027] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d483a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8662] disabled:cursor-not-allowed disabled:opacity-45";
export const surfaceClass = "rounded-2xl border border-[#e6e4dc] bg-white shadow-[0_12px_55px_-38px_rgba(23,33,25,0.25)]";

export function Field({ label, children, hint }: {label:string;children:ReactNode;hint?:string}) {
  return <label className="block space-y-1.5"><span className="block text-xs font-semibold text-[#425046]">{label}</span>{children}{hint && <span className="block text-xs leading-relaxed text-[#728076]">{hint}</span>}</label>;
}
export function PageHeading({ eyebrow, title, description, children }: {eyebrow:string;title:string;description?:string;children?:ReactNode}) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#987b52]">{eyebrow}</p><h1 className="font-display text-[clamp(2.5rem,3.5vw,4rem)] leading-none font-medium tracking-[-.035em] text-[#1a2820]">{title}</h1>{description && <p className="mt-2 text-sm text-[#6d756d]">{description}</p>}</div>{children}</div>;
}
