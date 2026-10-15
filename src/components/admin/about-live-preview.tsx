"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {HomeAboutContent} from "@/lib/home-about/schema";

const CHANGE = "janczak:home-about-preview:v1";
const READY = "janczak:home-about-preview:ready:v1";

export default function AboutLivePreview({data, phone}: {data:HomeAboutContent;phone:boolean}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [dims,setDims] = useState({width:1440,height:950,available:0});
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const next = {width:phone?390:window.innerWidth, height:phone?1150:Math.max(900,window.innerHeight), available:host.clientWidth};
      setDims(previous => previous.width===next.width && previous.height===next.height && previous.available===next.available ? previous : next);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    window.addEventListener("resize",measure,{passive:true});
    return () => {resize.disconnect();window.removeEventListener("resize",measure);};
  },[phone]);
  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({type:CHANGE,content:data},window.location.origin);
  },[data]);
  useEffect(() => {
    const ready = (event:MessageEvent) => {
      if (event.origin===window.location.origin && event.source===frameRef.current?.contentWindow && event.data?.type===READY) send();
    };
    window.addEventListener("message",ready);
    return () => window.removeEventListener("message",ready);
  },[send]);
  useEffect(() => {send();},[send]);
  const scale = dims.available?Math.min(1,dims.available/dims.width):0;
  return <div ref={hostRef} className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-[#14241c] shadow-lg">
    <div className="relative mx-auto overflow-hidden" style={{width:dims.width*scale,height:dims.height*scale}} aria-label={phone?"Podgląd na telefonie":"Podgląd na desktopie"}>
      <iframe ref={frameRef} title="Podgląd sekcji O nas" src="/admin/preview/about" onLoad={send} className="absolute left-0 top-0 block border-0" style={{width:dims.width,height:dims.height,transform:`scale(${scale})`,transformOrigin:"top left"}} />
    </div>
  </div>;
}
