import { useState, useEffect } from "react";

/**
 * Returns `false` on first render, `true` after the first paint.
 *
 * Use this in heavy screens to show a skeleton on the initial render.
 * This lets the navigation animation start immediately (with a lightweight
 * skeleton) instead of waiting for the full component tree to mount.
 */
export function useScreenReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
