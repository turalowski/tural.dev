import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import PostBody from "@/app/components/post-body";
import ThemeToggle from "@/app/components/theme-toggle";
import type { BlogPost } from "@/app/lib/blog";
import { getPostFeatures } from "@/app/lib/post-features";

export default function PostView({ post }: { post: BlogPost }) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
        <ThemeToggle />
      </div>
      <header>
        <h1 className="text-[2.25rem] font-bold tracking-[-0.025em] leading-[1.1] mb-4 sm:text-5xl text-foreground">
          {post.title}
        </h1>
      </header>

      <PostBody
        slug={post.slug}
        content={post.content}
        features={getPostFeatures(post.id)}
      />
      <footer className="mt-10 border-t pt-6 text-xs text-center text-muted-foreground">
        <p>
          <span role="img" aria-label="robot">
            🤖
          </span>{" "}
          This article may use AI assistance to fix typos and improve the
          organization of sections, but all content and ideas are the brain
          product of the original author.{" "}
          <a
            href="https://github.com/turalowski"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 underline"
          >
            github.com/turalowski
          </a>
        </p>
      </footer>
    </>
  );
}
