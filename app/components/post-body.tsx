import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownCode from "@/app/components/markdown-code";
import TableFilter from "@/app/components/table-filter";
import type { PostFeatures } from "@/app/lib/post-features";

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
  features?: PostFeatures;
}

const ANSWER_STYLES: Record<string, string> = {
  yes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300/90",
  no: "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300/90",
};

// Position of a column in the first markdown table header that has it, or -1.
function markdownColumnIndex(content: string, column: string): number {
  for (const line of content.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().toLowerCase());
    const index = cells.indexOf(column.toLowerCase());
    if (index !== -1) return index;
  }
  return -1;
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5";

export default function PostBody({ slug, content, features = {} }: PostBodyProps) {
  // Repeated heading texts get a numeric suffix so every id stays unique.
  const seen = new Map<string, number>();
  // Known on the server, so the hidden column never flashes before hydration.
  const hiddenColumn =
    features.tableFilterColumn && features.hideFilterColumn
      ? markdownColumnIndex(content, features.tableFilterColumn)
      : -1;

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
          h1: heading("h1", "text-[2.25rem] font-bold leading-tight tracking-[-0.02em] mt-12 mb-5"),
          h2: heading("h2", "text-[1.875rem] font-bold leading-[1.25] tracking-[-0.015em] mt-14 mb-5"),
          h3: heading("h3", "text-2xl font-bold leading-snug tracking-[-0.01em] mt-10 mb-3"),
          h4: heading("h4", "text-xl font-bold mt-8 mb-2"),
          h5: heading("h5", "text-lg font-bold mt-6 mb-2"),

          p: ({ children }) => (
            <p className="mb-5 text-[1.125rem] leading-[1.6] text-prose">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="text-[1.125rem] leading-[1.6] text-prose list-disc marker:text-brand/60 pl-6 mb-5 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-[1.125rem] leading-[1.6] text-prose list-decimal marker:font-semibold marker:text-brand/70 pl-6 mb-5 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand-hover hover:decoration-brand-hover"
            >
              {children}
            </a>
          ),
          code: MarkdownCode,
          blockquote: ({ children }) => (
            <blockquote className="my-8 rounded-2xl border border-brand/15 bg-brand/[0.04] px-6 py-5 text-muted-foreground shadow-sm shadow-brand/5">
              {children}
            </blockquote>
          ),
          // Wrapper clips the rounded corners and scrolls on narrow screens.
          table: ({ children }) => {
            const table = (
              <div className="my-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <table className="w-full border-collapse text-[0.9375rem]">
                  {children}
                </table>
              </div>
            );
            // Only articles whose id enables it get filter chips.
            return features.tableFilterColumn ? (
              <TableFilter
                column={features.tableFilterColumn}
                hiddenColumnIndex={hiddenColumn}
              >
                {table}
              </TableFilter>
            ) : (
              table
            );
          },
          thead: ({ children }) => (
            <thead className="bg-brand/[0.08] text-foreground">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
              {children}
            </th>
          ),
          tr: ({ children }) => (
            <tr className="border-t border-border/70 transition-colors first:border-t-0 hover:bg-secondary">
              {children}
            </tr>
          ),
          // Cells that are exactly "yes" / "no" render as green / red pills.
          td: ({ node, children }) => {
            const value = hastText(node as HastNode | undefined).trim().toLowerCase();
            const answer = ANSWER_STYLES[value];
            return (
              <td className="px-4 py-3">
                {answer ? (
                  <span
                    className={`inline-flex items-center rounded-sm px-2 py-0.5 text-sm font-medium ${answer}`}
                  >
                    {children}
                  </span>
                ) : (
                  children
                )}
              </td>
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),

          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element -- GIFs from markdown, no fixed size
            <img
              src={src}
              alt={alt ?? ""}
              loading="lazy"
              className="my-2 w-full rounded-2xl border border-border shadow-sm"
            />
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
