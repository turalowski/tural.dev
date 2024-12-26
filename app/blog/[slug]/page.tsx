"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { ArrowLeftIcon, HomeIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import matter from "gray-matter";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

interface PostData {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/blog/posts/${params.slug}.md`);
        if (!response.ok) {
          throw new Error('Failed to load post content');
        }
        const text = await response.text();
        const { data, content } = matter(text);
        setPostData({
          title: data.title,
          date: data.date,
          tags: data.tags,
          excerpt: data.excerpt,
          content
        });
      } catch (error) {
        console.error('Failed to load post content:', error);
        setError('Failed to load post content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadContent();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-red-500">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
      </div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">{postData.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={postData.date}>
            {new Date(postData.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span className="hidden sm:inline">•</span>
          <div className="flex flex-wrap gap-1.5">
            {postData.tags.map((tag) => (
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
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-sm mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="text-sm list-disc pl-6 mb-4 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="text-sm list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                {children}
              </pre>
            ),
          }}
        >
          {postData.content}
        </ReactMarkdown>
      </div>
    </article>
  );
} 