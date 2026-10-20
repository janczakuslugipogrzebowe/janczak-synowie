/** Shared label from the homepage visual language, with one consistent gold accent. */
export default function SectionEyebrow({
  children,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`h-px w-9 shrink-0 ${dark ? "bg-[#E6C991]" : "bg-[#B89860]"}`} aria-hidden="true" />
      <span
        className={`text-[clamp(.7rem,.83vw,.87rem)] font-semibold uppercase tracking-[.23em] ${dark ? "text-[#E6C991]" : "text-[#A27F48]"}`}
      >
        {children}
      </span>
    </div>
  );
}
