import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import PostBody from "@/app/components/post-body";
import {
  formatPostDate,
  getRelatedPosts,
  type BlogPost,
} from "@/app/lib/blog";
import { getPostFeatures } from "@/app/lib/post-features";

export default function PostView({ post }: { post: BlogPost }) {
  const related = getRelatedPosts(post);

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
        <h1 className="text-[2.25rem] font-bold tracking-[-0.025em] leading-[1.1] mb-4 sm:text-5xl text-foreground">
          {post.title}
        </h1>
        {post.date && (
          <p className="mb-8 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
        )}
      </header>

      <PostBody
        slug={post.slug}
        content={post.content}
        features={getPostFeatures(post.id)}
      />
      {related.length > 0 && (
        <nav aria-labelledby="related-heading" className="mt-12 border-t pt-8">
          <h2
            id="related-heading"
            className="text-lg font-semibold mb-4 text-foreground"
          >
            Related articles
          </h2>
          <ul className="space-y-4">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/blog/${other.slug}`}
                  className="font-medium text-brand hover:text-brand-hover hover:underline"
                >
                  {other.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {other.excerpt}
                </p>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <footer className="mt-10 border-t pt-6 text-xs text-center text-muted-foreground">
        <p>
          <span role="img" aria-label="robot">
            🤖
          </span>{" "}
          This article may use AI assistance to fix typos and improve the
          organization of sections, but all content and ideas are the brain
          product of the original author. Some articles are more like learning
          notes, written while I was studying a topic.{" "}
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
