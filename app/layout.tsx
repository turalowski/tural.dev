import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from "./lib/blog";
import "./globals.css";

const source_code_pro = Source_Code_Pro({ subsets: ["latin"] });

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
    creator: TWITTER_HANDLE,
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
    <html lang="en" suppressHydrationWarning>
      <body className={source_code_pro.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
