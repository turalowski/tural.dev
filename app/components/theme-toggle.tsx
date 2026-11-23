"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/app/components/ui/button";
import { THEME_STORAGE_KEY } from "@/app/lib/theme";

export default function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  };

  // Icons switch through the `dark` class, so server and client render the same markup.
  return (
    <Button variant="outline" size="icon" onClick={toggle}>
      <MoonIcon className="h-4 w-4 dark:hidden" />
      <SunIcon className="hidden h-4 w-4 dark:block" />
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
}
