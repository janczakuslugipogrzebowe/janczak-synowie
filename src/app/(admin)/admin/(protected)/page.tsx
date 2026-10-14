import Link from "next/link";
import type { Metadata } from "next";
import { TbArrowUpRight,TbBuildingEstate,TbFileText,TbLayoutGrid } from "react-icons/tb";
import { PageHeading, surfaceClass } from "@/components/ui/admin-fields";
export const metadata:Metadata={title:"Pulpit"};
const cards=[
 {href:"/admin/company",title:"Firma i kontakt",desc:"Dane firmy, telefony, adres oraz dokładny link do lokalizacji.",Icon:TbBuildingEstate},
 {href:"/admin/obituaries",title:"Nekrologi",desc:"Oddzielny moduł zarządzania nekrologami.",Icon:TbFileText},
 {href:"/admin/site",title:"Edytor witryny",desc:"Podstrony, sekcje, treści i ich podgląd przed publikacją.",Icon:TbLayoutGrid},
];
export default function AdminHome(){return <main id="main"><PageHeading eyebrow="Zarządzanie serwisem" title="Panel główny"/><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map(({href,title,desc,Icon})=><Link key={href} href={href} className={`${surfaceClass} group flex min-h-[230px] flex-col p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl`}><Icon className="mb-7 size-9 text-[#9f8056]" strokeWidth={1.4}/><h2 className="font-display text-[34px] font-semibold leading-none">{title}</h2><p className="mt-3 text-sm leading-relaxed text-[#6c766f]">{desc}</p><TbArrowUpRight className="mt-auto self-end text-[#a08358]" size={23}/></Link>)}</div></main>}
