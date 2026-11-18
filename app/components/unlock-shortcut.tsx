"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SEQUENCE = "/unlock";
const COOKIE = "hidden_posts";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Typing "/unlock" anywhere on the page toggles hidden posts on and off.
export default function UnlockShortcut() {
  const router = useRouter();

  useEffect(() => {
    let typed = "";
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;

      typed = (typed + e.key.toLowerCase()).slice(-SEQUENCE.length);
      if (typed !== SEQUENCE) return;
      typed = "";

      const unlocked = document.cookie
        .split("; ")
        .includes(`${COOKIE}=1`);
      document.cookie = unlocked
        ? `${COOKIE}=; path=/; max-age=0`
        : `${COOKIE}=1; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      router.refresh();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}
