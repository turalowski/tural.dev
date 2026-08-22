declare module "react-syntax-highlighter" {
  import { ComponentType, CSSProperties, ReactNode } from "react";

  export type SyntaxHighlighterProps = {
    language?: string;
    style?: Record<string, CSSProperties>;
    customStyle?: CSSProperties;
    codeTagProps?: {
      style?: CSSProperties;
      className?: string;
    };
    PreTag?: keyof JSX.IntrinsicElements | ComponentType<{ children?: ReactNode }>;
    children?: string;
    showLineNumbers?: boolean;
    wrapLongLines?: boolean;
  };

  export const Prism: ComponentType<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  import { CSSProperties } from "react";

  export const oneDark: Record<string, CSSProperties>;
}

