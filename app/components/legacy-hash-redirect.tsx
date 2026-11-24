"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Old shared links pointed at /#slug when every post lived on the home page.
export default function LegacyHashRedirect({ slugs }: { slugs: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (slugs.includes(slug)) router.replace(`/blog/${slug}`);
  }, [slugs, router]);

  return null;
}
