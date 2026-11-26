import path from "path";
import { getAllPosts, getPostBySlug, POSTS_DIR, SITE_NAME } from "@/app/lib/blog";
import { OG_SIZE, readDiagram, renderOgDiagram } from "@/app/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = SITE_NAME;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  // og.txt comes from `yarn og`; fall back to the bare title if it is missing.
  const lines = readDiagram(path.join(POSTS_DIR, params.slug, "og.txt")) ?? [
    post?.title ?? SITE_NAME,
  ];
  return renderOgDiagram(lines);
}
