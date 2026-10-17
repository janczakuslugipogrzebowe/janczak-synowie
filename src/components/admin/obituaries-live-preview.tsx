"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {HomeObituariesContent} from "@/lib/home-obituaries/schema";
const CHANGE="janczak:home-obituaries-preview:v1";
const READY="janczak:home-obituaries-preview:ready:v1";
export default function ObituariesLivePreview({data,phone}:{data:HomeObituariesContent;phone:boolean}){
  const host=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null);
  const [dims,setDims]=useState({width:1440,height:1200,available:0});
  useEffect(()=>{
    const el=host.current;if(!el)return;
    const measure=()=>{
      const next={width:phone?390:window.innerWidth,height:phone?2500:Math.max(1200,window.innerHeight),available:el.clientWidth};
      setDims(prev=>prev.width===next.width&&prev.height===next.height&&prev.available===next.available?prev:next);
    };
    const observer=new ResizeObserver(measure);observer.observe(el);window.addEventListener("resize",measure,{passive:true});
    return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[phone]);
  const send=useCallback(()=>frame.current?.contentWindow?.postMessage({type:CHANGE,content:data},window.location.origin),[data]);
  useEffect(()=>{const ready=(event:MessageEvent)=>{if(event.origin===window.location.origin&&event.source===frame.current?.contentWindow&&event.data?.type===READY)send();};window.addEventListener("message",ready);return()=>window.removeEventListener("message",ready);},[send]);
  useEffect(()=>{send();},[send]);
  const scale=dims.available?Math.min(1,dims.available/dims.width):0;
  return <div ref={host} className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-ivory shadow-lg">
    <div className="relative mx-auto overflow-hidden" style={{width:dims.width*scale,height:dims.height*scale}} aria-label={phone?"Podgląd telefonu":"Podgląd desktopu"}>
      <iframe ref={frame} title="Podgląd sekcji nekrologów" src="/admin/preview/obituaries" onLoad={send} className="absolute left-0 top-0 block border-0" style={{width:dims.width,height:dims.height,transform:`scale(${scale})`,transformOrigin:"top left"}}/>
    </div>
  </div>;
}
