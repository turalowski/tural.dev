import path from "path";
import { readDiagram, renderDiagram } from "@/app/lib/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const lines = readDiagram(path.join(process.cwd(), "app", "icon.txt")) ?? ["T"];
  return renderDiagram(lines, {
    ...size,
    bold: true,
    // A capital has no descender, so the glyph box leaves empty space below it.
    offsetY: 0.08,
    background: "#23272F",
    foreground: "#FBFAF7",
  });
}
