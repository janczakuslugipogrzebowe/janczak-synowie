"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { TbBuildingEstate, TbExternalLink, TbLogout, TbMenu2, TbX, TbLayoutDashboard, TbFileText, TbLayoutGrid } from "react-icons/tb";

const nav = [
  {href:"/admin",label:"Pulpit",Icon:TbLayoutDashboard},
  {href:"/admin/company",label:"Firma i kontakt",Icon:TbBuildingEstate},
  {href:"/admin/obituaries",label:"Nekrologi",Icon:TbFileText},
  {href:"/admin/site",label:"Edytor witryny",Icon:TbLayoutGrid},
];
export default function AdminShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname(),router=useRouter();
  const [opened,setOpened]=useState(false),[busy,setBusy]=useState(false);
  async function logout(){
    if(busy)return;setBusy(true);
    try { const r=await fetch("/api/admin/session/logout",{method:"POST",credentials:"same-origin"});if(!r.ok)throw new Error();await signOut(auth);router.replace("/admin/login");router.refresh(); }
    catch { alert("Nie udało się wylogować. Spróbuj ponownie."); }finally{setBusy(false);}
  }
  return <div className="min-h-dvh lg:pl-[270px] 3xl:pl-[320px]">
    {opened && <button aria-label="Zamknij nawigację" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={()=>setOpened(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#14241c] text-white transition-transform lg:translate-x-0 3xl:w-[320px] ${opened?"translate-x-0":"-translate-x-full"}`}>
      <Link href="/admin" className="border-b border-white/10 px-7 py-8" onClick={()=>setOpened(false)}><span className="block font-display text-[29px] font-semibold leading-none">Janczak i Synowie</span><span className="mt-2 block text-[9px] font-bold uppercase tracking-[.27em] text-champagne">Panel administracyjny</span></Link>
      <nav className="flex-1 space-y-1 p-4" aria-label="Panel administracyjny">
        {nav.map(({href,label,Icon})=>{const active=pathname===href || (href!=="/admin" && pathname.startsWith(href+"/"));return <Link key={href} href={href} onClick={()=>setOpened(false)} aria-current={active?"page":undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${active?"bg-[#e3c997]/15 text-champagne":"text-white/75 hover:bg-white/10 hover:text-white"}`}><Icon className="size-5 shrink-0" strokeWidth={1.7}/>{label}</Link>;})}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-4">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/75 hover:bg-white/10"><TbExternalLink size={19}/>Otwórz witrynę</Link>
        <button disabled={busy} onClick={()=>void logout()} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-white/75 hover:bg-white/10 disabled:opacity-50"><TbLogout size={19}/>{busy?"Wylogowywanie…":"Wyloguj"}</button>
      </div>
    </aside>
    <button type="button" onClick={()=>setOpened(v=>!v)} aria-label={opened?"Zamknij menu":"Otwórz menu"} aria-expanded={opened} className="fixed right-4 top-4 z-[60] inline-flex size-11 items-center justify-center rounded-xl border border-[#d9dccf] bg-white text-[#18281e] shadow-md lg:hidden">
      {opened?<TbX size={24}/>:<TbMenu2 size={24}/>}
    </button>
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-[1700px] flex-1 px-5 pb-9 pt-20 md:px-9 lg:py-12 3xl:max-w-[2300px] 3xl:px-14">{children}</div>
    </div>
  </div>;
}
