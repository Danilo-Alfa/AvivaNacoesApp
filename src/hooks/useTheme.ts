import { useColorScheme } from "nativewind";
import { useCallback, useRef } from "react";
import { mmkvStorage } from "@/lib/storage";

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  // Ref keeps current value without adding isDark as a dependency,
  // so toggleTheme has a stable identity across theme changes.
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const toggleTheme = useCallback(() => {
    const next = isDarkRef.current ? "light" : "dark";
    setColorScheme(next);
    mmkvStorage.setItem("theme_mode", next);
  }, [setColorScheme]);

  return { isDark, toggleTheme };
}
