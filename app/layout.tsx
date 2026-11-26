import type { Metadata } from "next";
import { Figtree, Source_Code_Pro } from "next/font/google";
import { SITE_NAME, SITE_URL } from "./lib/blog";
import PostsHotReload from "./components/posts-hot-reload";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sourceCodePro = Source_Code_Pro({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Personal website of Tural Hajiyev. Frontend engineer writing about web architecture, product, and engineering practice.",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Personal website of Tural Hajiyev. Frontend engineer writing about web architecture, product, and engineering practice.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        {children}
        {process.env.NODE_ENV === "development" && <PostsHotReload />}
      </body>
    </html>
  );
}
