"use client";
import {useEffect,useState} from "react";
import HomeServicesSection from "@/components/home-services/home-services-section";
import {parseHomeServices,type HomeServicesContent} from "@/lib/home-services/schema";
const CHANGE="janczak:home-services-preview:v1";
const READY="janczak:home-services-preview:ready:v1";
export default function ServicesPreviewReceiver(){
 const [data,setData]=useState<HomeServicesContent|null>(null);
 useEffect(()=>{
   const onMessage=(event:MessageEvent)=>{
     if(event.origin!==window.location.origin||event.source!==window.parent||event.data?.type!==CHANGE)return;
     try{setData(parseHomeServices(event.data.content));}catch{/* Invalid draft: keep last valid preview. */}
   };
   window.addEventListener("message",onMessage);
   window.parent.postMessage({type:READY},window.location.origin);
   return()=>window.removeEventListener("message",onMessage);
 },[]);
 return <main id="main" className="min-h-dvh bg-forest-deep">{data&&<HomeServicesSection data={data} preview/>}</main>;
}
