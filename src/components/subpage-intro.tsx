import type { PageContent } from "@/lib/pages/schema";
export default function SubpageIntro({content,preview=false}:{content:PageContent;preview?:boolean}) {
 const Container = preview ? "div" : "main";
 return <Container id={preview ? undefined : "main"} className="relative isolate min-h-[calc(100svh-88px)] overflow-hidden bg-ivory text-forest-deep">
   <div aria-hidden="true" className="pointer-events-none absolute right-[-15%] top-[-20%] size-[70vw] rounded-full bg-[#e9dfcc]/35 blur-[140px]"/>
   <div className="relative mx-auto w-[min(90%,1680px)] pb-40 pt-28 md:pt-36 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)]">
     <p className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#957950] md:text-xs"><span className="h-px w-9 bg-[#af8c5c]"/>{content.eyebrow}</p>
     <h1 className="max-w-[1300px] font-display text-[clamp(5rem,10vw,11rem)] font-medium leading-[.83] tracking-[-.045em] 3xl:text-[clamp(10rem,8vw,15rem)]">{content.title}</h1>
     <p className="mt-11 max-w-2xl whitespace-pre-line text-[15px] leading-[1.9] text-[#526057] md:text-lg 3xl:max-w-4xl 3xl:text-2xl">{content.description}</p>
     <div className="mt-12 h-px w-24 bg-[#b39a70]" />
   </div>
 </Container>;
}
