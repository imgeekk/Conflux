"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Forces light theme while mounted. Restores the user's previous
 * theme choice when the component unmounts (i.e. on navigation away).
 */
export function useLightTheme() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const prev = theme;
    setTheme("light");
    return () => setTheme(prev ?? "dark");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
