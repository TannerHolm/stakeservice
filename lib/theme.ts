import type { CSSProperties } from "react";

export const GRADIENT_BG: CSSProperties = {
  backgroundImage: [
    "linear-gradient(160deg, transparent 62%, rgba(0,0,0,0.10) 62%)",
    "linear-gradient(115deg, transparent 48%, rgba(255,255,255,0.06) 48%)",
    "linear-gradient(135deg, #5BB0C8 0%, #3D8AA5 45%, #2C6F8B 100%)",
  ].join(", "),
  backgroundAttachment: "fixed",
  color: "white",
};
