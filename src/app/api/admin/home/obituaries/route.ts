import {revalidatePath,revalidateTag} from "next/cache";
import {getAdminUid,isAdminConfigured} from "@/lib/admin/session";
import {isSameOrigin} from "@/lib/admin/origin";
import {getHomeObituariesAdminState,saveHomeObituaries} from "@/lib/home-obituaries/data";
import {HomeObituariesValidationError,parseHomeObituaries} from "@/lib/home-obituaries/schema";
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(){const uid=isAdminConfigured()?await getAdminUid():null;if(!uid)return reply({error:"Brak dostępu."},401);try{return reply(await getHomeObituariesAdminState());}catch{return reply({error:"Nie udało się odczytać sekcji."},500);}}
async function save(request:Request,publish:boolean){if(!isSameOrigin(request))return reply({error:"Niedozwolone pochodzenie."},403);const uid=isAdminConfigured()?await getAdminUid():null;if(!uid)return reply({error:"Brak dostępu."},401);if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Wymagany JSON."},415);
 try{const body=await request.text();if(body.length>6000)return reply({error:"Zbyt duży formularz."},413);const content=parseHomeObituaries(JSON.parse(body));await saveHomeObituaries(content,uid,publish);if(publish){revalidateTag("janczak-home-obituaries",{expire:0});revalidatePath("/");}return reply({ok:true});}
 catch(e){if(e instanceof HomeObituariesValidationError||e instanceof SyntaxError)return reply({error:e.message},400);return reply({error:"Zapis nie powiódł się."},500);}}
export async function PUT(r:Request){return save(r,false);}export async function POST(r:Request){return save(r,true);}
