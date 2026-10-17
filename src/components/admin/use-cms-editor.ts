"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import {notify} from "@/components/ui/toast-provider";
export type EditorPhase="loading"|"ready"|"error";
export function useCmsEditor<T extends object>(endpoint:string,defaults:T,parse:(v:unknown)=>T){
 const [draft,setDraft]=useState<T>(defaults),[saved,setSaved]=useState<T>(defaults),[published,setPublished]=useState<T>(defaults);
 const [phase,setPhase]=useState<EditorPhase>("loading"),[error,setError]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{const ac=new AbortController();let disposed=false;const timeout=setTimeout(()=>ac.abort(),15000);
  async function load(){setPhase("loading");setError("");setMessage("");try{const r=await fetch(endpoint,{credentials:"same-origin",cache:"no-store",signal:ac.signal});const p=await r.json();if(!r.ok)throw new Error(p.error??"Nie udało się wczytać danych.");if(disposed)return;const live=parse(p.published??defaults),edit=p.draft?parse(p.draft):live;setPublished(live);setSaved(edit);setDraft(edit);setPhase("ready");}catch(e){if(!disposed){setPhase("error");setError(ac.signal.aborted?"Przekroczono czas oczekiwania.":e instanceof Error?e.message:"Błąd pobierania.");}}finally{clearTimeout(timeout);}}
  void load();return()=>{disposed=true;ac.abort();clearTimeout(timeout);};
 },[endpoint,defaults,parse,retry]);
 const unsaved=useMemo(()=>JSON.stringify(draft)!==JSON.stringify(saved),[draft,saved]);
 const unpublished=useMemo(()=>JSON.stringify(draft)!==JSON.stringify(published),[draft,published]);
 const update=useCallback(<K extends keyof T>(key:K,value:T[K])=>{setDraft(prev=>({...prev,[key]:value}));setMessage("");},[]);
 async function save(publish:boolean){if(busy||phase!=="ready")return;setBusy(true);setMessage("");try{const validated=parse(draft);const r=await fetch(endpoint,{method:publish?"POST":"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(validated),signal:AbortSignal.timeout(20000)});const p=await r.json();if(!r.ok)throw new Error(p.error??"Zapis nie powiódł się.");setDraft(validated);setSaved(validated);if(publish)setPublished(validated);notify.success(publish?"Zmiany opublikowane":"Szkic zapisany",publish?"Zmiany są widoczne na stronie.":"Zmiany nie są jeszcze opublikowane.");}catch(e){notify.error("Nie udało się zapisać zmian",e instanceof Error?e.message:"Błąd zapisu.");}finally{setBusy(false);}}
 return{draft,phase,error,message,busy,unsaved,unpublished,update,save,retry:()=>setRetry(v=>v+1)};
}
