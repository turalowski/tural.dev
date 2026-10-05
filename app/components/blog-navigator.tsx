"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

export interface NavigatorPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category?: string;
}

interface Heading {
  id: string;
  text: string;
}

interface BlogNavigatorProps {
  posts: NavigatorPost[];
  children: ReactNode;
}

// An article/section becomes active once its top crosses this fraction of the viewport.
const READING_LINE = 0.3;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function BlogNavigator({ posts, children }: BlogNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [headings, setHeadings] = useState<Record<string, Heading[]>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const articles = posts.map((post) => document.getElementById(post.slug));
    const headingEls = articles.map((article) =>
      article ? Array.from(article.querySelectorAll<HTMLElement>("h2[id]")) : [],
    );

    setHeadings(
      Object.fromEntries(
        posts.map((post, i) => [
          post.slug,
          headingEls[i].map((el) => ({ id: el.id, text: el.textContent ?? "" })),
        ]),
      ),
    );

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;

      let index = 0;
      articles.forEach((article, i) => {
        if (article && article.getBoundingClientRect().top <= line) index = i;
      });

      const rect = articles[index]?.getBoundingClientRect();
      const ratio = rect ? (line - rect.top) / rect.height : 0;

      let headingId: string | null = null;
      for (const el of headingEls[index]) {
        if (el.getBoundingClientRect().top <= line) headingId = el.id;
      }

      setActiveIndex(index);
      setProgress(Math.min(1, Math.max(0, ratio)));
      setActiveHeadingId(headingId);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [posts]);

  const activePost = posts[activeIndex];

  // Keep the URL shareable: /#slug points at the article being read.
  useEffect(() => {
    if (!activePost || window.scrollY < 10) return;
    const hash = `#${activePost.slug}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }, [activePost]);

  // Mobile drawer: lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const activeHeadings = activePost ? headings[activePost.slug] ?? [] : [];

  const navigate = (id: string, updateHash = false) => {
    setMenuOpen(false);
    // Release the drawer's scroll lock now; the effect cleanup runs too late.
    document.body.style.overflow = "";
    scrollToId(id);
    if (updateHash) history.replaceState(null, "", `#${id}`);
  };

  const panel = activePost && (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Now reading
        </p>
        <p className="text-sm font-semibold leading-snug text-foreground">
          {activePost.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(activePost.date)}
          {activePost.category ? ` · ${activePost.category}` : ""}
        </p>
      </div>

      {activePost.tags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activePost.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md border-border px-2 py-0.5 text-[11px] font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <nav aria-label="Articles">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Articles
        </p>
        <ol>
          {posts.map((post, i) => {
            const isActive = i === activeIndex;
            const isRead = i < activeIndex;
            const fill = isRead ? 1 : isActive ? progress : 0;

            return (
              <li key={post.slug} className="relative pl-6 pb-5 last:pb-0">
                {i < posts.length - 1 && (
                  <span className="absolute left-[5px] top-3 bottom-0 w-px bg-border">
                    <span
                      className="absolute inset-x-0 top-0 bg-brand"
                      style={{ height: `${fill * 100}%` }}
                    />
                  </span>
                )}
                <span
                  className={cn(
                    "absolute left-0 top-1 h-[11px] w-[11px] rounded-full border-2 transition-colors",
                    isActive
                      ? "border-brand bg-brand"
                      : isRead
                        ? "border-brand bg-background"
                        : "border-border bg-background",
                  )}
                />
                <a
                  href={`#${post.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(post.slug, true);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className="group block"
                >
                  <span className="block text-[11px] text-muted-foreground">
                    {formatDate(post.date)}
                  </span>
                  <span
                    className={cn(
                      "block text-[13px] leading-snug transition-colors",
                      isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {post.title}
                  </span>
                </a>

                {/* Sections of the active article */}
                {isActive && activeHeadings.length > 0 && (
                  <ul className="mt-2 space-y-1 border-l">
                    {activeHeadings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(heading.id);
                          }}
                          className={cn(
                            "-ml-px block border-l py-0.5 pl-3 text-xs leading-snug transition-colors",
                            heading.id === activeHeadingId
                              ? "border-brand text-brand"
                              : "border-transparent text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,50rem)_16rem] lg:justify-center lg:gap-16">
      {/* Mobile: sticky bar with the current article and a menu button */}
      {activePost && (
        <div className="lg:hidden sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {activePost.title}
            </p>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open article navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="-mr-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="h-0.5 w-full">
            <div
              className="h-full bg-brand"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Mobile: slide-in drawer with the same panel as the desktop sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 transition-opacity duration-200",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Article navigation"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col border-l bg-background shadow-xl transition-transform duration-200",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b px-5 py-3">
            <p className="text-sm font-semibold text-foreground">Menu</p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close article navigation"
              tabIndex={menuOpen ? 0 : -1}
              className="-mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
        </div>
      </div>

      <div className="min-w-0">{children}</div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4">
          {panel}
        </div>
      </aside>
    </div>
  );
}
