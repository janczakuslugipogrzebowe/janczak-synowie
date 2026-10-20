import type { ReactNode } from "react";
export default function SubpageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[min(90%,1680px)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)] ${className}`}
    >
      {children}
    </div>
  );
}
