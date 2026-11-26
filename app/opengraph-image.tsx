import path from "path";
import { SITE_NAME } from "@/app/lib/blog";
import { OG_SIZE, readDiagram, renderOgDiagram } from "@/app/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = SITE_NAME;

export default function Image() {
  const lines = readDiagram(path.join(process.cwd(), "app", "og-home.txt")) ?? [SITE_NAME];
  return renderOgDiagram(lines);
}
