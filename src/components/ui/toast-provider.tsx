"use client";

import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import {motion,useReducedMotion} from "motion/react";
import {createPortal} from "react-dom";
import {TbAlertCircle,TbAlertTriangle,TbCheck,TbInfoCircle,TbX} from "react-icons/tb";

type ToastKind="success"|"error"|"info"|"warning";
type ToastPayload={kind:ToastKind;title:string;description?:string};
type ToastItem=ToastPayload&{id:number};
const EVENT="janczak:toast";

// useSyncExternalStore guarantees the same snapshot on the server and during
// the initial hydration pass. The portal is mounted only after hydration.
// Unlike a render-time typeof document check, this cannot alter the first HTML tree.
const subscribeToHydration=()=>()=>{};
const getClientSnapshot=()=>true;
const getServerSnapshot=()=>false;

// Can be called from any client-side component without mounting duplicate providers.
function publish(kind:ToastKind,title:string,description?:string){
 if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT,{detail:{kind,title,description}}));
}
export const notify={
 success:(title:string,description?:string)=>publish("success",title,description),
 error:(title:string,description?:string)=>publish("error",title,description),
 info:(title:string,description?:string)=>publish("info",title,description),
 warning:(title:string,description?:string)=>publish("warning",title,description),
};
const appearances={
 success:{Icon:TbCheck,background:"bg-[#e9f2e9]",foreground:"text-[#286141]"},
 error:{Icon:TbAlertCircle,background:"bg-[#f9eae6]",foreground:"text-[#ae4535]"},
 warning:{Icon:TbAlertTriangle,background:"bg-[#fbf2df]",foreground:"text-[#926f2d]"},
 info:{Icon:TbInfoCircle,background:"bg-[#e9efed]",foreground:"text-[#46685d]"},
};
export function ToastProvider({children}:{children:React.ReactNode}){
 const [toasts,setToasts]=useState<ToastItem[]>([]);
 const ids=useRef(0);
 const reduceMotion=useReducedMotion();
 const hasHydrated=useSyncExternalStore(subscribeToHydration,getClientSnapshot,getServerSnapshot);
 useEffect(()=>{
  function incoming(event:Event){const payload=(event as CustomEvent<ToastPayload>).detail;
   if(!payload||!appearances[payload.kind]||!payload.title)return;
   setToasts(items=>[...items.slice(-3),{...payload,id:++ids.current}]);
  }
  window.addEventListener(EVENT,incoming);
  return()=>window.removeEventListener(EVENT,incoming);
 },[]);
 useEffect(()=>{
  const timers=toasts.filter(t=>t.kind!=="error").map(t=>window.setTimeout(()=>setToasts(items=>items.filter(i=>i.id!==t.id)),t.kind==="success"?4500:6500));
  return()=>timers.forEach(clearTimeout);
 },[toasts]);
 return <>{children}{hasHydrated&&createPortal(
  <div aria-label="Powiadomienia" className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(390px,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:top-6">
   {toasts.map(t=>{const style=appearances[t.kind];const Icon=style.Icon;return <motion.div key={t.id} initial={reduceMotion?false:{opacity:0,x:22,y:-8}} animate={{opacity:1,x:0,y:0}} transition={{duration:reduceMotion?0:.24}} role={t.kind==="error"?"alert":"status"} aria-live={t.kind==="error"?"assertive":"polite"} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#e7e3da] bg-[#fffdf9] px-4 py-3.5 text-[#1b3027] shadow-[0_16px_48px_-19px_rgba(12,27,19,.3)]">
    <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${style.background} ${style.foreground}`}><Icon size={20}/></span>
    <div className="min-w-0 flex-1"><p className="text-sm font-semibold leading-snug">{t.title}</p>{t.description&&<p className="mt-1 text-xs leading-relaxed text-[#6a756b]">{t.description}</p>}</div>
    <button type="button" aria-label="Zamknij powiadomienie" onClick={()=>setToasts(items=>items.filter(i=>i.id!==t.id))} className="-mr-1 -mt-1 rounded-lg p-2 text-[#809086] transition hover:bg-[#f2f0e9] hover:text-[#1c3025] focus-visible:outline-2 focus-visible:outline-[#ad8b5b]"><TbX size={18}/></button>
   </motion.div>;})}
  </div>,document.body)}</>;
}
