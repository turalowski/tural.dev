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
    background: "#23272F",
    foreground: "#FBFAF7",
  });
}
