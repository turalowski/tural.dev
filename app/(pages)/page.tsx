import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
import { Button } from "../components/ui/button";
import ToggleAppearance from "../components/toggle-appearance";
import { Badge } from "../components/ui/badge";
import {
  getAllPosts,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
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
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Blog`,
    description:
      "Notes on frontend engineering, web architecture, and building products — by Tural Hajiyev.",
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function BlogPage() {
  const posts = getAllPosts();

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
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex justify-end gap-3 mt-2 mb-8">
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
        <ToggleAppearance />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Tural Hajiyev
        </h1>
        <p className="text-lg text-muted-foreground mb-3">Frontend Engineer</p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-4 bg-background hover:bg-accent/5 transition-colors rounded-lg border border-border"
          >
            <div className="flex flex-col space-y-3">
              <div>
                <time
                  dateTime={post.date}
                  className="block text-xs text-muted-foreground mb-1"
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
