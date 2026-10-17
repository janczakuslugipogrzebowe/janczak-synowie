"use client";
import {useEffect,useId,useRef,useState} from "react";
import {TbCheck,TbChevronDown} from "react-icons/tb";

type Item={value:string;label:string};
type Props={value:string;onChange:(value:string)=>void;options:readonly Item[];label?:string;disabled?:boolean;className?:string};
export function CustomSelect({value,onChange,options,label,disabled=false,className=""}:Props){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null),selected=useRef<HTMLButtonElement>(null),id=useId();
 const selectedLabel=options.find(option=>option.value===value)?.label??"Wybierz";
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!ref.current?.contains(e.target as Node))setOpen(false);}document.addEventListener("pointerdown",outside);return()=>document.removeEventListener("pointerdown",outside);},[open]);
 useEffect(()=>{if(open)selected.current?.focus();},[open]);
 function keyboard(e:React.KeyboardEvent){
  if(e.key==="Escape"){setOpen(false);e.stopPropagation();return;}
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){
   e.preventDefault();if(!open){setOpen(true);return;}
   const current=Math.max(0,options.findIndex(o=>o.value===value));
   const next=options[(current+(e.key==="ArrowDown"?1:-1)+options.length)%options.length];
   if(next)onChange(next.value);
  }
  if(e.key==="Enter"||e.key===" "){if(open){setOpen(false);ref.current?.querySelector<HTMLButtonElement>("[aria-haspopup]")?.focus();}}
 }
 return <div ref={ref} className={`relative min-w-0 ${className}`} onKeyDown={keyboard}>
  <button type="button" disabled={disabled} aria-label={label} aria-haspopup="listbox" aria-controls={id} aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#dcded6] bg-white px-3.5 py-2.5 text-left text-sm text-[#1f2923] transition hover:border-[#bca681] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#9d8662] disabled:cursor-not-allowed disabled:opacity-50"><span className="truncate">{selectedLabel}</span><TbChevronDown size={18} className={`shrink-0 text-[#947a55] transition-transform ${open?"rotate-180":""}`}/></button>
  {open&&<div id={id} role="listbox" aria-label={label||"Dostępne opcje"} className="absolute left-0 top-[calc(100%+5px)] z-[80] max-h-64 w-full min-w-[185px] overflow-y-auto rounded-xl border border-[#dfddd4] bg-[#fffdf9] p-1.5 shadow-[0_15px_45px_-20px_rgba(20,30,22,.4)]">
   {options.map(o=><button key={o.value} ref={o.value===value?selected:undefined} role="option" aria-selected={o.value===value} type="button" onClick={()=>{onChange(o.value);setOpen(false);}} className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#ad8b5b] ${o.value===value?"bg-[#ecede6] font-semibold text-[#182b21]":"text-[#435548] hover:bg-[#f4f1ea]"}`}>{o.label}{o.value===value&&<TbCheck size={16} className="shrink-0 text-[#957951]"/>}</button>)}
  </div>}
 </div>;
}
