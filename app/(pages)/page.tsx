import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
import { Button } from "../components/ui/button";
import LegacyHashRedirect from "../components/legacy-hash-redirect";
import {
  getAllPosts,
  SITE_NAME,
  SITE_URL,
} from "@/app/lib/blog";
import { isUnlocked } from "@/app/lib/unlock";
import UnlockShortcut from "../components/unlock-shortcut";
import ThemeToggle from "../components/theme-toggle";

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
  const posts = HIDE_POSTS
    ? []
    : getAllPosts({ includeHidden: isUnlocked() });

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
    blogPost: posts
      .filter((post) => !post.hidden)
      .map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[50rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UnlockShortcut />
      <header className="flex items-center justify-between gap-4 mb-8 border-b pb-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Tural Hajiyev
          </h1>
          <p className="text-sm text-muted-foreground">Frontend Engineer</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
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
        </div>
      </header>
      <LegacyHashRedirect
        slugs={posts.filter((post) => !post.hidden).map((post) => post.slug)}
      />
      <ul className="divide-y">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/${post.hidden ? "hidden" : "blog"}/${post.slug}`}
              className="group flex items-baseline justify-between gap-4 py-3"
            >
              <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                {post.title}
                {post.hidden && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (hidden)
                  </span>
                )}
              </span>
              {post.category && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {post.category}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
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
