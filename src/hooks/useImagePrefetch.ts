import { useEffect } from 'react';
import { Image } from 'expo-image';

/**
 * Prefetches an array of image URLs to disk cache in the background.
 * Silently ignores failures — this is a best-effort optimization.
 */
export function useImagePrefetch(urls: (string | null | undefined)[]) {
  const key = urls.filter(Boolean).join(',');

  useEffect(() => {
    const validUrls = urls.filter((u): u is string => typeof u === 'string' && u.length > 0);
    if (validUrls.length === 0) return;

    Image.prefetch(validUrls, 'disk').catch(() => {});
  }, [key]);
}
