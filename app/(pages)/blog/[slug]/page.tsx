import { notFound } from "next/navigation";
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
import PostView from "@/app/components/post-view";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .filter((post) => !post.hidden)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post || post.hidden) {
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
      ...(post.date ? { publishedTime: post.date } : {}),
      ...((post.updated ?? post.date) ? { modifiedTime: post.updated ?? post.date } : {}),
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
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post || post.hidden) {
    notFound();
  }

  const jsonLd = buildBlogPostingJsonLd(post);

  return (
    <article className="container mx-auto px-4 py-6 max-w-[50rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostView post={post} />
    </article>
  );
}
