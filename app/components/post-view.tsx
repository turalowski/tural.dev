import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import PostBody from "@/app/components/post-body";
import type { BlogPost } from "@/app/lib/blog";

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
      </div>
      <header>
        <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2 sm:text-4xl text-foreground">
          {post.title}
        </h1>
      </header>

      <PostBody slug={post.slug} content={post.content} />
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
