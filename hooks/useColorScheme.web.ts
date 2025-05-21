import { useEffect, useState } from "react";

export function useColorScheme(): "light" | "dark" {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(() => {
    // Check if matchMedia is supported
    if (typeof window !== "undefined" && window.matchMedia) {
      // Use matchMedia to check if the user has a color scheme preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light"; // Default to light if matchMedia is not supported
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    };

    // Add listener for theme changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return colorScheme;
}
