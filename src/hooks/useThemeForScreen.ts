import { useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "./useTheme";

/**
 * Same as `useTheme`, but freezes the `isDark` value while the screen is
 * **not focused** (i.e. behind another screen or the drawer).
 *
 * This avoids heavy re-renders of off-screen content when the user toggles
 * the theme from the drawer.  When the screen regains focus the ref is
 * updated synchronously during render, so the correct theme shows instantly
 * — no flash.
 *
 * Use `useTheme()` in always-visible components (header, drawer, footer).
 * Use `useThemeForScreen()` in route-level screen components.
 */
export function useThemeForScreen() {
  const { isDark, toggleTheme } = useTheme();
  const isFocused = useIsFocused();

  const stableIsDark = useRef(isDark);
  if (isFocused) {
    stableIsDark.current = isDark;
  }

  return { isDark: stableIsDark.current, toggleTheme };
}
