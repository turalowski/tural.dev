import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug } from "@/app/lib/blog";
import { isUnlocked } from "@/app/lib/unlock";
import PostView from "@/app/components/post-view";

// Hidden posts are only served to visitors who typed /unlock on the home page.
interface HiddenPostPageProps {
  params: { slug: string };
}

function getHiddenPost(slug: string) {
  const post = getPostBySlug(slug);
  return post?.hidden && isUnlocked() ? post : null;
}

export function generateMetadata({ params }: HiddenPostPageProps): Metadata {
  const post = getHiddenPost(params.slug);
  return {
    title: post?.title ?? "Post Not Found",
    robots: { index: false, follow: false },
  };
}

export default function HiddenPostPage({ params }: HiddenPostPageProps) {
  const post = getHiddenPost(params.slug);
  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 py-6 max-w-[50rem]">
      <PostView post={post} />
    </article>
  );
}
