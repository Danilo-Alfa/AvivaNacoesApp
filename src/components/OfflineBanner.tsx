import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View className="bg-amber-500 px-4 py-2 flex-row items-center justify-center gap-2">
      <WifiOff size={16} color="#ffffff" />
      <Text className="text-white text-sm font-medium">
        Sem conexão - dados offline
      </Text>
    </View>
  );
}
