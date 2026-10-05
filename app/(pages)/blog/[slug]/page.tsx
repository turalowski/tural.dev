import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
import {
  buildBlogPostingJsonLd,
  getOgLocale,
  getPostBySlug,
  getPostImageUrl,
  getPostSlugs,
  getPostUrl,
  SITE_NAME,
} from "@/app/lib/blog";
import PostBody from "@/app/components/post-body";

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
    <article className="container mx-auto px-4 py-6 max-w-[50rem]">
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
      </div>
      <header>
        <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2 sm:text-4xl text-foreground">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
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
    </article>
  );
}
