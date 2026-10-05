import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
import { Button } from "../components/ui/button";
import BlogNavigator from "../components/blog-navigator";
import PostBody from "../components/post-body";
import { cn } from "@/app/lib/utils";
import {
  getAllPostsWithContent,
  SITE_NAME,
  SITE_URL,
} from "@/app/lib/blog";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Blog`,
  },
  description:
    "Notes on frontend engineering, web architecture, and building products — by Tural Hajiyev.",
  keywords: [
    "blog",
    "frontend",
    "web architecture",
    "engineering",
    "Tural Hajiyev",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} — Blog`,
    description:
      "Notes on frontend engineering, web architecture, and building products — by Tural Hajiyev.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const HIDE_POSTS = false; // Set to true to hide all posts

export default async function BlogPage() {
  const posts = HIDE_POSTS ? [] : getAllPostsWithContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} — Blog`,
    description:
      "Notes on frontend engineering, web architecture, and building products.",
    url: SITE_URL,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[70rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="flex items-center justify-between gap-4 pb-3 lg:mb-14 lg:border-b lg:pb-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Tural Hajiyev
          </h1>
          <p className="text-sm text-muted-foreground">Frontend Engineer</p>
        </div>
        <Link
          href="https://github.com/turalowski"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="icon">
            <GitHubLogoIcon className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Button>
        </Link>
      </header>
      <BlogNavigator
        posts={posts.map(({ slug, title, date, tags, category }) => ({
          slug,
          title,
          date,
          tags,
          category,
        }))}
      >
        {posts.map((post, i) => (
          <article
            key={post.slug}
            id={post.slug}
            className={cn("scroll-mt-16", i > 0 && "mt-16 border-t pt-16 sm:mt-20 sm:pt-20")}
          >
            <header className="mb-8 sm:mb-10">
              <span className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight leading-tight sm:text-4xl text-foreground">
                {post.title}
              </h2>
            </header>
            <PostBody slug={post.slug} content={post.content} />
          </article>
        ))}
      </BlogNavigator>
      <footer className="mt-16 border-t pt-6 text-xs text-center text-muted-foreground">
        <p>
          <span role="img" aria-label="robot">
            🤖
          </span>{" "}
          These articles may use AI assistance to fix typos and improve the
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
    </div>
  );
}
