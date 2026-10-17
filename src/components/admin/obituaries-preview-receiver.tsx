"use client";
import {useEffect,useState} from "react";
import HomeObituariesSection from "@/components/home-obituaries/home-obituaries-section";
import {parseHomeObituaries,type HomeObituariesContent} from "@/lib/home-obituaries/schema";
const CHANGE="janczak:home-obituaries-preview:v1";
const READY="janczak:home-obituaries-preview:ready:v1";
export default function ObituariesPreviewReceiver({entries}:{entries:import("@/lib/obituaries/schema").ObituaryRecord[]}){
  const [data,setData]=useState<HomeObituariesContent|null>(null);
  useEffect(()=>{
    const onMessage=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin||event.source!==window.parent||event.data?.type!==CHANGE)return;
      try{setData(parseHomeObituaries(event.data.content));}catch{/* A temporary invalid draft must not crash preview. */}
    };
    window.addEventListener("message",onMessage);
    window.parent.postMessage({type:READY},window.location.origin);
    return()=>window.removeEventListener("message",onMessage);
  },[]);
  return <main id="main" className="min-h-dvh bg-ivory">{data&&<HomeObituariesSection data={data} entries={entries} preview/>}</main>;
}
