import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const SITE_URL = "https://tural.dev";
export const SITE_NAME = "Tural Hajiyev";
export const DEFAULT_AUTHOR = "Tural Hajiyev";
export const TWITTER_HANDLE = "@turalowski";

const POSTS_DIR = path.join(process.cwd(), "public", "blog", "posts");

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  author: string;
  image?: string;
  draft: boolean;
  canonical?: string;
  locale: string;
  category?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function isPublishableFile(filename: string): boolean {
  return (
    filename.endsWith(".md") &&
    !filename.startsWith("_") &&
    !filename.startsWith(".")
  );
}

function parseFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): BlogPostMeta | null {
  if (data.draft === true) return null;

  const title = typeof data.title === "string" ? data.title : null;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : null;
  const date = typeof data.date === "string" ? data.date : null;

  if (!title || !excerpt || !date) return null;

  const description =
    typeof data.description === "string" ? data.description : excerpt;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    slug,
    title,
    excerpt,
    description,
    date,
    updated: typeof data.updated === "string" ? data.updated : undefined,
    tags,
    author:
      typeof data.author === "string" ? data.author : DEFAULT_AUTHOR,
    image: typeof data.image === "string" ? data.image : undefined,
    draft: false,
    canonical:
      typeof data.canonical === "string" ? data.canonical : undefined,
    locale: typeof data.locale === "string" ? data.locale : "en",
    category:
      typeof data.category === "string" ? data.category : undefined,
  };
}

function absoluteUrl(urlPath: string): string {
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }
  return `${SITE_URL}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
}

export function getPostUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function getOgLocale(locale: string): string {
  if (locale.includes("_")) return locale;
  const map: Record<string, string> = {
    en: "en_US",
    az: "az_AZ",
  };
  return map[locale] ?? "en_US";
}

export function getPostImageUrl(image?: string): string | undefined {
  return image ? absoluteUrl(image) : undefined;
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter(isPublishableFile)
    .map((filename) => filename.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (slug.startsWith("_") || slug.includes("..") || slug.includes("/")) {
    return null;
  }

  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);
    const meta = parseFrontmatter(slug, data as Record<string, unknown>);
    if (!meta) return null;

    return { ...meta, content };
  } catch (error) {
    console.error(`Failed to load post "${slug}":`, error);
    return null;
  }
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      const { content: _content, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

export function buildBlogPostingJsonLd(post: BlogPostMeta) {
  const url = post.canonical ?? getPostUrl(post.slug);
  const image = getPostImageUrl(post.image);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.updated ? { dateModified: post.updated } : { dateModified: post.date }),
    author: {
      "@type": "Person",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    keywords: post.tags.join(", "),
    ...(image ? { image: [image] } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    inLanguage: post.locale,
  };
}
