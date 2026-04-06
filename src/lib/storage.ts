import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache for synchronous reads (populated on app start)
const cache: Record<string, string> = {};

// Initialize cache from AsyncStorage
export async function initStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [key, value] of pairs) {
      if (value !== null) {
        cache[key] = value;
      }
    }
  } catch {
    // Silently fail - cache will be populated on individual reads
  }
}

export const mmkvStorage = {
  getItem: (key: string): string | null => {
    return cache[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    cache[key] = value;
    AsyncStorage.setItem(key, value).catch(() => {});
  },
  removeItem: (key: string): void => {
    delete cache[key];
    AsyncStorage.removeItem(key).catch(() => {});
  },
};

// Also export a clearAll utility for the "More" screen
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    Object.keys(cache).forEach((key) => delete cache[key]);
  } catch {
    // ignore
  }
}
