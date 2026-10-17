"use client";
import {useEffect,useId,useRef,useState} from "react";
import {TbCalendar,TbChevronLeft,TbChevronRight,TbX} from "react-icons/tb";

const week=["Pn","Wt","Śr","Cz","Pt","So","Nd"];
const months=["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"];
function validDate(v:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const [y,m,d]=v.split("-").map(Number);const date=new Date(y,m-1,d);return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d;}
function dmy(iso:string){if(!validDate(iso))return "";return iso.slice(8,10)+"."+iso.slice(5,7)+"."+iso.slice(0,4);}
function isoFromDmy(input:string){const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input);if(!m)return "";const iso=`${m[3]}-${m[2]}-${m[1]}`;return validDate(iso)?iso:"";}
function toISO(y:number,m:number,d:number){return `${y.toString().padStart(4,"0")}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
function readMonth(iso:string){if(validDate(iso)){const [y,m]=iso.split("-").map(Number);return {year:y,month:m-1};}const now=new Date();return{year:now.getFullYear(),month:now.getMonth()};}
type DateProps={value:string;onChange:(v:string)=>void;label?:string;min?:string;max?:string};
export function DatePicker(props:DateProps){return <DatePickerInner key={props.value} {...props}/>;}
function DatePickerInner({value,onChange,label,min,max}: DateProps){
 const [open,setOpen]=useState(false),[raw,setRaw]=useState(()=>dmy(value)),[view,setView]=useState(()=>readMonth(value)),[invalid,setInvalid]=useState(false);
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),id=useId();
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);}function key(e:KeyboardEvent){if(e.key==="Escape"){setOpen(false);input.current?.focus();}}document.addEventListener("pointerdown",outside);document.addEventListener("keydown",key);return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",key);};},[open]);
 const start=(new Date(view.year,view.month,1).getDay()+6)%7;
 const daysInMonth=new Date(view.year,view.month+1,0).getDate();
 const cells=Array.from({length:Math.ceil((start+daysInMonth)/7)*7},(_,index)=>index-start+1);
 function commitRaw(){const candidate=isoFromDmy(raw);if(!raw.trim()){onChange("");setInvalid(false);return;}if(candidate&&(!min||candidate>=min)&&(!max||candidate<=max)){onChange(candidate);setInvalid(false);setView(readMonth(candidate));}else setInvalid(true);}
 function moveMonth(diff:number){setView(v=>{const d=new Date(v.year,v.month+diff,1);return{year:d.getFullYear(),month:d.getMonth()};});}
 return <div ref={root} className="relative min-w-0">
  <div className={`flex min-h-11 items-center rounded-lg border bg-white transition focus-within:ring-2 focus-within:ring-[#b49a71]/20 ${invalid?"border-red-500":"border-[#dcded6] focus-within:border-[#9d8662]"}`}>
   <input ref={input} aria-label={label||"Data w formacie dzień.miesiąc.rok"} aria-invalid={invalid} value={raw} placeholder="dd.mm.rrrr" inputMode="numeric" onChange={e=>{setRaw(e.target.value);setInvalid(false);}} onBlur={commitRaw} onKeyDown={e=>{if(e.key==="Enter"){commitRaw();setOpen(false);}}} className="min-h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#1f2923] outline-none placeholder:text-[#9ba399]"/>
   {value&&<button type="button" onClick={()=>{onChange("");setRaw("");setInvalid(false);}} aria-label="Wyczyść datę" className="cursor-pointer rounded-md p-1.5 text-[#748075] hover:bg-[#eeeae2]"><TbX size={15}/></button>}
   <button type="button" aria-label={`Otwórz kalendarz${label?": "+label:""}`} aria-expanded={open} aria-controls={id} onClick={()=>{setView(readMonth(value));setOpen(o=>!o);}} className="mr-1 flex size-9 cursor-pointer items-center justify-center rounded-lg text-[#927650] hover:bg-[#f4efe5] focus-visible:outline-2 focus-visible:outline-[#a1845e]"><TbCalendar size={19}/></button>
  </div>
  {invalid&&<p role="alert" className="mt-1 text-xs text-[#b33c2d]">Podaj poprawną datę w formacie dd.mm.rrrr.</p>}
  {open&&<div id={id} className="absolute left-0 top-[calc(100%+6px)] z-[85] w-[min(305px,calc(100vw-3rem))] rounded-xl border border-[#ded9cf] bg-[#fffdf9] p-3 shadow-[0_20px_55px_-23px_rgba(10,22,13,.5)]">
   <div className="mb-3 flex items-center justify-between gap-2"><button type="button" aria-label="Poprzedni miesiąc" onClick={()=>moveMonth(-1)} className="rounded-lg p-2 text-[#5e705f] hover:bg-[#f3eee5]"><TbChevronLeft size={19}/></button><div className="flex items-center gap-1"><span className="text-sm font-semibold text-[#27382c]">{months[view.month]}</span><input aria-label="Rok" type="number" min="1850" max="2200" value={view.year} onChange={e=>{const y=Number(e.target.value);if(y>=1850&&y<=2200)setView(v=>({...v,year:y}));}} className="w-[74px] rounded-md border border-[#e2dfd6] bg-white p-1 text-center text-sm tabular-nums text-[#27382c] outline-none focus:border-[#a1845e]"/></div><button type="button" aria-label="Następny miesiąc" onClick={()=>moveMonth(1)} className="rounded-lg p-2 text-[#5e705f] hover:bg-[#f3eee5]"><TbChevronRight size={19}/></button></div>
   <div role="grid" aria-label={`${months[view.month]} ${view.year}`} className="grid grid-cols-7 gap-0.5">{week.map(d=><span key={d} className="py-1 text-center text-[10px] font-semibold text-[#8b9088]">{d}</span>)}{cells.map((d,i)=>{if(d<1||d>daysInMonth)return <span key={i}/>;const iso=toISO(view.year,view.month+1,d),disabled=!!(min&&iso<min||max&&iso>max);return <button type="button" key={i} role="gridcell" aria-selected={value===iso} aria-label={`${d} ${months[view.month]} ${view.year}`} disabled={disabled} onClick={()=>{onChange(iso);setRaw(dmy(iso));setInvalid(false);setOpen(false);input.current?.focus();}} className={`aspect-square cursor-pointer rounded-lg text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-[#ad8b5b] disabled:cursor-not-allowed disabled:opacity-30 ${value===iso?"bg-[#193225] font-bold text-white":"text-[#314335] hover:bg-[#ede8dc]"}`}>{d}</button>;})}</div>
  </div>}
 </div>;
}
type DateTimeProps={value:string;onChange:(v:string)=>void;label?:string};
export function DateTimePicker(props:DateTimeProps){return <DateTimePickerInner key={props.value} {...props}/>;}
function DateTimePickerInner({value,onChange,label}:DateTimeProps){
 const date=value.slice(0,10),time=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)?value.slice(11):"12:00";
 const [localTime,setLocalTime]=useState(time),[invalid,setInvalid]=useState(false);
 function changeTime(raw:string){setLocalTime(raw);setInvalid(false);if(/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)&&date)onChange(`${date}T${raw}`);}
 return <div className="grid grid-cols-[minmax(0,1fr)_95px] gap-2"><DatePicker label={label||"Data ceremonii"} value={date} onChange={d=>onChange(d?`${d}T${/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime)?localTime:"12:00"}`:"")}/><div><input aria-label="Godzina ceremonii, GG:MM" value={localTime} placeholder="GG:MM" inputMode="numeric" onChange={e=>changeTime(e.target.value)} onBlur={()=>setInvalid(!/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime))} className={`h-11 w-full rounded-lg border bg-white px-2 text-center text-sm tabular-nums text-[#1f2923] outline-none focus:ring-2 focus:ring-[#b49a71]/20 ${invalid?"border-red-500":"border-[#dcded6] focus:border-[#9d8662]"}`}/>{invalid&&<span role="alert" className="text-[10px] text-red-700">GG:MM</span>}</div></div>;
}
