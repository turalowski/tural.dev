"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { GitHubLogoIcon, HomeIcon } from "@radix-ui/react-icons";
import ToggleAppearance from "../components/toggle-appearance";
import { useEffect, useState } from "react";
import matter from "gray-matter";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // For now, we'll hardcode the slugs since we can't list directory contents client-side
        const slugs = ['getting-started-with-nextjs', 'mastering-typescript'];
        const loadedPosts = await Promise.all(
          slugs.map(async (slug) => {
            const response = await fetch(`/blog/posts/${slug}.md`);
            const text = await response.text();
            const { data } = matter(text);
            return {
              slug,
              title: data.title,
              excerpt: data.excerpt,
              date: data.date,
              tags: data.tags
            };
          })
        );

        // Sort posts by date
        const sortedPosts = loadedPosts.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setPosts(sortedPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-muted-foreground">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-end mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Tural Hajiyev</h1>
        <p className="text-lg text-muted-foreground mb-3">Frontend Engineer</p>
        <div className="flex justify-center gap-3">
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
                <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date} className="shrink-0">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 