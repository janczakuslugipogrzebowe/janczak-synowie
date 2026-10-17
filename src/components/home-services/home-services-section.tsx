"use client";

import type {CSSProperties} from "react";
import Image from "next/image";
import Link from "next/link";
import {motion,useReducedMotion} from "motion/react";
import {TbArrowUpRight,TbBuildingChurch,TbTruckDelivery,TbBox,TbFlower} from "react-icons/tb";
import type {HomeServicesContent} from "@/lib/home-services/schema";

const ICONS=[TbBuildingChurch,TbTruckDelivery,TbBox,TbFlower] as const;
const SERVICES_LOWER_MASK = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20148%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%200%20H1440%20V73%20C1269%20112%201108%2091%20939%2071%20C776%2052%20649%2082%20487%20100%20C315%20115%20172%2055%200%2085%20Z%22%2F%3E%3C%2Fsvg%3E")';

type Props={data:HomeServicesContent;preview?:boolean;joinsGuidance?:boolean;followedByFlorist?:boolean};
export default function HomeServicesSection({data,preview=false,joinsGuidance=false,followedByFlorist=false}:Props) {
  const reduce=useReducedMotion();
  const appear=(delay:number)=>({
    initial:reduce||preview?false:{opacity:0,y:28},
    whileInView:{opacity:1,y:0},viewport:{once:true,amount:.12},
    transition:{duration:.8,delay,ease:[.22,.63,.22,1] as [number,number,number,number]},
  });
  const size=(n:number,pct:number,unit:"rem"|"cqw")=>`${Number((n*pct/100).toFixed(3))}${unit}`;
  const vars={
    "--services-heading-min":size(2.65,data.headingScale,"rem"),
    "--services-heading-fluid":size(4.15,data.headingScale,"cqw"),
    "--services-heading-max":size(6.9,data.headingScale,"rem"),
    "--services-card-title-min":size(1.35,data.cardTitleScale,"rem"),
    "--services-card-title-fluid":size(1.85,data.cardTitleScale,"cqw"),
    "--services-card-title-max":size(2.4,data.cardTitleScale,"rem"),
    "--services-card-description":size(.95,data.cardDescriptionScale,"rem"),
    "--services-photo-height":`${data.cardImageHeightScale/100}`,
    "--services-gap":`${data.cardGapScale/100}`,
    ...(followedByFlorist ? {
      "--services-wave-height":"clamp(48px,6.9vw,140px)",
      maskImage:`linear-gradient(#000,#000), ${SERVICES_LOWER_MASK}`,
      maskSize:"100% calc(100% - var(--services-wave-height)), 100% var(--services-wave-height)",
      maskPosition:"top left, bottom left", maskRepeat:"no-repeat",
      WebkitMaskImage:`linear-gradient(#000,#000), ${SERVICES_LOWER_MASK}`,
      WebkitMaskSize:"100% calc(100% - var(--services-wave-height)), 100% var(--services-wave-height)",
      WebkitMaskPosition:"top left, bottom left", WebkitMaskRepeat:"no-repeat",
    }:{}),
  } as CSSProperties;

  return (
    <section id="uslugi" aria-labelledby="home-services-title" style={vars} className={`@container/services relative isolate overflow-hidden bg-ivory text-forest-deep ${joinsGuidance ? "z-10 -mt-[clamp(50px,6.5vw,135px)]" : followedByFlorist ? "z-10" : ""}`}>
      {/* On the homepage, the image now extends beneath the actual arch of the preceding section. */}
      <Image src={data.backgroundImageUrl} alt="" fill quality={75} loading={preview?"eager":"lazy"} sizes="100vw" className="pointer-events-none -z-20 object-cover object-center" style={{opacity:data.backgroundOpacity/100}} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#f6f1e8]/55 via-[#fffaf1]/15 to-[#f6f1e8]/38" />
      <div className={`relative mx-auto w-[min(90%,1680px)] pb-[clamp(8rem,12vw,14rem)] ${joinsGuidance ? "pt-[calc(clamp(50px,6.5vw,135px)+clamp(2rem,5vw,5rem))]" : "pt-[clamp(2rem,5vw,5rem)]"} 3xl:w-[min(88%,2200px)] 3xl:pb-[clamp(11rem,11vw,18rem)] 4xl:w-[min(85%,3000px)]`}>
        <header className="mx-auto mb-[clamp(2.5rem,4.5vw,5rem)] max-w-[80rem] text-center">
          <motion.p {...appear(0)} className="mb-[clamp(.8rem,1.25vw,1.4rem)] flex items-center justify-center gap-3 text-[clamp(.72rem,.8cqw,1rem)] font-bold uppercase tracking-[.27em] text-champagne"><span className="h-px w-8 bg-champagne/90"/>{data.eyebrow}<span className="h-px w-8 bg-champagne/90"/></motion.p>
          <motion.h2 {...appear(.08)} id="home-services-title" className="whitespace-pre-line font-display font-medium leading-[.99] tracking-[-.035em] [font-size:clamp(var(--services-heading-min),var(--services-heading-fluid),var(--services-heading-max))]">{data.headline}</motion.h2>
        </header>
        <div className="grid grid-cols-1 items-stretch gap-[calc(clamp(1rem,1.5vw,2.3rem)*var(--services-gap))] sm:grid-cols-2 xl:grid-cols-4">
          {data.services.map((service,index)=>{
            const Icon=ICONS[index];
            const cardContent=(
              <>
                <div className="relative aspect-[1.28/1] w-full shrink-0 overflow-hidden bg-[#d2c6ad]" style={{borderRadius:"50% 50% 0 0 / 32% 32% 0 0",aspectRatio:`${1.28/data.cardImageHeightScale*100} / 1`}}>
                  <Image src={service.imageUrl} alt={service.title} fill quality={75} loading={preview?"eager":"lazy"} sizes="(min-width:1920px) 26vw, (min-width:1280px) 22vw, (min-width:640px) 44vw, 90vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055] motion-reduce:transform-none" style={{objectPosition:`${service.imagePositionX}% ${service.imagePositionY}%`}} />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#18231b]/25 to-transparent" />
                </div>
                <div className="relative z-10 -mt-8 flex flex-1 flex-col items-center rounded-b-[1.1rem] border-x border-b border-[#d7cdbb]/75 bg-[#fcfaf5]/95 px-[clamp(1.1rem,1.65vw,2rem)] pb-[clamp(1.45rem,2vw,2.6rem)] text-center shadow-[0_15px_45px_-32px_rgba(44,39,26,.45)] backdrop-blur-[3px] transition-[box-shadow,transform] duration-500 group-hover:shadow-[0_22px_50px_-30px_rgba(44,39,26,.4)]">
                  <span className="relative -mt-8 mb-5 flex size-[clamp(4rem,4.8vw,5.6rem)] shrink-0 items-center justify-center rounded-full border border-[#caba9b] bg-[#f5eee0] text-[#957447] shadow-[0_6px_20px_rgba(36,27,14,.12)] ring-[6px] ring-[#fcfaf5] 3xl:mb-7">
                    <Icon aria-hidden="true" className="size-[46%]" strokeWidth={1.4}/>
                  </span>
                  <h3 className="min-h-[2.55em] max-w-[22ch] font-display font-semibold leading-[1.1] tracking-[-.02em] [font-size:clamp(var(--services-card-title-min),var(--services-card-title-fluid),var(--services-card-title-max))]">{service.title}</h3>
                  <p className="mt-[clamp(.75rem,1vw,1.3rem)] max-w-[34ch] flex-1 leading-[1.7] text-[#596259] [font-size:clamp(.875rem,var(--services-card-description),1.35rem)]">{service.description}</p>
                  <span className="mt-[clamp(1.2rem,1.5vw,2rem)] inline-flex items-center gap-2 border-b border-[#af956a]/60 pb-1 font-semibold text-[#715835] transition-[color,border-color] duration-300 group-hover:border-forest-deep group-hover:text-forest-deep [font-size:clamp(.82rem,.76cqw,1rem)]">{data.buttonLabel}<TbArrowUpRight aria-hidden="true" size={19} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></span>
                </div>
              </>
            );
            return <motion.article key={index} {...appear(.08+index*.09)} className="group flex min-w-0 flex-col pt-[clamp(.5rem,1vw,1.3rem)]">
              {preview ? <div className="flex h-full flex-col">{cardContent}</div> : <Link href={data.buttonHref} aria-label={`${service.title} – ${data.buttonLabel}`} className="flex h-full flex-col transition-transform duration-500 ease-out hover:-translate-y-1 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#957447]">{cardContent}</Link>}
            </motion.article>;
          })}
        </div>
      </div>
      {/* The lower boundary belongs to the upcoming dark florist section. */}
      {!followedByFlorist && <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 148" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-px left-0 z-20 h-[clamp(48px,6.9vw,140px)] w-full fill-forest-deep"><path d="M0 85 C172 55 315 115 487 100 C649 82 776 52 939 71 C1108 91 1269 112 1440 73 L1440 148 L0 148 Z" /></svg>}
    </section>
  );
}
