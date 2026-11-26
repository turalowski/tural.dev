"use client";

import type { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  plaintext: "text",
  plain: "text",
  sh: "bash",
  shell: "bash",
};

type MarkdownCodeProps = {
  className?: string;
  children?: ReactNode;
};

export default function MarkdownCode({
  className,
  children,
}: MarkdownCodeProps) {
  const match = /language-([\w-]+)/.exec(className || "");
  const raw = String(children).replace(/\n$/, "");
  const isBlock = Boolean(match) || raw.includes("\n");

  if (!isBlock) {
    return (
      <code className="rounded-lg bg-[var(--inline-code-bg)] px-2 py-0.5 font-mono text-[0.875em] font-medium text-[var(--inline-code-fg)]">
        {children}
      </code>
    );
  }

  const languageKey = match?.[1]?.toLowerCase() ?? "text";
  // ```diagram blocks hold box-drawing art (─ │ ┌ ▶). The web mono font's latin
  // subset lacks those glyphs, so the browser mixes in a fallback font with other
  // widths and the boxes drift. System mono fonts cover them at a uniform width.
  const isDiagram = languageKey === "diagram";
  const language = isDiagram
    ? "text"
    : LANGUAGE_ALIASES[languageKey] ?? languageKey;

  return (
    <SyntaxHighlighter
      language={language}
      useInlineStyles={false}
      // The default codeTagProps inline the Prism light theme (black text, white
      // text-shadow, Consolas) even with useInlineStyles off; colors come from CSS.
      codeTagProps={{ className: `language-${language}` }}
      PreTag="div"
      className={`code-block my-6 overflow-x-auto rounded-2xl border border-[var(--code-border)] bg-[var(--code-bg)] p-6 shadow-sm text-sm text-[var(--code-fg)] ${
        isDiagram
          ? "diagram-block leading-[normal]"
          : "font-mono leading-relaxed"
      }`}
    >
      {raw}
    </SyntaxHighlighter>
  );
}
