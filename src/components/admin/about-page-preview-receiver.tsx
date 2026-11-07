"use client";

import { useEffect, useState } from "react";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import {
  AboutHistorySection,
  AboutPeopleSection,
  AboutValuesSection,
  AboutVillageSection,
} from "@/components/about/about-sections";
import { parseAboutSection, isAboutSection, type AboutContent } from "@/lib/about-page/schema";
import { parseSubpageBlock, type SubpageBlock } from "@/lib/subpages/schema";
import type { SiteSettings } from "@/lib/settings/schema";
import {
  ABOUT_PREVIEW_CHANGE,
  ABOUT_PREVIEW_READY,
  type AboutPreviewSection,
} from "@/components/admin/about-page-preview";

type PreviewData =
  | { section: "hero" | "bottom"; content: SubpageBlock }
  | {
      [S in keyof AboutContent]: { section: S; content: AboutContent[S] };
    }[keyof AboutContent];

export default function AboutPreviewReceiver({ settings }: { settings: SiteSettings }) {
  const [data, setData] = useState<PreviewData | null>(null);
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== ABOUT_PREVIEW_CHANGE
      )
        return;
      const section: AboutPreviewSection = event.data?.section;
      try {
        if (section === "hero" || section === "bottom")
          setData({ section, content: parseSubpageBlock(event.data.content) });
        else if (typeof section === "string" && isAboutSection(section)) {
          switch (section) {
            case "history":
              setData({ section, content: parseAboutSection(section, event.data.content) });
              break;
            case "people":
              setData({ section, content: parseAboutSection(section, event.data.content) });
              break;
            case "values":
              setData({ section, content: parseAboutSection(section, event.data.content) });
              break;
            case "village":
              setData({ section, content: parseAboutSection(section, event.data.content) });
              break;
          }
        }
      } catch {
        /* Keep the last valid preview while the administrator edits fields. */
      }
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: ABOUT_PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-[#f8f4ec]">
      {data?.section === "hero" && <SubpageHero data={data.content} preview />}
      {data?.section === "history" && <AboutHistorySection data={data.content} preview />}
      {data?.section === "people" && <AboutPeopleSection data={data.content} preview />}
      {data?.section === "values" && <AboutValuesSection data={data.content} preview />}
      {data?.section === "village" && <AboutVillageSection data={data.content} preview />}
      {data?.section === "bottom" && <SubpageBottomCta data={data.content} settings={settings} preview />}
    </main>
  );
}
