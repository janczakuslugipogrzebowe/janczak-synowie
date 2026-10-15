import {Suspense} from "react";
import {redirect} from "next/navigation";
import {getAdminUid} from "@/lib/admin/session";
import AboutPreviewReceiver from "@/components/admin/about-preview-receiver";
async function Authorized(){if(!(await getAdminUid()))redirect("/admin/login");return <AboutPreviewReceiver/>;}
export default function Page(){return <Suspense fallback={<main className="min-h-dvh bg-[#14241c]"/>}><Authorized/></Suspense>;}
