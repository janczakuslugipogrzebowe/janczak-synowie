import type { CSSProperties, ReactNode } from "react";

// One clip controls the image, texture and overlays together; the next section
// sits underneath it. This prevents straight gradient seams along the curve.
const LOWER_EDGE_MASK =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20130%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%200%20H1440%20V67%20C1333%2092%201220%2066%201035%2048%20C869%2032%20708%2079%20522%2086%20C328%2093%20200%2033%200%2075%20Z%22%2F%3E%3C%2Fsvg%3E")';

export default function ObituariesDocumentsBoundary({ children }: { children: ReactNode }) {
  const styles = {
    "--obituary-document-wave": "clamp(55px,7vw,130px)",
    maskImage: `linear-gradient(#000,#000), ${LOWER_EDGE_MASK}`,
    maskSize: "100% calc(100% - var(--obituary-document-wave) + 1px), 100% var(--obituary-document-wave)",
    maskPosition: "top left, bottom left",
    maskRepeat: "no-repeat",
    WebkitMaskImage: `linear-gradient(#000,#000), ${LOWER_EDGE_MASK}`,
    WebkitMaskSize:
      "100% calc(100% - var(--obituary-document-wave) + 1px), 100% var(--obituary-document-wave)",
    WebkitMaskPosition: "top left, bottom left",
    WebkitMaskRepeat: "no-repeat",
  } as CSSProperties;
  return (
    <div className="relative z-10" style={styles}>
      {children}
    </div>
  );
}
