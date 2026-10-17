import {revalidatePath,revalidateTag} from "next/cache";
import {getAdminUid,isAdminConfigured} from "@/lib/admin/session";
import {isSameOrigin} from "@/lib/admin/origin";
import {getAdminHomeFloristState,writeHomeFlorist} from "@/lib/home-florist/data";
import {HomeFloristValidationError,parseHomeFlorist} from "@/lib/home-florist/schema";

const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
const authorize=async()=>isAdminConfigured()?getAdminUid():null;
export async function GET(){
  const uid=await authorize();if(!uid)return response({error:"Brak dostępu do panelu."},401);
  try{return response(await getAdminHomeFloristState());}
  catch{return response({error:"Nie udało się pobrać danych kwiaciarni."},500);}
}
async function save(request:Request,publish:boolean){
  if(!isSameOrigin(request))return response({error:"Niedozwolone pochodzenie żądania."},403);
  const uid=await authorize();if(!uid)return response({error:"Brak dostępu do panelu."},401);
  if(!request.headers.get("content-type")?.startsWith("application/json"))return response({error:"Wymagany JSON."},415);
  try{
    const raw=await request.text();if(raw.length>16000)return response({error:"Przekroczono rozmiar formularza."},413);
    const content=parseHomeFlorist(JSON.parse(raw));
    await writeHomeFlorist(content,uid,publish);
    if(publish){revalidateTag("janczak-home-florist",{expire:0});revalidatePath("/");}
    return response({ok:true,published:publish});
  }catch(error){
    if(error instanceof HomeFloristValidationError||error instanceof SyntaxError)return response({error:error.message},400);
    return response({error:"Nie udało się zapisać danych kwiaciarni."},500);
  }
}
export async function PUT(request:Request){return save(request,false);}
export async function POST(request:Request){return save(request,true);}
