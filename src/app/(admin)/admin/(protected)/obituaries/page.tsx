import type { Metadata } from "next";
import { TbFileText } from "react-icons/tb";
import { PageHeading, surfaceClass } from "@/components/ui/admin-fields";
export const metadata:Metadata={title:"Nekrologi"};
export default function Obituaries(){return <main id="main"><PageHeading eyebrow="Moduł administracyjny" title="Nekrologi"/><div className={`${surfaceClass} flex min-h-[300px] flex-col items-center justify-center p-10 text-center`}><TbFileText size={40} strokeWidth={1.4} className="mb-5 text-[#b49a71]"/><h2 className="font-display text-4xl font-semibold">Moduł w przygotowaniu</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6b766c]">Zarządzanie nekrologami wdrożymy jako osobną funkcję po ukończeniu edytora witryny.</p></div></main>}
