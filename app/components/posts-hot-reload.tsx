"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostsHotReload() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/dev/posts-watch");
    source.onmessage = () => router.refresh();
    return () => source.close();
  }, [router]);

  return null;
}
