import { useColorScheme } from "nativewind";
import { useCallback } from "react";
import { mmkvStorage } from "@/lib/storage";

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  const toggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    mmkvStorage.setItem("theme_mode", next);
  }, [isDark, setColorScheme]);

  return { isDark, toggleTheme };
}
