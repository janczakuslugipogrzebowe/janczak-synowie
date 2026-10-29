import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublicObituary } from "@/lib/obituaries/data";
import type { ObituarySymbol } from "@/lib/obituaries/schema";

export const alt = "Nekrolog – Janczak i Synowie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

function MemorialSymbol({ type }: { type: ObituarySymbol }) {
  if (type === "none") return <div style={{ width: 74, height: 1, backgroundColor: "#c2a16d" }} />;
  if (type === "cross") {
    return (
      <svg width="75" height="75" viewBox="0 0 75 75" fill="none" aria-hidden="true">
        <path d="M32 8H43V28H60V39H43V68H32V39H15V28H32V8Z" stroke="#d5b77e" strokeWidth="2.8" />
      </svg>
    );
  }
  if (type === "candle") {
    return (
      <svg width="75" height="75" viewBox="0 0 75 75" fill="none" aria-hidden="true">
        <path d="M37.5 9C28 23 33 29 37.5 31C43 27 47 21 37.5 9Z" stroke="#d5b77e" strokeWidth="2.4" />
        <rect x="27" y="35" width="21" height="29" rx="2" stroke="#d5b77e" strokeWidth="2.4" />
        <path d="M23 65H52" stroke="#d5b77e" strokeWidth="2.4" />
      </svg>
    );
  }
  return (
    <svg width="75" height="75" viewBox="0 0 75 75" fill="none" aria-hidden="true">
      <path
        d="M37.5 36C21 17 27 11 37.5 22C48 11 54 17 37.5 36ZM37.5 36C21 55 27 61 37.5 50C48 61 54 55 37.5 36ZM37.5 36C18 20 11 27 22 37.5C11 48 18 54 37.5 36ZM37.5 36C57 20 64 27 53 37.5C64 48 57 54 37.5 36Z"
        stroke="#d5b77e"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <circle cx="37.5" cy="36" r="5.2" fill="#d5b77e" />
    </svg>
  );
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  // Only published records may get public social-preview images.
  const obituary = await getPublicObituary(slug);
  if (!obituary) notFound();

  const name = `${obituary.firstName} ${obituary.lastName}`;
  const nameLength = Array.from(name).length;
  const fontSize = nameLength > 40 ? 56 : nameLength > 29 ? 68 : 86;
  const dateLabel = (date: string) => (date ? date.slice(0, 10).split("-").reverse().join(".") : "");
  const lifeDates = [dateLabel(obituary.birthDate), dateLabel(obituary.deathDate)]
    .filter(Boolean)
    .join(" — ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(145deg, #243b2c 0%, #14271d 58%, #0e1c16 100%)",
        color: "#f9f5ed",
        padding: "46px 66px 34px",
        border: "2px solid #a58b61",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(209,184,139,.35)",
          padding: "30px 36px 24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
          <MemorialSymbol type={obituary.symbol} />
          <span style={{ fontSize: 16, letterSpacing: 5, textTransform: "uppercase", color: "#d7c19b" }}>
            Z pamięcią i szacunkiem
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 950,
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "serif",
              fontSize,
              textAlign: "center",
              lineHeight: 1.08,
              letterSpacing: -1.3,
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            {name}
          </div>
          {lifeDates && <span style={{ color: "#e0ceb0", fontSize: 23, letterSpacing: 2 }}>{lifeDates}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
          <div style={{ width: 64, height: 1, backgroundColor: "#b99b6b" }} />
          <span style={{ fontFamily: "serif", fontSize: 34, letterSpacing: -0.7 }}>Janczak i Synowie</span>
          <span style={{ fontSize: 12, letterSpacing: 4, color: "#d2b987" }}>USŁUGI POGRZEBOWE</span>
        </div>
      </div>
    </div>,
    size,
  );
}
