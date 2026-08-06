"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

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
  children?: React.ReactNode;
};

export default function MarkdownCode({
  className,
  children,
}: MarkdownCodeProps) {
  const match = /language-([\w-]+)/.exec(className || "");
  const raw = String(children).replace(/\n$/, "");
  const isBlock = Boolean(match) || raw.includes("\n");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isBlock) {
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-md font-mono">
        {children}
      </code>
    );
  }

  const languageKey = match?.[1]?.toLowerCase() ?? "text";
  const language = LANGUAGE_ALIASES[languageKey] ?? languageKey;
  const style =
    mounted && resolvedTheme === "light" ? oneLight : oneDark;

  return (
    <SyntaxHighlighter
      language={language}
      style={style}
      PreTag="div"
      customStyle={{
        margin: "0 0 1rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        lineHeight: 1.6,
      }}
      codeTagProps={{
        style: {
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        },
      }}
    >
      {raw}
    </SyntaxHighlighter>
  );
}
