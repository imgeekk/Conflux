"use client";

import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="inline-flex animate-theme-icon items-center justify-center">
        {isDark ? <Sun key="sun" weight="bold" /> : <Moon key="moon" weight="bold" />}
      </span>
    </Button>
  );
}
