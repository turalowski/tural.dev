import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownCode from "@/app/components/markdown-code";

type HastNode = { type: string; value?: string; children?: HastNode[] };

function hastText(node?: HastNode): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface PostBodyProps {
  slug: string;
  content: string;
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5";

export default function PostBody({ slug, content }: PostBodyProps) {
  // Repeated heading texts get a numeric suffix so every id stays unique.
  const seen = new Map<string, number>();

  const heading = (Tag: HeadingTag, className: string) =>
    function Heading({ node, children }: { node?: unknown; children?: ReactNode }) {
      const base = `${slug}--${slugify(hastText(node as HastNode | undefined))}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return (
        <Tag
          id={count ? `${base}-${count}` : base}
          className={`${className} text-foreground scroll-mt-20`}
        >
          {children}
        </Tag>
      );
    };

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Heading ids feed the section list in the blog navigator.
          h1: heading("h1", "text-3xl font-bold tracking-tight mt-12 mb-4"),
          h2: heading("h2", "text-2xl font-semibold tracking-tight mt-12 mb-4"),
          h3: heading("h3", "text-xl font-semibold tracking-tight mt-8 mb-3"),
          h4: heading("h4", "text-lg font-semibold mt-6 mb-2"),
          h5: heading("h5", "text-base font-semibold mt-6 mb-2"),

          p: ({ children }) => (
            <p className="mb-6 text-[1.0625rem] leading-[1.8]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="text-[1.0625rem] leading-[1.8] list-disc pl-6 mb-6 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-[1.0625rem] leading-[1.8] list-decimal pl-6 mb-6 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand-hover hover:decoration-brand-hover"
            >
              {children}
            </a>
          ),
          code: MarkdownCode,
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-2 border-brand pl-5 text-muted-foreground">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),

          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          // SyntaxHighlighter owns the block chrome; avoid a nested <pre>.
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
