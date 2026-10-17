"use client";
import {useId} from "react";
type Props={label:string;value:number;onChange:(value:number)=>void;min:number;max:number;step?:number;suffix?:string;disabled?:boolean};
export function AdminSlider({label,value,onChange,min,max,step=1,suffix="%",disabled=false}:Props){
 const id=useId();
 return <div className="space-y-2"><label htmlFor={id} className="flex items-center justify-between gap-3 text-xs font-semibold text-[#415044]"><span>{label}</span><output htmlFor={id} className="rounded-md bg-[#f1eee7] px-2 py-1 tabular-nums text-[#655137]">{value}{suffix}</output></label><input id={id} aria-valuetext={`${value}${suffix}`} disabled={disabled} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[#9e835a] disabled:cursor-not-allowed disabled:opacity-40" /></div>;
}
