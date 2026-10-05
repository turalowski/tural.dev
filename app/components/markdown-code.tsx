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
      <code className="rounded-[6px] bg-[var(--inline-code-bg)] px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-[var(--inline-code-fg)]">
        {children}
      </code>
    );
  }

  const languageKey = match?.[1]?.toLowerCase() ?? "text";
  const language = LANGUAGE_ALIASES[languageKey] ?? languageKey;

  return (
    <SyntaxHighlighter
      language={language}
      useInlineStyles={false}
      PreTag="div"
      className="code-block my-6 overflow-x-auto rounded-xl border border-[var(--code-border)] bg-[var(--code-bg)] p-5 font-mono text-sm leading-relaxed text-[var(--code-fg)]"
    >
      {raw}
    </SyntaxHighlighter>
  );
}
