import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";
import {
  buildBlogPostingJsonLd,
  getOgLocale,
  getPostBySlug,
  getPostImageUrl,
  getPostSlugs,
  getPostUrl,
  SITE_NAME,
  TWITTER_HANDLE,
} from "@/app/lib/blog";
import ToggleAppearance from "@/app/components/toggle-appearance";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const url = post.canonical ?? getPostUrl(post.slug);
  const imageUrl = getPostImageUrl(post.image);
  const ogLocale = getOgLocale(post.locale);

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    creator: post.author,
    category: post.category,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      locale: ogLocale,
      siteName: SITE_NAME,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      authors: [post.author],
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      creator: TWITTER_HANDLE,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = buildBlogPostingJsonLd(post);

  return (
    <article className="container mx-auto px-4 py-6 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>

        <ToggleAppearance />
      </div>
      <header>
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          {post.title}
        </h1>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{post.author}</span>
            <span aria-hidden>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.updated && post.updated !== post.date ? (
              <>
                <span aria-hidden>•</span>
                <time dateTime={post.updated}>
                  Updated{" "}
                  {new Date(post.updated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5 my-6">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-muted px-2 py-0.5 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-8 mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="text-sm list-disc pl-6 mb-4 space-y-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="text-sm list-decimal pl-6 mb-4 space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-2 mb-4 italic text-muted-foreground">
                {children}
              </blockquote>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                {children}
              </pre>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
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
    </article>
  );
}
