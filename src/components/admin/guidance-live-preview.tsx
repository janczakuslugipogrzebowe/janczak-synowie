"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {HomeGuidanceContent} from "@/lib/home-guidance/schema";
import type {SiteSettings} from "@/lib/settings/schema";
const CHANGE="janczak:home-guidance-preview:v1";
const READY="janczak:home-guidance-preview:ready:v1";
export default function GuidanceLivePreview({data,settings,phone}:{data:HomeGuidanceContent;settings:SiteSettings;phone:boolean}){
 const hostRef=useRef<HTMLDivElement>(null),frameRef=useRef<HTMLIFrameElement>(null);
 const [dims,setDims]=useState({width:1440,height:1000,available:0});
 useEffect(()=>{const host=hostRef.current;if(!host)return;
  const measure=()=>{const next={width:phone?390:window.innerWidth,height:phone?1250:Math.max(900,window.innerHeight),available:host.clientWidth};setDims(prev=>prev.width===next.width&&prev.height===next.height&&prev.available===next.available?prev:next);};
  const observer=new ResizeObserver(measure);observer.observe(host);window.addEventListener("resize",measure,{passive:true});return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
 },[phone]);
 const send=useCallback(()=>frameRef.current?.contentWindow?.postMessage({type:CHANGE,content:data,settings},window.location.origin),[data,settings]);
 useEffect(()=>{const ready=(e:MessageEvent)=>{if(e.origin===window.location.origin&&e.source===frameRef.current?.contentWindow&&e.data?.type===READY)send();};window.addEventListener("message",ready);return()=>window.removeEventListener("message",ready);},[send]);
 useEffect(()=>{send();},[send]);
 const scale=dims.available?Math.min(1,dims.available/dims.width):0;
 return <div ref={hostRef} className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-forest-deep shadow-lg">
  <div className="relative mx-auto overflow-hidden" style={{width:dims.width*scale,height:dims.height*scale}} aria-label={phone?"Podgląd na telefonie":"Podgląd na desktopie"}>
   <iframe ref={frameRef} title="Podgląd sekcji Co zrobić" src="/admin/preview/guidance" onLoad={send} className="absolute left-0 top-0 block border-0" style={{width:dims.width,height:dims.height,transform:`scale(${scale})`,transformOrigin:"top left"}} />
  </div>
 </div>;
}
