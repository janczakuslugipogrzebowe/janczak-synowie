import {revalidatePath,revalidateTag} from "next/cache";
import {getAdminUid,isAdminConfigured} from "@/lib/admin/session";
import {isSameOrigin} from "@/lib/admin/origin";
import {changeObituaryStatus,deleteObituaryPermanently,getAdminObituary,getAdminObituaryDraft,repairObituarySlug,updateObituary} from "@/lib/obituaries/data";
import {ObituaryValidationError,isSafeId,parseObituaryInput} from "@/lib/obituaries/schema";
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const auth=async()=>isAdminConfigured()?getAdminUid():null;
type Ctx={params:Promise<{id:string}>};
function invalidate(slug:string){revalidateTag("janczak-obituaries",{expire:0});revalidatePath("/");revalidatePath("/nekrologi");revalidatePath(`/nekrologi/${slug}`);}
export async function GET(_:Request,{params}:Ctx){const{id}=await params;if(!isSafeId(id))return reply({error:"Nie znaleziono."},404);if(!await auth())return reply({error:"Brak dostępu."},401);try{const record=await getAdminObituary(id);return record?reply({record,draft:await getAdminObituaryDraft(id)}):reply({error:"Nie znaleziono."},404);}catch{return reply({error:"Błąd pobierania."},500);}}
export async function PUT(request:Request,{params}:Ctx){const{id}=await params;if(!isSafeId(id))return reply({error:"Nie znaleziono."},404);if(!isSameOrigin(request))return reply({error:"Niedozwolone pochodzenie."},403);const uid=await auth();if(!uid)return reply({error:"Brak dostępu."},401);if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Wymagany JSON."},415);
 try{const text=await request.text();if(text.length>14000)return reply({error:"Zbyt duży formularz."},413);const body=JSON.parse(text) as {data:unknown;publish:unknown};if(typeof body.publish!=="boolean")return reply({error:"Nieprawidłowy tryb zapisu."},400);
   const prev=await getAdminObituary(id);if(!prev)return reply({error:"Nie znaleziono."},404);const updated=await updateObituary(id,parseObituaryInput(body.data),uid,body.publish);invalidate(prev.slug);if(updated.slug!==prev.slug)invalidate(updated.slug);return reply({ok:true,id,slug:updated.slug});}
 catch(e){if(e instanceof ObituaryValidationError||e instanceof SyntaxError)return reply({error:e.message},400);return reply({error:"Nie udało się zapisać nekrologu."},500);}}
export async function PATCH(request:Request,{params}:Ctx){const{id}=await params;if(!isSafeId(id))return reply({error:"Nie znaleziono."},404);if(!isSameOrigin(request))return reply({error:"Niedozwolone pochodzenie."},403);const uid=await auth();if(!uid)return reply({error:"Brak dostępu."},401);if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Wymagany JSON."},415);
 try{const text=await request.text();if(text.length>1000)return reply({error:"Zbyt duże żądanie."},413);const body=JSON.parse(text) as {action:string};if(!["publish","unpublish","archive","trash","restore","repair-slug"].includes(body.action))return reply({error:"Nieznana operacja."},400);
   const prev=await getAdminObituary(id);if(!prev)return reply({error:"Nie znaleziono."},404);
   let newSlug=prev.slug;
   if(body.action==="repair-slug"){
     newSlug=(await repairObituarySlug(id,uid)).slug;
   }else if(body.action==="publish"){
     const draft=await getAdminObituaryDraft(id);
     if(draft)newSlug=(await updateObituary(id,draft,uid,true)).slug;
     else await changeObituaryStatus(id,"publish",uid);
   }else await changeObituaryStatus(id,body.action as "unpublish"|"archive"|"trash"|"restore",uid);
   invalidate(prev.slug);if(newSlug!==prev.slug)invalidate(newSlug);
   return reply({ok:true,slug:newSlug});}
 catch(e){if(e instanceof ObituaryValidationError||e instanceof SyntaxError)return reply({error:e.message},400);return reply({error:"Operacja nie powiodła się."},500);}}

export async function DELETE(request:Request,{params}:Ctx){
  const{id}=await params;if(!isSafeId(id))return reply({error:"Nie znaleziono."},404);
  if(!isSameOrigin(request))return reply({error:"Niedozwolone pochodzenie."},403);
  if(!await auth())return reply({error:"Brak dostępu."},401);
  try{const current=await getAdminObituary(id);if(!current)return reply({error:"Nie znaleziono."},404);
    await deleteObituaryPermanently(id);invalidate(current.slug);return reply({ok:true});
  }catch(e){if(e instanceof ObituaryValidationError)return reply({error:e.message},400);return reply({error:"Nie udało się trwale usunąć wpisu."},500);}
}
