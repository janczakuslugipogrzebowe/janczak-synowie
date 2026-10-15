import {revalidatePath,revalidateTag} from "next/cache";
import {getAdminUid,isAdminConfigured} from "@/lib/admin/session";
import {isSameOrigin} from "@/lib/admin/origin";
import {getAdminHomeAboutState,writeHomeAbout} from "@/lib/home-about/data";
import {HomeAboutValidationError,parseHomeAbout} from "@/lib/home-about/schema";

const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
const authorize=async()=>isAdminConfigured()?getAdminUid():null;
export async function GET(){
 const uid=await authorize();if(!uid)return reply({error:"Brak dostępu do panelu."},401);
 try{return reply(await getAdminHomeAboutState());}catch{return reply({error:"Nie udało się pobrać sekcji."},500);}
}
async function save(request:Request,publish:boolean){
 if(!isSameOrigin(request))return reply({error:"Niedozwolone pochodzenie żądania."},403);
 const uid=await authorize();if(!uid)return reply({error:"Brak dostępu do panelu."},401);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Wymagany JSON."},415);
 try{const raw=await request.text();if(raw.length>10000)return reply({error:"Formularz przekracza dopuszczalny rozmiar."},413);
  const content=parseHomeAbout(JSON.parse(raw));await writeHomeAbout(content,uid,publish);
  if(publish){revalidateTag("janczak-home-about",{expire:0});revalidatePath("/");}
  return reply({ok:true,published:publish});
 }catch(error){if(error instanceof HomeAboutValidationError||error instanceof SyntaxError)return reply({error:error.message},400);
  return reply({error:"Nie udało się zapisać zmian."},500);}
}
export async function PUT(req:Request){return save(req,false);}
export async function POST(req:Request){return save(req,true);}
