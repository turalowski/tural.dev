import path from "path";
import { readDiagram, renderDiagram } from "@/app/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const lines = readDiagram(path.join(process.cwd(), "app", "icon.txt")) ?? ["T"];
  return renderDiagram(lines, {
    ...size,
    margin: 24,
    bold: true,
    // A capital has no descender, so the glyph box leaves empty space below it.
    offsetY: 0.08,
    background: "#23272F",
    foreground: "#FBFAF7",
  });
}
