import { TbMapPin, TbPhoneCall, TbUsers, TbLeaf } from "react-icons/tb";
import type { HeroContent } from "@/lib/hero/schema";
import { directionsUrl, normalizePhone, type SiteSettings } from "@/lib/settings/schema";

export default function HeroHighlights({ data, settings, preview=false }: { data:HeroContent; settings:SiteSettings; preview?:boolean }) {
  const map = directionsUrl(settings);
  const blocks = [
    {Icon:TbMapPin,title:settings.addressLine,subtitle:settings.postalCity,href:map},
    {Icon:TbPhoneCall,title:settings.primaryPhone,subtitle:settings.secondaryPhone,href:`tel:${normalizePhone(settings.primaryPhone)}`},
    {Icon:TbUsers,title:data.detailOne,subtitle:data.detailTwo,href:null},
    {Icon:TbLeaf,title:data.detailThree,subtitle:settings.trustSubtitle,href:null},
  ];
  return <div className="relative z-20 mt-12 w-full border-t border-white/25 pt-7 text-ivory 3xl:mt-16 3xl:pt-9">
    <div className="grid grid-cols-2 gap-x-[clamp(var(--hero-highlight-gap-min),var(--hero-highlight-gap-fluid),var(--hero-highlight-gap-max))] gap-y-7 @4xl/hero:flex @4xl/hero:flex-wrap @4xl/hero:items-start">
    {blocks.map(({Icon,title,subtitle,href},i)=>{
      const content=<><Icon aria-hidden="true" className="mt-0.5 size-[clamp(var(--hero-icon-min),var(--hero-icon-fluid),var(--hero-icon-max))] shrink-0 text-champagne" strokeWidth={1.45}/><span className="flex min-w-0 flex-col gap-1"><strong className="font-semibold leading-snug @4xl/hero:whitespace-nowrap [font-size:clamp(var(--hero-highlight-title-min),var(--hero-highlight-title-fluid),var(--hero-highlight-title-max))]">{title}</strong><span className="leading-snug text-white/75 @4xl/hero:whitespace-nowrap [font-size:clamp(var(--hero-highlight-description-min),var(--hero-highlight-description-fluid),var(--hero-highlight-description-max))]">{subtitle}</span></span></>;
      return href && !preview ? <a key={i} href={href} target={href.startsWith("https:")?"_blank":undefined} rel={href.startsWith("https:")?"noopener noreferrer":undefined} className="flex min-w-0 items-start gap-[clamp(.65rem,1cqw,1.5rem)] transition-colors hover:text-champagne">{content}</a> : <div key={i} className="flex min-w-0 items-start gap-[clamp(.65rem,1cqw,1.5rem)]">{content}</div>;
    })}
    </div>
  </div>;
}
