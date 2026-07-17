import { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
