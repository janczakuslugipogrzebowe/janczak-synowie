"use client";
import {useEffect,useId,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {TbAlertTriangle,TbArchive,TbCheck,TbTrash,TbX} from "react-icons/tb";
import {primaryButton,subtleButton} from "@/components/ui/admin-fields";

type Props={open:boolean;title:string;description:string;confirmLabel:string;onCancel:()=>void;onConfirm:()=>Promise<void>|void;busy?:boolean;destructive?:boolean;requireText?:string};
export function ConfirmDialog({open,title,description,confirmLabel,onCancel,onConfirm,busy=false,destructive=false,requireText}:Props){
 const labelId=useId(),descId=useId(),inputId=useId();
 const dialog=useRef<HTMLDivElement>(null),cancel=useRef<HTMLButtonElement>(null),previous=useRef<HTMLElement|null>(null);
 const [typed,setTyped]=useState("");
 const cancelHandler=useRef(onCancel),isBusy=useRef(busy);
 useEffect(()=>{cancelHandler.current=onCancel;isBusy.current=busy;},[onCancel,busy]);
 // Keep the form reset keyed by the dialog's identity in the caller when required.
 useEffect(()=>{if(!open)return;previous.current=document.activeElement as HTMLElement;const previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
  const t=window.setTimeout(()=>{(requireText?dialog.current?.querySelector<HTMLInputElement>("input"):cancel.current)?.focus();},0);
  function keys(e:KeyboardEvent){if(e.key==="Escape"){e.preventDefault();if(!isBusy.current)cancelHandler.current();return;}
   if(e.key!=="Tab"||!dialog.current)return;
   const elements=Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length);
   if(!elements.length)return;const first=elements[0],last=elements[elements.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  document.addEventListener("keydown",keys);
  return()=>{clearTimeout(t);document.body.style.overflow=previousOverflow;document.removeEventListener("keydown",keys);previous.current?.focus();};
 },[open,requireText]);
 if(!open||typeof document==="undefined")return null;
 const valid=!requireText||typed.trim()===requireText;
 return createPortal(<div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#08130d]/65 p-4 backdrop-blur-[3px]" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onCancel();}}>
  <div ref={dialog} role="alertdialog" aria-modal="true" aria-labelledby={labelId} aria-describedby={descId} className="w-full max-w-[480px] rounded-2xl border border-[#e1ddd3] bg-[#fffdf9] p-6 text-[#1a2b21] shadow-[0_35px_100px_-25px_rgba(0,0,0,.4)] sm:p-8">
   <div className="mb-5 flex items-start justify-between gap-3"><div className={`flex size-11 items-center justify-center rounded-xl ${destructive?"bg-[#f9e9e5] text-[#ab4937]":"bg-[#f1ede3] text-[#987a4d]"}`}>{destructive?<TbAlertTriangle size={23}/>:<TbArchive size={23}/>}</div><button type="button" disabled={busy} onClick={onCancel} className="rounded-lg p-2 text-[#778579] hover:bg-[#f2eee7] focus-visible:outline-2 focus-visible:outline-[#9d8662]" aria-label="Zamknij"><TbX size={20}/></button></div>
   <h2 id={labelId} className="font-display text-[clamp(2rem,3vw,2.7rem)] leading-tight font-medium">{title}</h2><p id={descId} className="mt-3 text-sm leading-relaxed text-[#647065]">{description}</p>
   {requireText&&<div className="mt-5"><label htmlFor={inputId} className="mb-2 block text-xs font-semibold text-[#49584a]">Wpisz <strong>{requireText}</strong>, aby potwierdzić</label><input id={inputId} value={typed} onChange={e=>setTyped(e.target.value)} autoComplete="off" spellCheck={false} className="h-11 w-full rounded-lg border border-[#d9d7ce] bg-white px-3 text-sm outline-none focus:border-[#a18660] focus:ring-2 focus:ring-[#a18660]/20"/></div>}
   <div className="mt-7 flex flex-wrap justify-end gap-2"><button ref={cancel} disabled={busy} type="button" className={subtleButton} onClick={onCancel}>Anuluj</button><button type="button" disabled={busy||!valid} className={`${primaryButton} ${destructive?"!bg-[#8c332f] hover:!bg-[#a44039]":""}`} onClick={()=>void onConfirm()}>{destructive?<TbTrash size={18}/>:<TbCheck size={18}/>} {busy?"Przetwarzanie…":confirmLabel}</button></div>
  </div>
 </div>,document.body);
}
