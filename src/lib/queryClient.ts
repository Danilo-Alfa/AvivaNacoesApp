import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GC_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: GC_TIME,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'aviva-query-cache',
});

// Persist options for PersistQueryClientProvider
export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: GC_TIME, // match gcTime — without this it defaults to 24h
  dehydrateOptions: {
    shouldDehydrateQuery: (query: any) => {
      // Only persist successful queries (don't persist errors)
      return query.state.status === 'success';
    },
  },
};
